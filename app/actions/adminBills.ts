'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function handleApproveBill(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  const bill = await prisma.bill.findUnique({ where: { id }, include: { account: true } });
  if (!bill) return;

  await prisma.account.update({
    where: { id: bill.accountId },
    data: { balance: bill.account.balance - bill.amount }
  });

  await prisma.transaction.create({
    data: {
      accountId: bill.accountId,
      type: 'DEBIT',
      transactionType: 'LOCAL_TRANSFER',
      amount: -bill.amount,
      status: 'APPROVED',
      description: `Bill Payment`,
      reference: `BILL-${bill.id.substring(0, 8)}`,
    }
  });

  await prisma.bill.update({
    where: { id },
    data: { status: 'PAID', paidAt: new Date() }
  });
  
  revalidatePath('/admin/finance/bills');
}

export async function handleRejectBill(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  await prisma.bill.update({
    where: { id },
    data: { status: 'REJECTED' }
  });
  
  revalidatePath('/admin/finance/bills');
}
