import { prisma } from '@/lib/prisma';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { TransferMethodsManager } from '@/components/admin/TransferMethodsManager';

export const dynamic = 'force-dynamic';

export default async function TransfersManagementPage() {
  const transferMethods = await prisma.transferMethodConfig.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <AdminPageShell 
      title="Transfer Methods Configuration" 
      subtitle="Manage global transfer methods, limits, fees, and system availability."
    >
      <div className="max-w-5xl mx-auto">
        <TransferMethodsManager initialMethods={transferMethods} />
      </div>
    </AdminPageShell>
  );
}
