import { prisma } from '@/lib/prisma';
import { AdminApplicationList } from '@/components/admin/AdminApplicationList';
import { handleApprove, handleReject, handleRequestVerification } from '@/app/actions/applications';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function DeclinedApplicationsPage() {
  const applications = await prisma.accountApplication.findMany({
    where: { status: 'REJECTED' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminPageShell 
      title="Declined Applications" 
      subtitle="Account applications that were rejected."
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
