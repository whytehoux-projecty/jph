'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getPayees() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const payees = await prisma.payee.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return payees;
}

export async function addPayee(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const payee = await prisma.payee.create({
    data: {
      userId: session.user.id,
      name: data.name,
      accountNumber: data.accountNumber,
      category: data.category || 'OTHER',
      country: data.country || 'usa'
    }
  });

  return payee;
}

export async function deletePayee(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const payee = await prisma.payee.findUnique({ where: { id } });
  if (!payee || payee.userId !== session.user.id) throw new Error('Unauthorized');

  await prisma.payee.delete({ where: { id } });
  return { success: true };
}

export async function payBill(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const { accountId, payeeId, amount, date } = data;

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== session.user.id) throw new Error('Unauthorized');

  // Verify payee belongs to user
  let actualPayeeId = payeeId;
  if (data.name && data.accountNumber) { // Add payee flow
    const newPayee = await prisma.payee.create({
        data: {
            userId: session.user.id,
            name: data.name,
            accountNumber: data.accountNumber
        }
    });
    actualPayeeId = newPayee.id;
  } else {
    const payee = await prisma.payee.findUnique({ where: { id: actualPayeeId } });
    if (!payee || payee.userId !== session.user.id) throw new Error('Unauthorized');
  }

  // Create bill and pending transaction
  const bill = await prisma.bill.create({
    data: {
      accountId,
      payeeId: actualPayeeId,
      amount: parseFloat(amount),
      status: 'PENDING'
    }
  });

  await prisma.transaction.create({
    data: {
      accountId,
      type: 'DEBIT',
      transactionType: 'BILL_PAYMENT',
      amount: parseFloat(amount),
      status: 'PENDING',
      description: `Bill Payment to Payee`,
      reference: Math.random().toString(36).substring(2, 10).toUpperCase(),
      metadata: JSON.stringify({ billId: bill.id, scheduledDate: date })
    }
  });

  return { success: true, bill };
}

export async function getBillHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({ where: { userId: session.user.id } });
  const accountIds = accounts.map(a => a.id);

  const bills = await prisma.bill.findMany({
    where: { accountId: { in: accountIds } },
    include: { payee: true },
    orderBy: { createdAt: 'desc' }
  });

  return bills;
}

export async function getProviders() {
  // Return static mock data for providers
  return [
    { id: '1', name: 'AT&T', category: 'telecom', country: 'usa' },
    { id: '2', name: 'Verizon', category: 'telecom', country: 'usa' },
    { id: '3', name: 'Con Edison', category: 'utilities', country: 'usa' },
    { id: '4', name: 'PG&E', category: 'utilities', country: 'usa' },
  ];
}
