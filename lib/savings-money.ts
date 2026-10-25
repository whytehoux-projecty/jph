import { prisma } from '@/lib/prisma';

/**
 * Money movements for savings goals, shared by the portal's server actions
 * and the daily job. Deliberately not a 'use server' module: nothing here may
 * be callable from the browser.
 */

export class InsufficientFunds extends Error {}

/**
 * The one place money moves into a goal: debits the account only if the
 * balance covers it, credits the goal and records the transaction, all in one
 * database transaction. Used by manual saving and by the daily job.
 */
export async function moveIntoGoal({
  goalId,
  goalName,
  accountId,
  amount,
  reference: ref,
  automatic,
}: {
  goalId: string;
  goalName: string;
  accountId: string;
  amount: number;
  reference: string;
  automatic: boolean;
}) {
  await prisma.$transaction(async (db) => {
    const debited = await db.account.updateMany({
      where: { id: accountId, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });
    if (debited.count === 0) throw new InsufficientFunds('The amount is more than the available balance of this account.');
    const account = await db.account.findUniqueOrThrow({ where: { id: accountId }, select: { balance: true, currency: true } });
    await db.savingsGoal.update({ where: { id: goalId }, data: { currentAmount: { increment: amount } } });
    await db.transaction.create({
      data: {
        accountId,
        type: 'DEBIT',
        transactionType: 'SAVINGS_ALLOCATION',
        amount,
        currency: account.currency,
        status: 'COMPLETED',
        description: `${automatic ? 'Automatic saving' : 'Saved'} · ${goalName}`,
        reference: ref,
        category: 'SAVINGS',
        channel: automatic ? 'SCHEDULED' : 'PORTAL',
        methodId: 'savings_plan',
        processedAt: new Date(),
        runningBalance: account.balance,
        metadata: JSON.stringify({ goalId, goalName, automatic }),
      },
    });
  });
}
