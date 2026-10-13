'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { parseUserFeatureOverrides, type BillMethodsOverrides } from '@/lib/feature-overrides';
import { normalizeBillCategory, normalizeBillCountry } from '@/lib/bill-constants';

export interface UserBillPermissions {
  enabled: boolean;
  methods: BillMethodsOverrides;
}

export async function getUserBillPermissions(): Promise<UserBillPermissions> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      enabled: false,
      methods: { providers: false, einvoice: false },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { transferMethodOverrides: true },
  });

  const parsed = parseUserFeatureOverrides(user?.transferMethodOverrides);
  return {
    enabled: parsed.bills.enabled,
    methods: parsed.bills.methods,
  };
}

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
      category: normalizeBillCategory(data.category),
      country: normalizeBillCountry(data.country)
    }
  });

  revalidatePath('/bills');
  revalidatePath('/admin/ebank/bill-services');
  return payee;
}

export async function deletePayee(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const payee = await prisma.payee.findUnique({ where: { id } });
  if (!payee || payee.userId !== session.user.id) throw new Error('Unauthorized');

  await prisma.payee.delete({ where: { id } });
  revalidatePath('/bills');
  revalidatePath('/admin/ebank/bill-services');
  return { success: true };
}

export async function payBill(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const { accountId, payeeId, amount, date } = data;

  // 1. Verify customer bill payment permissions
  const permissions = await getUserBillPermissions();
  if (!permissions.enabled) {
    throw new Error('Bill payment facilities are currently restricted on your account. Please consult with your relationship manager.');
  }

  const isEinvoice = data.source === 'EINVOICE_PIPELINE' || data.category === 'E-INVOICE';
  if (isEinvoice && !permissions.methods.einvoice) {
    throw new Error('E-Invoice ticket upload & automated pipeline is currently disabled for your account profile.');
  }
  if (!isEinvoice && !permissions.methods.providers) {
    throw new Error('Direct bill provider directory payments are currently disabled for your account profile.');
  }

  // 2. Validate account ownership
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== session.user.id) throw new Error('Unauthorized');

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Invalid payment amount. Must be greater than zero.');
  }

  // 3. Locate or create payee in DB
  let actualPayeeId = payeeId;
  let payeeName = data.name || "Provider";

  if (actualPayeeId) {
    const existingPayee = await prisma.payee.findUnique({ where: { id: actualPayeeId } });
    if (existingPayee) {
      payeeName = existingPayee.name;
    } else {
      actualPayeeId = undefined;
    }
  }

  if (!actualPayeeId && data.name) {
    let userPayee = await prisma.payee.findFirst({
      where: {
        userId: session.user.id,
        name: data.name,
      }
    });

    if (!userPayee) {
      userPayee = await prisma.payee.create({
        data: {
          userId: session.user.id,
          name: data.name,
          accountNumber: data.accountNumber || 'ACC-' + Math.floor(100000 + Math.random() * 900000),
          category: data.category || 'UTILITIES',
          country: data.country || 'usa',
        }
      });
    }
    actualPayeeId = userPayee.id;
    payeeName = userPayee.name;
  }

  if (!actualPayeeId) {
    throw new Error('Could not determine payee record for bill payment.');
  }

  // 4. Create bill record with PENDING status
  const bill = await prisma.bill.create({
    data: {
      accountId,
      payeeId: actualPayeeId,
      amount: numAmount,
      status: 'PENDING'
    }
  });

  const ref = 'BIL-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  // 5. Create matching transaction record
  const transaction = await prisma.transaction.create({
    data: {
      accountId,
      type: 'DEBIT',
      transactionType: 'BILL_PAYMENT',
      amount: numAmount,
      status: 'PENDING',
      description: `Bill Payment · ${payeeName}`,
      reference: ref,
      category: 'BILLS',
      channel: isEinvoice ? 'E_INVOICE' : 'PORTAL',
      counterparty: JSON.stringify({
        name: payeeName,
        accountNumber: data.accountNumber || 'ACC-DIRECT',
        category: data.category || 'UTILITIES',
      }),
      metadata: JSON.stringify({
        billId: bill.id,
        scheduledDate: date || new Date().toISOString(),
        payeeName,
        accountNumber: data.accountNumber,
        category: data.category || 'UTILITIES',
        source: data.source || (isEinvoice ? 'EINVOICE_PIPELINE' : 'DIRECTORY_PROVIDER')
      })
    }
  });

  revalidatePath('/bills');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/admin/ebank/bill-services');
  revalidatePath('/admin/transactions');

  return { success: true, bill, reference: ref, transaction };
}

export async function getBillHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({ where: { userId: session.user.id } });
  const accountIds = accounts.map(a => a.id);

  const bills = await prisma.bill.findMany({
    where: { accountId: { in: accountIds } },
    include: { payee: true, account: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return bills;
}

export interface BillProvider {
  id: string;
  name: string;
  category: string;
  country: string;
  code?: string;
  description?: string;
  accountNumber?: string;
  isCustom?: boolean;
}

export async function getProviders(): Promise<BillProvider[]> {
  // Fetch real-time service providers from the database (configured by admin or users)
  try {
    const payees = await prisma.payee.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return payees.map((p) => ({
      id: p.id,
      name: p.name,
      category: normalizeBillCategory(p.category),
      country: normalizeBillCountry(p.country),
      code: p.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, ''),
      description: `Account / Biller ID: ${p.accountNumber}`,
      accountNumber: p.accountNumber,
      isCustom: true,
    }));
  } catch (err) {
    console.error('Failed to load DB payees for providers:', err);
    return [];
  }
}
