'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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

export async function deleteUserPin(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  await prisma.user.update({
    where: { id },
    data: { 
      transactionPin: null,
      pinSetupComplete: false
    }
  });
  
  revalidatePath('/admin/users');
}

export async function loginAsUser(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  
  const userId = formData.get('id') as string;
  const token = crypto.randomBytes(32).toString('hex');
  
  await prisma.impersonationToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    }
  });
  
  redirect(`/impersonate?token=${token}`);
}

export async function toggleUserStatus(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  
  await prisma.user.update({
    where: { id },
    data: { status }
  });
  
  revalidatePath('/admin/users');
}

export async function toggleUserTier(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  const tier = formData.get('tier') as string;
  
  await prisma.user.update({
    where: { id },
    data: { tier }
  });
  
  revalidatePath('/admin/users');
}
