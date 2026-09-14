'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getTransactions(filters?: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const limit = filters?.limit || 100;
  const accounts = await prisma.account.findMany({ where: { userId: session.user.id } });
  const accountIds = accounts.map(a => a.id);

  const transactions = await prisma.transaction.findMany({
    where: { accountId: { in: accountIds } },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return transactions;
}

export async function getTransactionStats(period: 'week' | 'month' | 'year' = 'month') {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({ where: { userId: session.user.id } });
  const accountIds = accounts.map(a => a.id);

  // Note: in a real app, calculate based on `period` date ranges.
  // For demo, just sum up recent ones.
  const transactions = await prisma.transaction.findMany({
    where: { accountId: { in: accountIds } }
  });

  const income = transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0);

  return { income, expenses };
}

export async function getRecentTransactions(limit: number = 5) {
  return getTransactions({ limit });
}

export async function updateCategory(id: string, category: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const tx = await prisma.transaction.findUnique({ where: { id }, include: { account: true } });
  if (!tx || tx.account.userId !== session.user.id) throw new Error('Not found or unauthorized');

  const metadata = tx.metadata ? JSON.parse(tx.metadata) : {};
  metadata.category = category;

  await prisma.transaction.update({
    where: { id },
    data: { metadata: JSON.stringify(metadata) }
  });

  return { success: true };
}

export async function addNote(id: string, note: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const tx = await prisma.transaction.findUnique({ where: { id }, include: { account: true } });
  if (!tx || tx.account.userId !== session.user.id) throw new Error('Not found or unauthorized');

  const metadata = tx.metadata ? JSON.parse(tx.metadata) : {};
  metadata.note = note;

  await prisma.transaction.update({
    where: { id },
    data: { metadata: JSON.stringify(metadata) }
  });

  return { success: true };
}

export async function disputeTransaction(id: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const tx = await prisma.transaction.findUnique({ where: { id }, include: { account: true } });
  if (!tx || tx.account.userId !== session.user.id) throw new Error('Not found or unauthorized');

  const metadata = tx.metadata ? JSON.parse(tx.metadata) : {};
  metadata.disputeReason = data.reason;

  await prisma.transaction.update({
    where: { id },
    data: { 
      status: 'DISPUTED',
      metadata: JSON.stringify(metadata) 
    }
  });

  return { success: true };
}

export async function exportReceiptData(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const tx = await prisma.transaction.findUnique({ 
    where: { id },
    include: { account: true }
  });

  if (!tx || tx.account.userId !== session.user.id) throw new Error('Not found or unauthorized');

  return tx;
}
