import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { AdminUserList } from '@/components/admin/AdminUserList';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      accounts: {
        select: {
          id: true,
          accountNumber: true,
          accountType: true,
          balance: true,
          status: true,
        }
      }
    }
  });

  const handleResetPassword = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    
    // Generate a secure random 8-character password
    const newPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
    
    // In a real app, you would email this password.
    // For this demo, we'll log it or use an ephemeral return approach.
    // Next.js server actions return values to the client if invoked properly,
    // but with `action={}` in a form, returning doesn't directly show in UI unless handled.
    // We'll update the component to handle this as a client-side action calling a server function.
  };

  const handleDeletePin = async (formData: FormData) => {
    'use server'
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
  };

  const handleLoginAs = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    
    const adminId = session?.user?.id as string;
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
  };

  const handleToggleStatus = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    
    await prisma.user.update({
      where: { id },
      data: { status }
    });
    
    revalidatePath('/admin/users');
  };

  const handleToggleTier = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    const tier = formData.get('tier') as string;
    
    await prisma.user.update({
      where: { id },
      data: { tier }
    });
    
    revalidatePath('/admin/users');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Customer Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage user access, tiers, and view linked accounts.</p>
        </div>
      </div>

      <AdminUserList 
        initialUsers={users}
        onToggleStatus={handleToggleStatus}
        onToggleTier={handleToggleTier}
        onDeletePin={handleDeletePin}
        onLoginAs={handleLoginAs}
      />
    </div>
  );
}
