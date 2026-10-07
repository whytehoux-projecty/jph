'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export type SubmitTransferResult =
  | { success: true; reference: string; id: string; status: string; duplicate?: boolean }
  | { success: false; error: string; field?: 'pinCode' };

const RESERVED_KEYS = ['methodId', 'transactionType', 'amount', 'fromAccountId', 'description', 'pinCode'];

export async function submitTransfer(formData: FormData): Promise<SubmitTransferResult> {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const methodId = formData.get('methodId') as string;
  const transactionType = formData.get('transactionType') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: true }
  });

  if (!user || user.accounts.length === 0) {
    return { success: false, error: 'No account found for user.' };
  }

  const fromAccountId = formData.get('fromAccountId') as string || user.accounts[0].id;
  const account = user.accounts.find(acc => acc.id === fromAccountId);

  if (!account) {
    return { success: false, error: 'Unauthorized account access.' };
  }

  const description = formData.get('description') as string;

  // Dynamic Metadata based on method
  const metadata: any = {};
  for (const [key, value] of Array.from(formData.entries())) {
    if (!RESERVED_KEYS.includes(key)) {
      metadata[key] = value;
    }
  }

  // Basic validation
  if (!amount || amount <= 0) {
    return { success: false, error: 'Invalid amount.' };
  }

  // Idempotency: the same submission key never creates two requests.
  const idempotencyKey = formData.get('idempotencyKey') as string | null;
  if (idempotencyKey) {
    const existing = await prisma.transaction.findFirst({
      where: { accountId: { in: user.accounts.map(a => a.id) }, metadata: { contains: idempotencyKey } },
    });
    if (existing) {
      return { success: true, reference: existing.reference, id: existing.id, status: existing.status, duplicate: true };
    }
  }

  // Check if method is globally enabled and not disabled for this user
  const methodConfig = await prisma.transferMethodConfig.findUnique({ where: { methodId } });
  if (methodConfig && !methodConfig.isEnabled) {
    return { success: false, error: 'This transfer method is currently disabled system-wide.' };
  }
  if (methodConfig && methodConfig.perTransferLimit && amount > methodConfig.perTransferLimit) {
    return { success: false, error: 'Amount exceeds the per-transfer limit for this method.' };
  }

  if (user.transferMethodOverrides) {
    try {
      const overrides = JSON.parse(user.transferMethodOverrides);
      if (overrides[methodId] && overrides[methodId].enabled === false) {
        return { success: false, error: 'This transfer method is restricted for your account. Please contact support.' };
      }
    } catch (e) {}
  }

  // Debits cannot exceed the available balance.
  const isCredit = transactionType === 'CRYPTO_DEPOSIT';
  if (!isCredit && amount > account.balance) {
    return { success: false, error: 'Amount exceeds the available balance of the selected account.' };
  }

  const pinCode = formData.get('pinCode') as string;
  if (!user.transactionPin) {
    return { success: false, error: 'Transaction PIN not set up. Please go to settings to set it up.', field: 'pinCode' };
  }

  const isValidPin = await bcrypt.compare(pinCode || '', user.transactionPin);
  if (!isValidPin) {
    return { success: false, error: 'Invalid Transaction PIN.', field: 'pinCode' };
  }

  // Create PENDING transaction
  const tx = await prisma.transaction.create({
    data: {
      accountId: fromAccountId,
      type: isCredit ? 'CREDIT' : 'DEBIT',
      transactionType,
      amount,
      status: 'PENDING',
      description: description || 'Transfer',
      reference: Math.random().toString(36).substring(2, 10).toUpperCase(),
      methodId,
      metadata: JSON.stringify(metadata)
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/transfer');
  revalidatePath('/activities');

  return { success: true, reference: tx.reference, id: tx.id, status: tx.status };
}

/**
 * Masked account-holder lookup for "another customer" transfers
 * (confirmation of payee). Never returns the full name.
 */
export async function lookupInternalAccount(accountNumber: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const acc = await prisma.account.findUnique({
    where: { accountNumber },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  if (!acc || acc.status !== 'ACTIVE') return { found: false as const };

  const mask = (s: string) => (s.length <= 1 ? s : s[0] + '•'.repeat(Math.min(s.length - 1, 5)));
  return {
    found: true as const,
    maskedName: `${mask(acc.user.firstName)} ${mask(acc.user.lastName)}`,
    isOwn: acc.userId === session.user.id,
  };
}

/** Lightweight status poll used by the portal to show live updates. */
export async function getTransferStatuses(references: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  if (!references.length) return [];

  const accounts = await prisma.account.findMany({ where: { userId: session.user.id }, select: { id: true } });
  const txs = await prisma.transaction.findMany({
    where: { accountId: { in: accounts.map(a => a.id) }, reference: { in: references.slice(0, 50) } },
    select: { reference: true, status: true },
  });
  return txs;
}

export async function getRecentTransferRequests(limit: number = 5) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({ where: { userId: session.user.id }, select: { id: true } });
  const txs = await prisma.transaction.findMany({
    where: { accountId: { in: accounts.map(a => a.id) }, NOT: { methodId: null } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, reference: true, status: true, amount: true, currency: true, description: true, methodId: true, createdAt: true },
  });
  return txs.map(t => ({ ...t, createdAt: t.createdAt.toISOString() }));
}

export async function getExchangeRate(from: string, to: string) {
  // Hardcoded rates for demo
  const rates: Record<string, number> = {
    'USD-EUR': 0.92,
    'EUR-USD': 1.09,
    'USD-GBP': 0.79,
    'GBP-USD': 1.27,
  };
  const key = `${from}-${to}`;
  return rates[key] || 1.0;
}

export async function getRecentRecipients(method?: string, limit: number = 5) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { userId: session.user.id },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  return beneficiaries;
}
