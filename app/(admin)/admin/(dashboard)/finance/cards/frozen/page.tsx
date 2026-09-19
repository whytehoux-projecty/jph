import { prisma } from '@/lib/prisma';
import { AdminCardList } from '@/components/admin/AdminCardList';
import { handleToggleCardStatus } from '@/app/actions/adminCards';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function FrozenCardsPage() {
  const cards = await prisma.card.findMany({
    where: { status: 'FROZEN' },
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
      title="Frozen Cards" 
      subtitle="Cards that have been blocked or frozen due to security concerns."
    >
      <AdminCardList 
        initialCards={cards}
        onToggleStatus={handleToggleCardStatus}
      />
    </AdminPageShell>
  );
}
