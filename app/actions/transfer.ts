'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function submitTransfer(formData: FormData) {
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
    throw new Error('No account found for user');
  }
  
  const fromAccountId = formData.get('fromAccountId') as string || user.accounts[0].id;
  
  if (!user.accounts.some(acc => acc.id === fromAccountId)) {
    throw new Error('Unauthorized account access');
  }

  const description = formData.get('description') as string;

  // Dynamic Metadata based on method
  const metadata: any = {};
  for (const [key, value] of Array.from(formData.entries())) {
    if (!['methodId', 'transactionType', 'amount', 'fromAccountId', 'description', 'pinCode'].includes(key)) {
      metadata[key] = value;
    }
  }

  // Basic validation
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount');
  }

  // Check if method is globally enabled and not disabled for this user
  const methodConfig = await prisma.transferMethodConfig.findUnique({ where: { methodId } });
  if (methodConfig && !methodConfig.isEnabled) {
    throw new Error('This transfer method is currently disabled system-wide.');
  }
  
  if (user.transferMethodOverrides) {
    try {
      const overrides = JSON.parse(user.transferMethodOverrides);
      if (overrides[methodId] && overrides[methodId].enabled === false) {
        throw new Error('This transfer method is restricted for your account. Please contact support.');
      }
    } catch (e) {}
  }

  const pinCode = formData.get('pinCode') as string;
  if (!user.transactionPin) {
    throw new Error('Transaction PIN not set up. Please go to settings to set it up.');
  }

  const isValidPin = await bcrypt.compare(pinCode, user.transactionPin);
  if (!isValidPin) {
    // Return a 400 response structure since the client checks error.response?.status === 400
    const err = new Error('Invalid Transaction PIN');
    (err as any).response = { status: 400, data: { message: 'Invalid Transaction PIN' } };
    throw err;
  }

  // Create PENDING transaction
  const tx = await prisma.transaction.create({
    data: {
      accountId: fromAccountId,
      type: transactionType === 'CRYPTO_DEPOSIT' ? 'CREDIT' : 'DEBIT',
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
  
  return { success: true, reference: tx.reference };
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
