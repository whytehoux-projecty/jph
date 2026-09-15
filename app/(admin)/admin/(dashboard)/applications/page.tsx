import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { AdminApplicationList } from '@/components/admin/AdminApplicationList';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';

export default async function AccountApplications() {
  const applications = await prisma.accountApplication.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const handleApprove = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    const initialDeposit = Number(formData.get('initialDeposit') || 0);

    const app = await prisma.accountApplication.findUnique({ where: { id } });
    if (!app) return;
    
    const hashedPassword = await bcrypt.hash('Welcome123!', 10);
    // Create the mock user
    const newUser = await prisma.user.create({
      data: {
        email: app.email,
        password: hashedPassword, // Default mock password
        firstName: app.firstName,
        lastName: app.lastName,
        phone: app.phone,
        dateOfBirth: app.dateOfBirth,
        address: app.address,
        city: app.city,
        state: app.state,
        zipCode: app.zipCode,
        preferredCurrency: app.currencyPreference || 'USD',
        status: 'ACTIVE',
      }
    });

    // Create the mock account
    const account = await prisma.account.create({
      data: {
        userId: newUser.id,
        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        accountType: app.applicationType,
        balance: initialDeposit
      }
    });

    if (initialDeposit > 0) {
      await prisma.transaction.create({
        data: {
          accountId: account.id,
          type: 'CREDIT',
          transactionType: 'LOCAL_TRANSFER',
          amount: initialDeposit,
          currency: app.currencyPreference || 'USD',
          status: 'APPROVED',
          description: 'Initial Funding Deposit',
          reference: `FUND-${Date.now()}`
        }
      });
    }

    // Update application
    await prisma.accountApplication.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() }
    });

    // Send Welcome Email
    await sendEmail({
      to: app.email,
      subject: 'Welcome to JP Heritage Bank - Account Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Account Approved</h2>
          <p>Dear ${app.firstName},</p>
          <p>Congratulations! Your application for a ${app.applicationType} account has been approved.</p>
          <p>Your new account number is: <strong>${account.accountNumber}</strong></p>
          <p>You can now log in using your email address and the temporary password: <strong>Welcome123!</strong></p>
          <p>Please log in and change your password immediately.</p>
          <p>Best regards,<br/>JP Heritage Bank Team</p>
        </div>
      `
    });

    revalidatePath('/admin/applications');
  };

  const handleReject = async (formData: FormData) => {
    'use server'
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

    revalidatePath('/admin/applications');
  };

  const handleRequestVerification = async (formData: FormData) => {
    'use server'
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

    // We will assume the frontend is hosted at localhost:3000 in dev or real domain in prod.
    // For simplicity, we use a relative path logic or hardcoded mock domain if env not set.
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

    revalidatePath('/admin/applications');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Account Applications</h2>
          <p className="text-sm text-muted-foreground mt-1">Review and process customer onboarding requests.</p>
        </div>
      </div>

      <AdminApplicationList 
        initialApplications={applications}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestVerification={handleRequestVerification}
      />
    </div>
  );
}
