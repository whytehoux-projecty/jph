import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { AdminApplicationList } from '@/components/admin/AdminApplicationList';

export default async function AccountApplications() {
  const applications = await prisma.accountApplication.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const handleApprove = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    const app = await prisma.accountApplication.findUnique({ where: { id } });
    if (!app) return;
    
    // Create the mock user
    const user = await prisma.user.create({
      data: {
        email: app.email,
        password: 'password123', // Default mock password
        firstName: app.firstName,
        lastName: app.lastName,
        phone: app.phone,
        dateOfBirth: app.dateOfBirth,
        status: 'ACTIVE',
      }
    });

    // Create the mock account
    await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        accountType: app.applicationType,
        balance: 0.00
      }
    });

    // Update application
    await prisma.accountApplication.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() }
    });

    revalidatePath('/admin/applications');
  };

  const handleReject = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    await prisma.accountApplication.update({
      where: { id },
      data: { status: 'REJECTED', reviewedAt: new Date() }
    });
    revalidatePath('/admin/applications');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Account Applications</h2>
          <p className="text-sm text-muted-foreground mt-1">Review new customer onboarding requests.</p>
        </div>
      </div>

      <AdminApplicationList 
        initialApplications={applications}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
