import { prisma } from '@/lib/prisma';
import { AdminApplicationList } from '@/components/admin/AdminApplicationList';
import { handleApprove, handleReject, handleRequestVerification } from '@/app/actions/applications';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function AllApplicationsPage() {
  const applications = await prisma.accountApplication.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminPageShell 
      title="All Account Applications" 
      subtitle="Review and process customer onboarding requests across all statuses."
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
