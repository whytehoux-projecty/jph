'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function handleApproveTransaction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  const tx = await prisma.transaction.findUnique({ where: { id }, include: { account: true } });
  if (!tx) return;

  // Deduct or Add Balance
  const newBalance = tx.type === 'DEBIT' ? tx.account.balance - tx.amount : tx.account.balance + tx.amount;
  
  await prisma.account.update({
    where: { id: tx.accountId },
    data: { balance: newBalance }
  });

  await prisma.transaction.update({
    where: { id },
    data: { status: 'APPROVED', processedAt: new Date() }
  });

  revalidatePath('/admin/finance/transactions');
}

export async function handleRejectTransaction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  await prisma.transaction.update({
    where: { id },
    data: { status: 'REJECTED', processedAt: new Date() }
  });
  
  revalidatePath('/admin/finance/transactions');
}

export async function handleCancelTransaction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  await prisma.transaction.update({
    where: { id },
    data: { status: 'CANCELLED', processedAt: new Date() }
  });
  
  revalidatePath('/admin/finance/transactions');
}
