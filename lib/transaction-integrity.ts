import { prisma } from './prisma';

/**
 * Re-calculates the running balance of all transactions for a given account.
 * Follows strict chronological order based on `createdAt`.
 * If multiple transactions share the exact same timestamp, it uses `id` as a tie-breaker.
 * 
 * Returns the final balance that should be written to Account.balance.
 */
export async function recalculateRunningBalances(accountId: string): Promise<number> {
  const transactions = await prisma.transaction.findMany({
    where: { accountId },
    orderBy: [
      { createdAt: 'asc' },
      { id: 'asc' }
    ]
  });

  let runningBalance = 0.0;

  for (const tx of transactions) {
    // Only approved/completed transactions generally affect running balance 
    // depending on bank logic. However, for admin playground, we'll apply all non-cancelled, non-rejected txs.
    if (tx.status === 'REJECTED' || tx.status === 'CANCELLED') {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { runningBalance }
      });
      continue;
    }

    const isCredit = tx.type === 'CREDIT';
    runningBalance += isCredit ? tx.amount : -tx.amount;

    await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        runningBalance
      }
    });
  }

  // Also update the account balance to match
  await prisma.account.update({
    where: { id: accountId },
    data: {
      balance: runningBalance
    }
  });

  return runningBalance;
}
