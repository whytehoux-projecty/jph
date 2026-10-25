import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { verifyPassword } from '@/lib/password';
import { BRAND } from '@/src/content/facts';

/** Wrong passwords in a row before sign-in is paused. */
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCK_MINUTES = 15;

export type PasswordCheck = { ok: true } | { ok: false; lockedUntil?: Date };

type Who = { kind: 'customer' | 'admin'; id: string; email: string; stored: string };

/**
 * Checks a password with a limit on wrong tries, for customers and staff.
 *
 * Each try is claimed in the database before the password is compared, and
 * only while fewer than MAX_LOGIN_ATTEMPTS are used, so a burst of parallel
 * guesses can't test more passwords than the limit. After the limit, sign-in
 * is paused for LOGIN_LOCK_MINUTES and the person is emailed. Only a correct
 * password resets the count.
 */
export async function checkPasswordWithLimit(who: Who, password: string, legacyUpgrade?: (hash: string) => Promise<unknown>): Promise<PasswordCheck> {
  const table = who.kind === 'customer' ? prisma.user : prisma.adminUser;
  // Both tables have the same two columns; the cast keeps one code path.
  const t = table as unknown as typeof prisma.user;
  const now = new Date();

  await t.updateMany({ where: { id: who.id, loginLockedUntil: { lte: now } }, data: { loginLockedUntil: null, loginFailedAttempts: 0 } });
  const claimed = await t.updateMany({
    where: { id: who.id, loginLockedUntil: null, loginFailedAttempts: { lt: MAX_LOGIN_ATTEMPTS } },
    data: { loginFailedAttempts: { increment: 1 } },
  });
  if (claimed.count === 0) return { ok: false, lockedUntil: await startLock(t, who, now) };

  const matches = await verifyPassword(password, who.stored, legacyUpgrade ? { legacyPlaintext: true, onUpgrade: legacyUpgrade } : {});
  if (matches) {
    await t.update({ where: { id: who.id }, data: { loginFailedAttempts: 0, loginLockedUntil: null } });
    return { ok: true };
  }

  const row = await t.findUnique({ where: { id: who.id }, select: { loginFailedAttempts: true } });
  if ((row?.loginFailedAttempts ?? 0) >= MAX_LOGIN_ATTEMPTS) return { ok: false, lockedUntil: await startLock(t, who, now) };
  return { ok: false };
}

async function startLock(t: typeof prisma.user, who: Who, now: Date): Promise<Date> {
  const until = new Date(now.getTime() + LOGIN_LOCK_MINUTES * 60_000);
  const started = await t.updateMany({
    where: { id: who.id, loginLockedUntil: null, loginFailedAttempts: { gte: MAX_LOGIN_ATTEMPTS } },
    data: { loginLockedUntil: until },
  });
  if (started.count === 0) {
    const row = await t.findUnique({ where: { id: who.id }, select: { loginLockedUntil: true } });
    return row?.loginLockedUntil ?? until;
  }
  if (who.kind === 'customer') {
    await prisma.notification.create({
      data: { userId: who.id, title: 'Sign-in paused', message: `Your password was entered wrongly ${MAX_LOGIN_ATTEMPTS} times, so sign-in was paused for ${LOGIN_LOCK_MINUTES} minutes. If this wasn't you, change your password and contact us.` },
    });
  }
  try {
    await sendEmail({
      to: who.email,
      subject: `${BRAND.vault}: sign-in paused after wrong passwords`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Sign-in paused</h2><p>Someone entered the wrong password for your ${BRAND.vault} ${who.kind === 'admin' ? 'staff ' : ''}sign-in ${MAX_LOGIN_ATTEMPTS} times, so sign-in is paused for ${LOGIN_LOCK_MINUTES} minutes.</p><p>If this wasn't you, reset your password and contact us.</p></div>`,
    });
  } catch {
    // sendEmail logs failures without the recipient.
  }
  return until;
}

export function minutesLeft(until: Date) {
  return Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60_000));
}
