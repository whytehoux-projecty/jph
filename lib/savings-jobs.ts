import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { formatAmount } from '@/lib/format';
import { InsufficientFunds, moveIntoGoal } from '@/lib/savings-money';
import { nextContributionDate, type Frequency } from '@/lib/savings-schedule';

/** Goals handled per run; anything left over is picked up by the next run. */
const BATCH = 200;

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function emailHtml(heading: string, body: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  const link = base ? `<p><a href="${base}/savings">Open Savings in online banking</a></p>` : '';
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>${escapeHtml(heading)}</h2>
  <p>${escapeHtml(body)}</p>
  ${link}
  <p style="color:#666;font-size:12px;">You're receiving this because you set up a savings goal. You can change or turn off its schedule in Savings.</p>
</div>`;
}

/** Tells the customer in the portal and, where email is set up, by email. */
async function notify(userId: string, email: string | null, title: string, message: string) {
  await prisma.notification.create({ data: { userId, title, message } });
  if (!email) return;
  try {
    await sendEmail({ to: email, subject: title, html: emailHtml(title, message) });
  } catch {
    // sendEmail already logged the failure (without the recipient); the
    // portal notification above is the record the customer sees.
  }
}

export interface SavingsRunSummary {
  due: number;
  saved: number;
  reminded: number;
  skipped: number;
}

/**
 * Runs every savings contribution due by `now`:
 * - AUTO: moves the amount from the linked account into the goal (capped at
 *   what's left to reach the target), or says why it couldn't.
 * - MANUAL: sends the reminder.
 * Each goal is claimed by moving its next date forward first, so a repeated
 * or overlapping run never handles the same day twice.
 */
export async function runDueSavingsContributions(now = new Date()): Promise<SavingsRunSummary> {
  const due = await prisma.savingsGoal.findMany({
    where: { contributionMode: { in: ['AUTO', 'MANUAL'] }, nextContributionAt: { lte: now } },
    include: { user: { select: { email: true } }, account: true },
    orderBy: { nextContributionAt: 'asc' },
    take: BATCH,
  });

  const summary: SavingsRunSummary = { due: due.length, saved: 0, reminded: 0, skipped: 0 };

  for (const goal of due) {
    const frequency = goal.frequency as Frequency | null;
    const amount = goal.contributionAmount ?? 0;
    if (!frequency || goal.scheduleDay === null || amount <= 0 || !goal.nextContributionAt) {
      await prisma.savingsGoal.update({ where: { id: goal.id }, data: { contributionMode: 'NONE', nextContributionAt: null } });
      summary.skipped++;
      continue;
    }

    const claimed = await prisma.savingsGoal.updateMany({
      where: { id: goal.id, nextContributionAt: goal.nextContributionAt },
      data: { nextContributionAt: nextContributionDate(frequency, goal.scheduleDay, now) },
    });
    if (claimed.count === 0) continue;

    const email = goal.user.email || null;
    const account = goal.account;
    const usable = account && account.userId === goal.userId && !account.isExternal && account.status === 'ACTIVE';
    const money = (n: number) => formatAmount(n, { currency: account?.currency || 'USD' }) ?? `$${n}`;

    if (!usable) {
      await prisma.savingsGoal.update({ where: { id: goal.id }, data: { contributionMode: 'NONE', nextContributionAt: null } });
      await notify(goal.userId, email, 'Savings schedule paused', `The account linked to your goal "${goal.name}" can no longer be used, so its schedule has been turned off. Choose another account in Savings to start again.`);
      summary.skipped++;
      continue;
    }

    if (goal.contributionMode === 'MANUAL') {
      await notify(goal.userId, email, `Time to save towards ${goal.name}`, `Your plan is to save ${money(amount)} towards "${goal.name}" today. Sign in to online banking and choose Add money on the goal.`);
      summary.reminded++;
      continue;
    }

    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    if (remaining <= 0) {
      await prisma.savingsGoal.update({ where: { id: goal.id }, data: { contributionMode: 'NONE', nextContributionAt: null } });
      await notify(goal.userId, email, `You've reached ${goal.name}`, `Your goal "${goal.name}" is fully saved, so automatic saving has stopped.`);
      summary.skipped++;
      continue;
    }

    const toSave = Math.min(amount, remaining);
    try {
      await moveIntoGoal({
        goalId: goal.id,
        goalName: goal.name,
        accountId: account.id,
        amount: toSave,
        reference: `SAV-${randomBytes(5).toString('hex').toUpperCase()}`,
        automatic: true,
      });
      await notify(goal.userId, email, `Saved ${money(toSave)} towards ${goal.name}`, `We moved ${money(toSave)} from your account into your goal "${goal.name}", as planned.`);
      summary.saved++;
    } catch (err) {
      const reason = err instanceof InsufficientFunds ? 'there wasn\'t enough money in the linked account' : 'something went wrong on our side';
      await notify(goal.userId, email, `We couldn't save towards ${goal.name}`, `Today's automatic saving of ${money(toSave)} for "${goal.name}" didn't happen because ${reason}. We'll try again on the next scheduled day.`);
      summary.skipped++;
    }
  }

  return summary;
}
