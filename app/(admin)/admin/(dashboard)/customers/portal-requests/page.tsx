import { prisma } from '@/lib/prisma';
import { AdminRequestList } from '@/components/admin/AdminRequestList';
import { handleApproveRequest, handleRejectRequest } from '@/app/actions/requests';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

async function getEnrichedRequests(whereClause: any = {}) {
  const requests = await prisma.onlineAccessRequest.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });

  return await Promise.all(
    requests.map(async (req) => {
      const account = await prisma.account.findUnique({ 
        where: { accountNumber: req.accountNumber },
        include: { user: true }
      });
      const user = account?.user;
      return {
        id: req.id,
        accountNumber: req.accountNumber,
        email: req.email,
        status: req.status,
        rejectionReason: req.rejectionReason,
        createdAt: req.createdAt,
        temporaryPassword: user?.isFirstLogin ? user.temporaryPassword : null,
        isFirstLogin: user?.isFirstLogin || false,
      };
    })
  );
}

export default async function AllPortalRequestsPage() {
  const enrichedRequests = await getEnrichedRequests();

  return (
    <AdminPageShell 
      title="All Access Requests" 
      subtitle="Review requests for online banking access credentials."
    >
      <AdminRequestList 
        initialRequests={enrichedRequests}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />
    </AdminPageShell>
  );
}
