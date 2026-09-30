'use server';

import { prisma } from '@/lib/prisma';
import { recalculateRunningBalances } from '@/lib/transaction-integrity';
import { generateRandom, generateTargeted, RandomGeneratorConfig, TargetedGeneratorConfig } from '@/lib/tx-generator';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function adminGetCustomerTransactions(accountId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const transactions = await prisma.transaction.findMany({
    where: { accountId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
  });
  
  return transactions;
}

export async function adminCreateTransaction(data: any) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const tx = await prisma.transaction.create({
    data: {
      accountId: data.accountId,
      type: data.type,
      transactionType: data.transactionType,
      amount: data.amount,
      currency: data.currency || 'USD',
      status: data.status,
      description: data.description,
      reference: data.reference || `ADM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      category: data.category,
      channel: data.channel,
      counterparty: data.counterparty,
      isAdminEntry: true,
      adminAuditTrail: JSON.stringify([{ action: 'CREATED', by: session?.user?.email, at: new Date() }]),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    }
  });

  await recalculateRunningBalances(data.accountId);
  revalidatePath('/admin/customers/account-holders');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  return tx;
}

export async function adminUpdateTransaction(id: string, data: any) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) throw new Error('Not found');

  const audit = existing.adminAuditTrail ? JSON.parse(existing.adminAuditTrail) : [];
  audit.push({ action: 'UPDATED', by: session?.user?.email, at: new Date(), changes: data });

  const tx = await prisma.transaction.update({
    where: { id },
    data: {
      type: data.type,
      transactionType: data.transactionType,
      amount: data.amount,
      status: data.status,
      description: data.description,
      category: data.category,
      channel: data.channel,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      counterparty: data.counterparty,
      adminAuditTrail: JSON.stringify(audit)
    }
  });

  await recalculateRunningBalances(existing.accountId);
  revalidatePath('/admin/customers/account-holders');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  return tx;
}

export async function adminDeleteTransaction(id: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) return;

  await prisma.transaction.delete({ where: { id } });
  await recalculateRunningBalances(tx.accountId);
  revalidatePath('/admin/customers/account-holders');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

export async function adminBulkCreateTransactions(accountId: string, txs: any[]) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  await prisma.transaction.createMany({
    data: txs
  });

  await recalculateRunningBalances(accountId);
  revalidatePath('/admin/customers/account-holders');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

export async function adminGenerateRandomTransactions(config: RandomGeneratorConfig) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const txs = generateRandom(config);
  await adminBulkCreateTransactions(config.accountId, txs);
}

export async function adminGenerateTargetedTransactions(config: TargetedGeneratorConfig) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const result = generateTargeted(config);
  if (!result.ok) throw new Error(result.error);
  await adminBulkCreateTransactions(config.accountId, result.transactions);
}

export async function adminResetTransactionHistory(accountId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.transaction.deleteMany({ where: { accountId, isAdminEntry: true } });
  await recalculateRunningBalances(accountId);
  revalidatePath('/admin/customers/account-holders');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}
