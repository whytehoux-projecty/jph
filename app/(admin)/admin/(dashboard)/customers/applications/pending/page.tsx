import { prisma } from '@/lib/prisma';
import { AdminApplicationList } from '@/components/admin/AdminApplicationList';
import { handleApprove, handleReject, handleRequestVerification } from '@/app/actions/applications';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function PendingApplicationsPage() {
  const applications = await prisma.accountApplication.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminPageShell 
      title="Pending Applications" 
      subtitle="Account applications waiting for administrative review."
    >
      <AdminApplicationList 
        initialApplications={applications}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestVerification={handleRequestVerification}
      />
    </AdminPageShell>
  );
}
