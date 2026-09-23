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
  
  revalidatePath('/admin/customers/account-holders');
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
  
  revalidatePath('/admin/customers/account-holders');
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
  
  revalidatePath('/admin/customers/account-holders');
  revalidatePath('/admin/users');
}

export async function toggleUserOnlineAccess(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  const hasOnlineAccess = formData.get('hasOnlineAccess') === 'true';

  await prisma.user.update({
    where: { id },
    data: { hasOnlineAccess }
  });

  revalidatePath('/admin/customers/account-holders');
  revalidatePath('/admin/users');
}

export async function sendStatementEmail(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const statementId = formData.get('statementId') as string;
  const email = formData.get('email') as string;

  const statement = await prisma.statement.findUnique({
    where: { id: statementId },
    include: {
      account: {
        include: { user: true }
      }
    }
  });

  if (!statement) throw new Error('Statement not found');

  const targetEmail = email || statement.account.user.email;
  const { sendEmail } = await import('@/lib/email');
  await sendEmail({
    to: targetEmail,
    subject: `Your Account Statement for Period ${statement.period} is Available`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #0b2545;">JP Heritage Bank Statement</h2>
        <p>Dear ${statement.account.user.firstName},</p>
        <p>Your electronic bank statement for account ending in <strong>${statement.account.accountNumber.slice(-4)}</strong> for statement period <strong>${statement.period}</strong> has been generated and is now accessible via your online banking portal.</p>
        <p>Log in securely to view or download full transaction histories.</p>
        <p style="margin-top: 24px; font-size: 12px; color: #666;">JP Heritage Bank &bull; Secure Banking Services</p>
      </div>
    `
  });

  return { success: true };
}
