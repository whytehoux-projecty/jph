'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';

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
  const registerLink = `${baseUrl}/register/${registrationToken}`;

  // Send Welcome Email (Email sending is currently disabled/mocked in this environment, but this is the template)
  await sendEmail({
    to: app.email,
    subject: 'Action Required: Complete Your JP Heritage Bank Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Preliminary Approval Granted</h2>
        <p>Dear ${app.firstName},</p>
        <p>Congratulations! Your preliminary application for an account has been approved.</p>
        <p>To finalize your account setup, please complete our secure registration form by clicking the link below:</p>
        <a href="${registerLink}" style="display: inline-block; padding: 10px 20px; background-color: #0b2545; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">Complete Registration</a>
        <p>If the button doesn't work, copy and paste this link into your browser:<br/>${registerLink}</p>
        <p>Best regards,<br/>JP Heritage Bank Team</p>
      </div>
    `
  });

  revalidatePath('/admin/customers/applications');
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

  // Send Rejection Email
  await sendEmail({
    to: app.email,
    subject: 'JP Heritage Bank - Application Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Application Update</h2>
        <p>Dear ${app.firstName},</p>
        <p>Thank you for applying to JP Heritage Bank. After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
        <p>If you believe this is a mistake or have additional information to provide, please contact our support team.</p>
        <p>Best regards,<br/>JP Heritage Bank Team</p>
      </div>
    `
  });

  revalidatePath('/admin/customers/applications');
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

  // Send Verification Request Email
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
        <p>Best regards,<br/>JP Heritage Bank Team</p>
      </div>
    `
  });

  revalidatePath('/admin/customers/applications');
}
