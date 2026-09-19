import { prisma } from '@/lib/prisma';
import { AdminApplicationList } from '@/components/admin/AdminApplicationList';
import { handleApprove, handleReject, handleRequestVerification } from '@/app/actions/applications';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function VerificationRequiredApplicationsPage() {
  const applications = await prisma.accountApplication.findMany({
    where: { status: 'VERIFICATION_REQUIRED' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminPageShell 
      title="Verification Required" 
      subtitle="Account applications pending identity verification via video call or document upload."
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
