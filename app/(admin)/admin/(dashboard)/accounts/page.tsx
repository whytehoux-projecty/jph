import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { AdminAccountList } from '@/components/admin/AdminAccountList';

export default async function AdminAccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
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
    
    await prisma.account.update({
      where: { id },
      data: { status }
    });
    
    revalidatePath('/admin/accounts');
  };

  const handleUpdateBalance = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    const balanceStr = formData.get('balance') as string;
    const balance = parseFloat(balanceStr);

    if (isNaN(balance)) return;
    
    await prisma.account.update({
      where: { id },
      data: { balance }
    });
    
    revalidatePath('/admin/accounts');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Account Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage all bank accounts, adjust statuses, and override balances for demos.</p>
        </div>
      </div>

      <AdminAccountList 
        initialAccounts={accounts}
        onToggleStatus={handleToggleStatus}
        onUpdateBalance={handleUpdateBalance}
      />
    </div>
  );
}
