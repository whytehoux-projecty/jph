import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { AdminCardList } from '@/components/admin/AdminCardList';

export default async function AdminCardsPage() {
  const cards = await prisma.card.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      account: {
        select: {
          accountNumber: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
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
    
    await prisma.card.update({
      where: { id },
      data: { status }
    });
    
    revalidatePath('/admin/cards');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Card Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Review active cards, block compromised numbers, or unfreeze accounts.</p>
        </div>
      </div>

      <AdminCardList 
        initialCards={cards}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
