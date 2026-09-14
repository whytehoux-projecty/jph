import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { AdminUserList } from '@/components/admin/AdminUserList';

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
      />
    </div>
  );
}
