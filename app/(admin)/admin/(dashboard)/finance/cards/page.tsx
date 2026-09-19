import { prisma } from '@/lib/prisma';
import { AdminCardList } from '@/components/admin/AdminCardList';
import { handleToggleCardStatus } from '@/app/actions/adminCards';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function AllCardsPage() {
  const cards = await prisma.card.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      account: {
        select: {
          accountNumber: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      }
    }
  });

  return (
    <AdminPageShell 
      title="All Cards" 
      subtitle="Manage all physical and virtual debit/credit cards."
    >
      <AdminCardList 
        initialCards={cards}
        onToggleStatus={handleToggleCardStatus}
      />
    </AdminPageShell>
  );
}
