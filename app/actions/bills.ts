'use server';

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { parseUserFeatureOverrides, type BillMethodsOverrides } from '@/lib/feature-overrides';
import { normalizeBillCategory, normalizeBillCountry } from '@/lib/bill-constants';

export interface UserBillPermissions {
  /** Bill payments as a whole. */
  enabled: boolean;
  /** providers: paying saved billers. einvoice: attaching a copy of the bill. */
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

/**
 * The signed-in customer's own billers (saved by them, or by staff on their
 * behalf). Never another customer's payees.
 */
export async function getPayees() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  return prisma.payee.findMany({
    where: { userId: session.user.id },
    orderBy: { name: 'asc' },
  });
}

export interface AddPayeeInput {
  name: string;
  /** The customer's account or reference number with the biller. */
  accountNumber: string;
  category: string;
  country: string;
}

export async function addPayee(data: AddPayeeInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const name = data.name?.trim();
  const accountNumber = data.accountNumber?.trim();
  if (!name || name.length > 120) throw new Error('Enter the biller’s name.');
  if (!accountNumber || !/^[A-Za-z0-9 -]{3,40}$/.test(accountNumber)) {
    throw new Error('Enter your account or reference number with this biller: 3 to 40 letters or numbers.');
  }

  const payee = await prisma.payee.create({
    data: {
      userId: session.user.id,
      name,
      accountNumber,
      category: normalizeBillCategory(data.category),
      country: normalizeBillCountry(data.country),
    },
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

  // Deleting a payee deletes its bills (schema cascade): never while one is
  // still waiting for staff, or the queue would lose it.
  const pending = await prisma.bill.count({ where: { payeeId: id, status: 'PENDING' } });
  if (pending > 0) {
    throw new Error('A payment to this biller is still being checked. You can remove it once that payment is sent or declined.');
  }

  await prisma.payee.delete({ where: { id } });
  revalidatePath('/bills');
  revalidatePath('/admin/ebank/bill-services');
  return { success: true };
}

export interface PayBillInput {
  accountId: string;
  payeeId: string;
  amount: number;
  /** The customer's transaction PIN; checked, never stored. */
  pin: string;
  /** Optional copy of the bill, from POST /api/bills/attachments. */
  attachmentId?: string;
}

export interface PayBillResult {
  success: boolean;
  reference?: string;
  /** The pending transaction, for the receipt link. */
  id?: string;
  error?: string;
  field?: 'pin';
}

export async function payBill(data: PayBillInput): Promise<PayBillResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const permissions = await getUserBillPermissions();
  if (!permissions.enabled || !permissions.methods.providers) {
    return { success: false, error: 'Bill payments are turned off for your profile. Contact us for help.' };
  }
  if (data.attachmentId && !permissions.methods.einvoice) {
    return { success: false, error: 'Attaching bills is turned off for your profile. Remove the attachment and try again.' };
  }

  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: 'Enter an amount greater than zero.' };
  }

  const account = await prisma.account.findUnique({ where: { id: data.accountId } });
  if (!account || account.userId !== userId || account.isExternal || account.status !== 'ACTIVE') {
    return { success: false, error: 'Choose one of your active accounts.' };
  }
  if (amount > account.balance) {
    return { success: false, error: 'The amount is more than the available balance of this account.' };
  }

  const payee = await prisma.payee.findUnique({ where: { id: data.payeeId } });
  if (!payee || payee.userId !== userId) {
    return { success: false, error: 'Choose one of your saved billers.' };
  }

  if (data.attachmentId) {
    const file = await prisma.depositImage.findFirst({
      where: { id: data.attachmentId, userId, side: 'BILL', transactionId: null },
      select: { id: true },
    });
    if (!file) return { success: false, error: 'The attached bill has expired. Attach it again.' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { transactionPin: true } });
  if (!user?.transactionPin) {
    return { success: false, error: 'Set up a transaction PIN in Settings before paying bills.', field: 'pin' };
  }
  if (!(await bcrypt.compare(data.pin || '', user.transactionPin))) {
    return { success: false, error: "That PIN isn't right. Try again.", field: 'pin' };
  }

  // Pending until staff approve it in Admin › E-bank › Bill services, which
  // debits the account.
  const reference = `BIL-${randomBytes(5).toString('hex').toUpperCase()}`;
  const tx = await prisma.$transaction(async (db) => {
    const bill = await db.bill.create({
      data: { accountId: account.id, payeeId: payee.id, amount, status: 'PENDING' },
    });
    const created = await db.transaction.create({
      data: {
        accountId: account.id,
        type: 'DEBIT',
        transactionType: 'BILL_PAYMENT',
        amount,
        currency: account.currency,
        status: 'PENDING',
        description: `Bill payment · ${payee.name}`,
        reference,
        category: 'BILLS',
        channel: 'PORTAL',
        counterparty: JSON.stringify({ name: payee.name, accountNumber: payee.accountNumber, category: payee.category }),
        metadata: JSON.stringify({
          billId: bill.id,
          payeeName: payee.name,
          accountNumber: payee.accountNumber,
          category: payee.category,
          attachmentId: data.attachmentId || undefined,
        }),
      },
    });
    if (data.attachmentId) {
      await db.depositImage.updateMany({
        where: { id: data.attachmentId, userId, side: 'BILL', transactionId: null },
        data: { transactionId: created.id },
      });
    }
    return created;
  });

  revalidatePath('/bills');
  revalidatePath('/dashboard');
  revalidatePath('/activities');
  revalidatePath('/admin/ebank/bill-services');
  revalidatePath('/admin/transactions');

  return { success: true, reference, id: tx.id };
}

export async function getBillHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({ where: { userId: session.user.id }, select: { id: true } });
  const accountIds = accounts.map((a) => a.id);

  const [bills, txs] = await Promise.all([
    prisma.bill.findMany({
      where: { accountId: { in: accountIds } },
      include: { payee: true, account: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.transaction.findMany({
      where: { accountId: { in: accountIds }, transactionType: 'BILL_PAYMENT' },
      select: { id: true, reference: true, metadata: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  // Each bill's transaction, for its reference and receipt link.
  const byBill = new Map<string, { id: string; reference: string }>();
  for (const t of txs) {
    try {
      const billId = JSON.parse(t.metadata || '{}').billId;
      if (billId) byBill.set(billId, { id: t.id, reference: t.reference });
    } catch {
      /* not a portal bill payment */
    }
  }

  return bills.map((b) => ({ ...b, transaction: byBill.get(b.id) ?? null }));
}
