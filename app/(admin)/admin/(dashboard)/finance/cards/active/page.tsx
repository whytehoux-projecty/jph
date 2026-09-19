import { prisma } from '@/lib/prisma';
import { AdminCardList } from '@/components/admin/AdminCardList';
import { handleToggleCardStatus } from '@/app/actions/adminCards';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function ActiveCardsPage() {
  const cards = await prisma.card.findMany({
    where: { status: 'ACTIVE' },
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
      title="Active Cards" 
      subtitle="Currently active and unblocked cards."
    >
      <AdminCardList 
        initialCards={cards}
        onToggleStatus={handleToggleCardStatus}
      />
    </AdminPageShell>
  );
}
