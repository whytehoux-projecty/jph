import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { AdminRequestList } from '@/components/admin/AdminRequestList';
import { sendEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$*!';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default async function OnlineRequests() {
  const requests = await prisma.onlineAccessRequest.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const enrichedRequests = await Promise.all(
    requests.map(async (req) => {
      const account = await prisma.account.findUnique({ 
        where: { accountNumber: req.accountNumber },
        include: { user: true }
      });
      const user = account?.user;
      return {
        id: req.id,
        accountNumber: req.accountNumber,
        email: req.email,
        status: req.status,
        rejectionReason: req.rejectionReason,
        createdAt: req.createdAt,
        temporaryPassword: user?.isFirstLogin ? user.temporaryPassword : null,
        isFirstLogin: user?.isFirstLogin || false,
      };
    })
  );

  const handleApprove = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    const request = await prisma.onlineAccessRequest.findUnique({ where: { id } });
    if (!request) return;
    
    const account = await prisma.account.findUnique({ 
      where: { accountNumber: request.accountNumber },
      include: { user: true }
    });
    const user = account?.user;
    if (user) {
        const tempPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        await prisma.user.update({
            where: { id: user.id },
            data: { 
                hasOnlineAccess: true,
                isFirstLogin: true,
                temporaryPassword: tempPassword,
                password: hashedPassword
            }
        });

        // Send Email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await sendEmail({
            to: user.email,
            subject: 'Internet Banking Access Approved',
            html: `
                <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
                  <h2>Internet Banking Access</h2>
                  <p>Dear ${user.firstName},</p>
                  <p>Your request for internet banking access has been approved.</p>
                  <p>Please use the following credentials to log in for the first time:</p>
                  <p><strong>Username (Account Number):</strong> ${request.accountNumber}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                  <br/>
                  <p>You will be required to set a permanent password and transaction PIN upon your first login. This temporary password will remain valid until you complete the setup.</p>
                  <a href="${baseUrl}/login" style="display: inline-block; padding: 10px 20px; background-color: #0b2545; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">Log In to Heritage Vault</a>
                  <p>Best regards,<br/>JP Heritage Bank Team</p>
                </div>
            `
        });
    }

    // Update request
    await prisma.onlineAccessRequest.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() }
    });

    revalidatePath('/admin/requests');
  };

  const handleReject = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    const reason = formData.get('rejectionReason') as string;
    
    const request = await prisma.onlineAccessRequest.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason, reviewedAt: new Date() }
    });

    await sendEmail({
        to: request.email,
        subject: 'Internet Banking Access Request Update',
        html: `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
              <h2>Internet Banking Access</h2>
              <p>Dear Customer,</p>
              <p>Your request for internet banking access could not be approved at this time.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>If you have any questions, please contact our support team.</p>
              <p>Best regards,<br/>JP Heritage Bank Team</p>
            </div>
        `
    });

    revalidatePath('/admin/requests');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Internet Banking Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">Review requests for online banking access credentials.</p>
        </div>
      </div>

      <AdminRequestList 
        initialRequests={enrichedRequests}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
