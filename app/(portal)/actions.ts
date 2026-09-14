'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function submitTransaction(formData: FormData) {
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
  
  const accountId = user.accounts[0].id;
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
      accountId,
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
