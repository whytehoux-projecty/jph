'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: { take: 1 } }
  });

  return user;
}

export async function updateProfile(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone
    }
  });

  return updated;
}

export async function changeTransactionPin(data: { currentPin: string; newPin: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.transactionPin) throw new Error('PIN not set up');
  
  const match = await bcrypt.compare(data.currentPin, user.transactionPin);
  if (!match) throw new Error('Incorrect current PIN');
  
  const hashedPin = await bcrypt.hash(data.newPin, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { transactionPin: hashedPin }
  });

  return { success: true };
}

export async function setupTransactionPin(pin: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.pinSetupComplete) return { error: 'PIN is already set up' };

  const hashedPin = await bcrypt.hash(pin, 10);
  
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      transactionPin: hashedPin,
      pinSetupComplete: true
    }
  });

  return { success: true };
}

export async function updatePreferences(data: { preferredLanguage?: string, preferredCurrency?: string, hideBalance?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const updateData: any = {};
  if (data.preferredLanguage !== undefined) updateData.preferredLanguage = data.preferredLanguage;
  if (data.preferredCurrency !== undefined) updateData.preferredCurrency = data.preferredCurrency;
  if (data.hideBalance !== undefined) updateData.hideBalance = data.hideBalance;

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });
  }
  return { success: true };
}

export async function updateNotificationSettings(data: any) {
  // Demo mock to update notification preferences
  return { success: true };
}
