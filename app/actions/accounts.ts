'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getAccounts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
  });

  return accounts;
}

export async function getAccountById(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      transactions: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!account || account.userId !== session.user.id) {
    throw new Error('Account not found');
  }

  return account;
}

export async function getAccountTransactions(accountId: string, limit: number = 50) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });

  if (!account || account.userId !== session.user.id) {
    throw new Error('Account not found');
  }

  const transactions = await prisma.transaction.findMany({
    where: { accountId },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  return transactions;
}
