'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function submitTransfer(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
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
  const description = formData.get('description') as string;

  // Metadata based on type
  const metadata: any = {};
  if (transactionType === 'INT_WIRE') {
    metadata.swiftCode = formData.get('swiftCode');
    metadata.iban = formData.get('iban');
  } else if (transactionType === 'CRYPTO_WITHDRAWAL') {
    metadata.walletAddress = formData.get('walletAddress');
    metadata.network = formData.get('network');
  } else if (transactionType === 'CRYPTO_DEPOSIT') {
    metadata.fromWalletAddress = formData.get('fromWalletAddress');
    metadata.txHash = formData.get('txHash');
  } else {
    // LOCAL_TRANSFER
    metadata.accountNumber = formData.get('toAccountNumber');
    metadata.bankName = formData.get('bankName');
  }

  // Basic validation
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount');
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
