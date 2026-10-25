'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getTransactions(filters?: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const limit = filters?.limit || 100;
  const accounts = await prisma.account.findMany({ where: { userId: session.user.id } });
  let accountIds = accounts.map(a => a.id);
  // Optional single-account filter, restricted to the customer's own accounts.
  if (typeof filters?.accountId === 'string') {
    accountIds = accountIds.filter(id => id === filters.accountId);
  }

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

  const now = new Date();
  const since =
    period === 'week'
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : period === 'year'
      ? new Date(now.getFullYear(), 0, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      accountId: { in: accountIds },
      createdAt: { gte: since },
      status: { not: 'REJECTED' },
    },
  });

  const income = transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0);

  return { income, expenses };
}

export interface TransactionQuery {
  accountId?: string;
  /** Inclusive dates, YYYY-MM-DD, in the customer's calendar. */
  from?: string;
  to?: string;
  direction?: 'in' | 'out';
  status?: 'pending' | 'completed' | 'declined' | 'cancelled' | 'disputed';
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
}

const STATUS_GROUPS: Record<NonNullable<TransactionQuery['status']>, string[]> = {
  pending: ['PENDING', 'ON_HOLD', 'PROCESSING'],
  completed: ['APPROVED', 'COMPLETED'],
  declined: ['REJECTED', 'FAILED'],
  cancelled: ['CANCELLED'],
  disputed: ['DISPUTED'],
};

async function transactionWhere(userId: string, q: TransactionQuery) {
  const accounts = await prisma.account.findMany({ where: { userId }, select: { id: true } });
  let accountIds = accounts.map(a => a.id);
  if (q.accountId) accountIds = accountIds.filter(id => id === q.accountId);

  const where: any = { accountId: { in: accountIds } };
  if (q.from || q.to) {
    where.createdAt = {};
    if (q.from) where.createdAt.gte = new Date(`${q.from}T00:00:00`);
    if (q.to) where.createdAt.lte = new Date(`${q.to}T23:59:59.999`);
  }
  if (q.direction) where.type = q.direction === 'in' ? 'CREDIT' : 'DEBIT';
  if (q.status) where.status = { in: STATUS_GROUPS[q.status] };
  if (q.minAmount !== undefined || q.maxAmount !== undefined) {
    where.amount = {};
    if (q.minAmount !== undefined) where.amount.gte = q.minAmount;
    if (q.maxAmount !== undefined) where.amount.lte = q.maxAmount;
  }
  const s = q.search?.trim();
  if (s) {
    where.OR = [
      { description: { contains: s, mode: 'insensitive' } },
      { reference: { contains: s, mode: 'insensitive' } },
      { counterparty: { contains: s, mode: 'insensitive' } },
    ];
  }
  return where;
}

/** One page of the customer's transactions, newest first, with the total count. */
export async function queryTransactions(q: TransactionQuery = {}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const pageSize = Math.min(Math.max(q.pageSize ?? 25, 1), 100);
  const page = Math.max(q.page ?? 1, 1);
  const where = await transactionWhere(session.user.id, q);

  const [rows, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { account: { select: { accountNumber: true, accountType: true, currency: true } } },
    }),
    prisma.transaction.count({ where }),
  ]);
  return { rows, total, page, pageSize };
}

/** Every transaction matching the filters (capped) for a CSV download. */
export async function exportTransactions(q: TransactionQuery = {}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const where = await transactionWhere(session.user.id, q);
  return prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 5000,
    include: { account: { select: { accountNumber: true, accountType: true } } },
  });
}

/** Number of the customer's transactions still awaiting processing. */
export async function countPendingTransactions() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  return prisma.transaction.count({
    where: { account: { userId: session.user.id }, status: 'PENDING' },
  });
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
