'use server';

import bcrypt from 'bcryptjs';
import { auth, unstable_update } from '@/auth';
import { prisma } from '@/lib/prisma';
import { meetsPasswordPolicy, pinProblem } from '@/lib/password-policy';

/**
 * First sign-in: replaces the temporary password and sets the transaction
 * PIN, in one write with both already hashed. Then refreshes the session's
 * first-login flag from the database, so the customer isn't sent back here.
 */
export async function completeOnboarding(data: { password: string; transactionPin: string }) {
  const session = await auth();
  if (!session?.user?.id || (session as any).staffView) throw new Error('Unauthorized');
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isFirstLogin: true } });
  if (!user) throw new Error('Unauthorized');
  if (!user.isFirstLogin) return { success: true as const };

  if (!meetsPasswordPolicy(data.password)) {
    return { success: false as const, field: 'password' as const, error: 'Choose a password that meets every rule in the list.' };
  }
  const pinError = pinProblem(data.transactionPin);
  if (pinError) return { success: false as const, field: 'pin' as const, error: pinError };

  const [password, transactionPin] = await Promise.all([bcrypt.hash(data.password, 12), bcrypt.hash(data.transactionPin, 12)]);

  await prisma.user.update({
    where: { id: userId },
    data: { password, transactionPin, pinSetupComplete: true, isFirstLogin: false, temporaryPassword: null },
  });

  // The flag value is read from the database in the jwt callback; the
  // payload only asks for the refresh.
  await unstable_update({ refreshFirstLogin: true } as any);
  return { success: true as const };
}
