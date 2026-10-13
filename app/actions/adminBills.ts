'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function handleApproveBill(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  const bill = await prisma.bill.findUnique({
    where: { id },
    include: { account: true, payee: true },
  });
  if (!bill) return;
  if (bill.status === 'PAID') return;

  // Debit the customer account balance
  const updatedAccount = await prisma.account.update({
    where: { id: bill.accountId },
    data: { balance: { decrement: bill.amount } }
  });

  // Find the matching pending transaction created during submission
  const pendingTx = await prisma.transaction.findFirst({
    where: {
      accountId: bill.accountId,
      status: 'PENDING',
      OR: [
        { metadata: { contains: bill.id } },
        { description: { contains: bill.payee?.name || '' } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  if (pendingTx) {
    await prisma.transaction.update({
      where: { id: pendingTx.id },
      data: {
        status: 'APPROVED',
        processedAt: new Date(),
        runningBalance: updatedAccount.balance,
      }
    });
  } else {
    // If not found, create the settled debit transaction
    await prisma.transaction.create({
      data: {
        accountId: bill.accountId,
        type: 'DEBIT',
        transactionType: 'BILL_PAYMENT',
        amount: bill.amount,
        status: 'APPROVED',
        description: `Bill Payment · ${bill.payee?.name || 'Provider'}`,
        reference: `BIL-${bill.id.substring(0, 8).toUpperCase()}`,
        processedAt: new Date(),
        runningBalance: updatedAccount.balance,
        category: 'BILLS',
        channel: 'PORTAL',
        metadata: JSON.stringify({
          billId: bill.id,
          payeeName: bill.payee?.name,
          accountNumber: bill.payee?.accountNumber,
        })
      }
    });
  }

  // Mark bill as PAID with timestamp
  await prisma.bill.update({
    where: { id },
    data: { status: 'PAID', paidAt: new Date() }
  });

  // Dispatch live notification to customer
  await prisma.notification.create({
    data: {
      userId: bill.account.userId,
      title: 'Bill Payment Cleared & Settled',
      message: `Your payment of $${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${bill.payee?.name || 'Provider'} has been settled from your ${bill.account.accountType} account.`,
    }
  });
  
  revalidatePath('/admin/ebank/bill-services');
  revalidatePath('/admin/transactions');
  revalidatePath('/bills');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
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
  if (!bill) return;

  await prisma.bill.update({
    where: { id },
    data: { status: 'REJECTED' }
  });

  // Find and update matching pending transaction
  const pendingTx = await prisma.transaction.findFirst({
    where: {
      accountId: bill.accountId,
      status: 'PENDING',
      OR: [
        { metadata: { contains: bill.id } },
        { description: { contains: bill.payee?.name || '' } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  if (pendingTx) {
    await prisma.transaction.update({
      where: { id: pendingTx.id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        processedAt: new Date(),
      }
    });
  }

  // Notify customer
  await prisma.notification.create({
    data: {
      userId: bill.account.userId,
      title: 'Bill Payment Declined',
      message: `Your scheduled payment of $${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${bill.payee?.name || 'Provider'} was rejected. Reason: ${reason}`,
    }
  });
  
  revalidatePath('/admin/ebank/bill-services');
  revalidatePath('/admin/transactions');
  revalidatePath('/bills');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

import { normalizeBillCategory, normalizeBillCountry } from '@/lib/bill-constants';

export async function handleCreatePayee(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const accountNumber = formData.get('accountNumber') as string;
  const rawCategory = (formData.get('category') as string) || 'UTILITIES';
  const rawCountry = (formData.get('country') as string) || 'usa';
  let userId = formData.get('userId') as string;

  if (!name || !accountNumber) {
    throw new Error('Name and Account Number are required.');
  }

  // If no userId provided or explicitly 'GLOBAL', attach to admin user or first available user
  if (!userId || userId === 'GLOBAL') {
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) throw new Error('No user accounts exist to associate this payee with.');
      userId = firstUser.id;
    }
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
