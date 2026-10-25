'use server';

import { checkTransactionPin } from '@/lib/transaction-pin';
import { pinProblem } from '@/lib/password-policy';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: { take: 1 },
      registrationForm: {
        select: { passportPhotoUrl: true },
      },
    },
  });

  if (!user) return null;

  // Connect profile photo to the photo received and stored during registration
  const photo = user.profilePhotoUrl || user.registrationForm?.passportPhotoUrl || null;

  return {
    ...user,
    profilePhotoUrl: photo,
  };
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

/** Errors are returned, not thrown, so their text reaches the customer in production. */
export async function changeTransactionPin(
  data: { currentPin: string; newPin: string },
): Promise<{ success: true } | { success: false; field: 'currentPin' | 'newPin'; error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  const newPinProblem = pinProblem(data.newPin);
  if (newPinProblem) return { success: false, field: 'newPin', error: newPinProblem };
  if (data.newPin === data.currentPin) return { success: false, field: 'newPin', error: "Choose a PIN that's different from your current one." };

  // Same wrong-PIN limit as payments, so the current PIN can't be guessed here.
  const pinError = await checkTransactionPin(session.user.id, data.currentPin, 'changing it');
  if (pinError) return { success: false, field: 'currentPin', error: pinError };

  const hashedPin = await bcrypt.hash(data.newPin, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { transactionPin: hashedPin, pinFailedAttempts: 0, pinLockedUntil: null }
  });

  return { success: true };
}

export async function setupTransactionPin(pin: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.pinSetupComplete) return { error: 'PIN is already set up' };
  const problem = pinProblem(pin);
  if (problem) return { error: problem };

  const hashedPin = await bcrypt.hash(pin, 12);
  
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
