'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function handleApproveTransaction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  const adminNote = formData.get('adminNote') as string | null;
  const rawModifiedAmount = formData.get('modifiedAmount') as string | null;
  
  const tx = await prisma.transaction.findUnique({ where: { id }, include: { account: true } });
  if (!tx) return;

  const finalAmount = rawModifiedAmount ? parseFloat(rawModifiedAmount) : tx.amount;

  // Deduct or Add Balance
  const newBalance = tx.type === 'DEBIT' ? tx.account.balance - finalAmount : tx.account.balance + finalAmount;
  
  await prisma.account.update({
    where: { id: tx.accountId },
    data: { balance: newBalance }
  });

  await prisma.transaction.update({
    where: { id },
    data: { 
      status: 'APPROVED', 
      processedAt: new Date(),
      adminNote,
      modifiedAmount: finalAmount !== tx.amount ? finalAmount : null,
    }
  });

  // Also create a notification for the user
  await prisma.notification.create({
    data: {
      userId: tx.account.userId,
      title: 'Transfer Approved',
      message: `Your transfer of ${finalAmount.toFixed(2)} ${tx.currency} (Ref: ${tx.reference}) has been approved and processed.`,
    }
  });

  revalidatePath('/admin/finance/transactions');
  revalidatePath('/admin/ebank/transfers');
}

export async function handleRejectTransaction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  const rejectionReason = formData.get('rejectionReason') as string | null;

  const tx = await prisma.transaction.update({
    where: { id },
    data: { 
      status: 'REJECTED', 
      processedAt: new Date(),
      rejectionReason 
    },
    include: { account: true }
  });

  // Notify the user
  await prisma.notification.create({
    data: {
      userId: tx.account.userId,
      title: 'Transfer Rejected',
      message: `Your transfer of ${tx.amount.toFixed(2)} ${tx.currency} (Ref: ${tx.reference}) was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
    }
  });
  
  revalidatePath('/admin/finance/transactions');
  revalidatePath('/admin/ebank/transfers');
}

export async function handleCancelTransaction(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  const adminNote = formData.get('adminNote') as string | null;

  const tx = await prisma.transaction.update({
    where: { id },
    data: { 
      status: 'CANCELLED', 
      processedAt: new Date(),
      adminNote
    },
    include: { account: true }
  });
  
  await prisma.notification.create({
    data: {
      userId: tx.account.userId,
      title: 'Transfer Cancelled',
      message: `Your transfer of ${tx.amount.toFixed(2)} ${tx.currency} (Ref: ${tx.reference}) was cancelled.`,
    }
  });

  revalidatePath('/admin/finance/transactions');
  revalidatePath('/admin/ebank/transfers');
}
