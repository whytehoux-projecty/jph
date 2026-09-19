import { prisma } from '@/lib/prisma';
import { AdminApplicationList } from '@/components/admin/AdminApplicationList';
import { handleApprove, handleReject, handleRequestVerification } from '@/app/actions/applications';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function ApprovedApplicationsPage() {
  const applications = await prisma.accountApplication.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminPageShell 
      title="Approved Applications" 
      subtitle="Account applications that have been successfully processed and approved."
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
