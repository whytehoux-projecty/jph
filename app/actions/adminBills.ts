'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

/** The pending transaction a portal bill payment created (its metadata carries the bill id). */
function billTransactionWhere(billId: string, accountId: string) {
  return {
    accountId,
    transactionType: 'BILL_PAYMENT',
    status: 'PENDING',
    metadata: { contains: `"billId":"${billId}"` },
  };
}

export async function handleApproveBill(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;

  const bill = await prisma.bill.findUnique({
    where: { id },
    include: { account: true, payee: true },
  });
  if (!bill) throw new Error('Bill not found');
  if (bill.status === 'PAID') return;
  if (bill.status !== 'PENDING') throw new Error('Only pending bills can be approved.');

  // Claim the bill, check the balance and debit in one transaction, so a
  // double click can't pay twice and the account can't go negative.
  await prisma.$transaction(async (db) => {
    const claimed = await db.bill.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'PAID', paidAt: new Date() },
    });
    if (claimed.count === 0) throw new Error('This bill was already processed.');

    const debited = await db.account.updateMany({
      where: { id: bill.accountId, balance: { gte: bill.amount } },
      data: { balance: { decrement: bill.amount } },
    });
    if (debited.count === 0) throw new Error('The account balance no longer covers this bill.');
    const { balance } = await db.account.findUniqueOrThrow({ where: { id: bill.accountId }, select: { balance: true } });

    const pendingTx = await db.transaction.findFirst({ where: billTransactionWhere(bill.id, bill.accountId) });
    if (pendingTx) {
      await db.transaction.update({
        where: { id: pendingTx.id },
        data: { status: 'APPROVED', processedAt: new Date(), runningBalance: balance },
      });
    } else {
      // Bills created outside the portal have no transaction yet.
      await db.transaction.create({
        data: {
          accountId: bill.accountId,
          type: 'DEBIT',
          transactionType: 'BILL_PAYMENT',
          amount: bill.amount,
          status: 'APPROVED',
          description: `Bill payment · ${bill.payee?.name || 'Biller'}`,
          reference: `BIL-${bill.id.substring(0, 8).toUpperCase()}`,
          processedAt: new Date(),
          runningBalance: balance,
          category: 'BILLS',
          channel: 'PORTAL',
          metadata: JSON.stringify({ billId: bill.id, payeeName: bill.payee?.name, accountNumber: bill.payee?.accountNumber }),
        },
      });
    }
  });

  await prisma.notification.create({
    data: {
      userId: bill.account.userId,
      title: 'Bill payment sent',
      message: `Your payment of $${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${bill.payee?.name || 'your biller'} has been sent from your ${bill.account.accountType} account.`,
    }
  });

  revalidatePath('/admin/ebank/bill-services');
  revalidatePath('/admin/transactions');
  revalidatePath('/bills');
  revalidatePath('/dashboard');
  revalidatePath('/activities');
}

export async function handleRejectBill(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  const reason = (formData.get('reason') as string) || 'Payment authorization declined by administrator during biller review.';

  const bill = await prisma.bill.findUnique({
    where: { id },
    include: { account: true, payee: true },
  });
  if (!bill) throw new Error('Bill not found');

  const claimed = await prisma.bill.updateMany({ where: { id, status: 'PENDING' }, data: { status: 'REJECTED' } });
  if (claimed.count === 0) throw new Error('This bill was already processed.');

  await prisma.transaction.updateMany({
    where: billTransactionWhere(bill.id, bill.accountId),
    data: { status: 'REJECTED', rejectionReason: reason, processedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: bill.account.userId,
      title: 'Bill payment declined',
      message: `Your payment of $${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${bill.payee?.name || 'your biller'} was declined. Reason: ${reason}`,
    }
  });

  revalidatePath('/admin/ebank/bill-services');
  revalidatePath('/admin/transactions');
  revalidatePath('/bills');
  revalidatePath('/dashboard');
  revalidatePath('/activities');
}

import { normalizeBillCategory, normalizeBillCountry } from '@/lib/bill-constants';

export async function handleCreatePayee(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const accountNumber = formData.get('accountNumber') as string;
  const rawCategory = (formData.get('category') as string) || 'UTILITIES';
  const rawCountry = (formData.get('country') as string) || 'usa';
  const userId = formData.get('userId') as string;
  if (!name || !accountNumber) {
    throw new Error('Name and Account Number are required.');
  }

  // Billers belong to one customer: each customer only sees their own.
  if (!userId || !(await prisma.user.count({ where: { id: userId } }))) {
    throw new Error('Choose the customer this biller is for.');
  }

  await prisma.payee.create({
    data: {
      userId,
      name: name.trim(),
      accountNumber: accountNumber.trim(),
      category: normalizeBillCategory(rawCategory),
      country: normalizeBillCountry(rawCountry),
    }
  });

  revalidatePath('/admin/ebank/bill-services');
  revalidatePath('/bills');
}

export async function handleDeletePayee(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;

  await prisma.payee.delete({
    where: { id }
  });

  revalidatePath('/admin/ebank/bill-services');
  revalidatePath('/bills');
}
