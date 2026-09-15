'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function resetUserPassword(userId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const newPassword = crypto.randomBytes(4).toString('hex');
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
  
  return newPassword;
}
