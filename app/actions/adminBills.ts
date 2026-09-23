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
  
  revalidatePath('/admin/ebank/bill-services');
}

export async function handleRejectBill(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  await prisma.bill.update({
    where: { id },
    data: { status: 'REJECTED' }
  });
  
  revalidatePath('/admin/ebank/bill-services');
}

export async function handleCreatePayee(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const accountNumber = formData.get('accountNumber') as string;
  const category = (formData.get('category') as string) || 'UTILITIES';
  const country = (formData.get('country') as string) || 'usa';
  let userId = formData.get('userId') as string;

  if (!name || !accountNumber) {
    throw new Error('Name and Account Number are required.');
  }

  // If no userId provided, attach to the first available user in the system
  if (!userId) {
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) throw new Error('No user accounts exist to associate this payee with.');
    userId = firstUser.id;
  }

  await prisma.payee.create({
    data: {
      userId,
      name,
      accountNumber,
      category,
      country
    }
  });

  revalidatePath('/admin/ebank/bill-services');
}

export async function handleDeletePayee(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;

  await prisma.payee.delete({
    where: { id }
  });

  revalidatePath('/admin/ebank/bill-services');
}
