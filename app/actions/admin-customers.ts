'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function updateRegistrationForm(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const userId = formData.get('userId') as string;
  
  // Extract all fields
  const data: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (key !== 'userId' && value !== '') {
      data[key] = value;
    }
  }

  // we need to find the registrationFormId first
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { registrationForm: true }
  });

  if (user?.registrationForm) {
    await prisma.registrationForm.update({
      where: { id: user.registrationForm.id },
      data
    });
  }

  revalidatePath('/admin/customers/account-holders');
}

export async function createAccount(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const userId = formData.get('userId') as string;
  const accountType = formData.get('accountType') as string;
  const currency = formData.get('currency') as string || 'USD';
  const initialBalance = parseFloat(formData.get('initialBalance') as string) || 0;

  const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10 digit

  await prisma.account.create({
    data: {
      userId,
      accountNumber,
      accountType,
      currency,
      balance: initialBalance,
      status: 'ACTIVE'
    }
  });
  
  revalidatePath('/admin/customers/account-holders');
}

export async function updateAccount(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  const balance = parseFloat(formData.get('balance') as string);
  const status = formData.get('status') as string;
  const accountType = formData.get('accountType') as string;
  
  const updateData: any = {};
  if (!isNaN(balance)) updateData.balance = balance;
  if (status) updateData.status = status;
  if (accountType) updateData.accountType = accountType;

  await prisma.account.update({
    where: { id },
    data: updateData
  });
  
  revalidatePath('/admin/customers/account-holders');
}

export async function deleteAccount(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  await prisma.account.delete({ where: { id } });
  revalidatePath('/admin/customers/account-holders');
}

export async function issueCard(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const accountId = formData.get('accountId') as string;
  const cardType = formData.get('cardType') as string;
  const network = formData.get('network') as string;
  const cvv = formData.get('cvv') as string || Math.floor(100 + Math.random() * 900).toString();
  
  const cardNumber = Math.floor(4000000000000000 + Math.random() * 999999999999999).toString(); // 16 digit
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 4);

  await prisma.card.create({
    data: {
      accountId,
      cardNumber,
      cardType,
      network,
      expiryDate,
      cvv,
      status: 'ACTIVE'
    }
  });

  revalidatePath('/admin/customers/account-holders');
}

export async function updateCard(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  const cardType = formData.get('cardType') as string;

  const updateData: any = {};
  if (status) updateData.status = status;
  if (cardType) updateData.cardType = cardType;

  await prisma.card.update({
    where: { id },
    data: updateData
  });

  revalidatePath('/admin/customers/account-holders');
}

export async function deleteCard(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  await prisma.card.delete({ where: { id } });
  revalidatePath('/admin/customers/account-holders');
}

export async function issueCheque(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const accountId = formData.get('accountId') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const payeeName = formData.get('payeeName') as string;
  
  const chequeNumber = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.cheque.create({
    data: {
      accountId,
      chequeNumber,
      amount: isNaN(amount) ? null : amount,
      payeeName: payeeName || null,
      status: 'ISSUED'
    }
  });

  revalidatePath('/admin/customers/account-holders');
}

export async function updateCheque(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  
  const updateData: any = {};
  if (status) updateData.status = status;
  if (status === 'CLEARED') updateData.clearDate = new Date();

  await prisma.cheque.update({
    where: { id },
    data: updateData
  });

  revalidatePath('/admin/customers/account-holders');
}

export async function deleteCheque(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  await prisma.cheque.delete({ where: { id } });
  revalidatePath('/admin/customers/account-holders');
}

export async function generateStatement(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const accountId = formData.get('accountId') as string;
  const period = formData.get('period') as string;

  await prisma.statement.create({
    data: {
      accountId,
      period,
      generatedAt: new Date()
    }
  });

  revalidatePath('/admin/customers/account-holders');
}

export async function updateEportalStatus(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  const eportalStatus = formData.get('eportalStatus') as string;
  const eportalNotificationMessage = formData.get('eportalNotificationMessage') as string;

  const hasOnlineAccess = eportalStatus === 'ACTIVE';

  await prisma.user.update({
    where: { id },
    data: {
      eportalStatus,
      eportalNotificationMessage: eportalNotificationMessage || null,
      hasOnlineAccess
    }
  });

  revalidatePath('/admin/customers/account-holders');
}

export async function requestOnlineAccess(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const userId = formData.get('id') as string;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: true }
  });

  if (!user || user.accounts.length === 0) throw new Error('User has no accounts');

  await prisma.onlineAccessRequest.create({
    data: {
      accountNumber: user.accounts[0].accountNumber,
      email: user.email,
      status: 'PENDING'
    }
  });

  revalidatePath('/admin/customers/account-holders');
}

import bcrypt from 'bcryptjs';

export async function updateEportalCredentials(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const id = formData.get('id') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      temporaryPassword: newPassword, // Store plaintext so admin can view it
    }
  });

  revalidatePath('/admin/customers/account-holders');
}
