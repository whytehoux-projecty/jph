'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import { generateTemporaryPassword } from '@/lib/temporary-password';

export async function handleApprove(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;

  const app = await prisma.accountApplication.findUnique({ where: { id } });
  if (!app) return;
  
  const registrationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Update application
  await prisma.accountApplication.update({
    where: { id },
    data: { 
      status: 'APPROVED', 
      reviewedAt: new Date(),
      registrationToken
    }
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const registerLink = app.applicationType === 'BUSINESS' 
    ? `${baseUrl}/register/business/${registrationToken}` 
    : `${baseUrl}/register/${registrationToken}`;

  await sendEmail({
    to: app.email,
    subject: 'Action Required: Complete Your Heritage Trust Bank Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Preliminary Approval Granted</h2>
        <p>Dear ${app.firstName},</p>
        <p>Congratulations! Your preliminary application for an account has been approved.</p>
        <p>To finalize your account setup, please complete our secure registration form by clicking the link below:</p>
        <a href="${registerLink}" style="display: inline-block; padding: 10px 20px; background-color: #0b2545; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">Complete Registration</a>
        <p>If the button doesn't work, copy and paste this link into your browser:<br/>${registerLink}</p>
        <p>Best regards,<br/>Heritage Trust Bank Team</p>
      </div>
    `
  });

  revalidatePath('/admin/customers/application-management');
  return registrationToken;
}

export async function handleReject(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  const app = await prisma.accountApplication.update({
    where: { id },
    data: { status: 'REJECTED', reviewedAt: new Date() }
  });

  await sendEmail({
    to: app.email,
    subject: 'Heritage Trust Bank - Application Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Application Update</h2>
        <p>Dear ${app.firstName},</p>
        <p>Thank you for applying to Heritage Trust Bank. After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
        <p>If you believe this is a mistake or have additional information to provide, please contact our support team.</p>
        <p>Best regards,<br/>Heritage Trust Bank Team</p>
      </div>
    `
  });

  revalidatePath('/admin/customers/application-management');
}

export async function handleRequestVerification(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  const app = await prisma.accountApplication.update({
    where: { id },
    data: { 
      status: 'VERIFICATION_REQUIRED', 
      verificationRequired: true,
      reviewedAt: new Date() 
    }
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const scheduleLink = `${baseUrl}/verification/${app.id}`;

  await sendEmail({
    to: app.email,
    subject: 'Action Required: Schedule Identity Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Verification Required</h2>
        <p>Dear ${app.firstName},</p>
        <p>We are currently reviewing your account application. To proceed with the final approval, we require a brief video verification call with one of our agents.</p>
        <p>Please click the link below to securely schedule your meeting slot and choose your preferred communication method (Zoom, WhatsApp, etc.):</p>
        <a href="${scheduleLink}" style="display: inline-block; padding: 10px 20px; background-color: #0b2545; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">Schedule Verification Meeting</a>
        <p>If the button doesn't work, copy and paste this link into your browser:<br/>${scheduleLink}</p>
        <p>Best regards,<br/>Heritage Trust Bank Team</p>
      </div>
    `
  });

  revalidatePath('/admin/customers/application-management');
}

export async function handleEportalApprove(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  const req = await prisma.onlineAccessRequest.update({
    where: { id },
    data: { status: 'APPROVED', reviewedAt: new Date() }
  });

  // Activate user online access with a unique temporary password. The
  // customer must replace it at first sign-in (isFirstLogin → /onboarding).
  const user = await prisma.user.findUnique({where: {email: req.email}});
  if (user) {
    const tempPassword = generateTemporaryPassword();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hasOnlineAccess: true,
        eportalStatus: 'ACTIVE',
        isFirstLogin: true,
        password: await bcrypt.hash(tempPassword, 12),
        // Shown to staff in the admin customer view until first sign-in,
        // as for credentials set there (cleared by onboarding).
        temporaryPassword: tempPassword,
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await sendEmail({
      to: user.email,
      subject: 'Your Heritage Vault online banking access',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #14181C;">
          <h2>Online banking is ready</h2>
          <p>Dear ${user.firstName},</p>
          <p>Your request for online banking access has been approved. Sign in with your email address and this temporary password:</p>
          <p><strong>Temporary password:</strong> ${tempPassword}</p>
          <p>When you first sign in you will be asked to choose your own password and a transaction PIN. The temporary password stops working once you have done that.</p>
          <a href="${baseUrl}/login" style="display: inline-block; padding: 12px 20px; background-color: #0E4A55; color: #fff; text-decoration: none; border-radius: 2px; margin: 20px 0;">Sign in to Heritage Vault</a>
          <p>We will never ask you for this password by phone, text or email.</p>
          <p>Heritage Trust</p>
        </div>
      `
    });
  }

  revalidatePath('/admin/customers/application-management');
  revalidatePath('/admin/customers/account-holders');
}

export async function handleEportalReject(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  await prisma.onlineAccessRequest.update({
    where: { id },
    data: { status: 'REJECTED', reviewedAt: new Date() }
  });

  revalidatePath('/admin/customers/application-management');
}

export async function handleChequeApprove(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  await prisma.chequeRequest.update({
    where: { id },
    data: { status: 'APPROVED', reviewedAt: new Date(), reviewedBy: (session?.user as any)?.id }
  });

  revalidatePath('/admin/customers/application-management');
}

export async function handleChequeReject(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  await prisma.chequeRequest.update({
    where: { id },
    data: { status: 'REJECTED', reviewedAt: new Date(), reviewedBy: (session?.user as any)?.id }
  });

  revalidatePath('/admin/customers/application-management');
}

export async function handleRegenerateToken(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  
  const registrationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  await prisma.accountApplication.update({
    where: { id },
    data: { registrationToken }
  });

  revalidatePath('/admin/customers/application-management');
}
