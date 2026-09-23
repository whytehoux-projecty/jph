import { prisma } from '@/lib/prisma';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { UnifiedApplicationList, UnifiedRequest } from '@/components/admin/UnifiedApplicationList';
import { 
  handleApprove, 
  handleReject, 
  handleRequestVerification, 
  handleEportalApprove, 
  handleEportalReject, 
  handleChequeApprove, 
  handleChequeReject 
} from '@/app/actions/applications';

export const dynamic = 'force-dynamic';

export default async function ApplicationManagementHub() {
  // Fetch Account Applications
  const accountApps = await prisma.accountApplication.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Fetch e-Portal Requests
  const eportalReqs = await prisma.onlineAccessRequest.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Fetch Cheque Requests
  const chequeReqs = await prisma.chequeRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { account: true, user: true }
  });

  // Merge into UnifiedRequest[]
  const requests: UnifiedRequest[] = [
    ...accountApps.map(app => ({
      id: app.id,
      type: 'ACCOUNT' as const,
      applicantName: `${app.firstName} ${app.lastName}`,
      applicantEmail: app.email,
      date: app.createdAt,
      status: app.status,
      details: `${app.desiredAccountType} (${app.currencyPreference})`,
      raw: app
    })),
    ...eportalReqs.map(req => ({
      id: req.id,
      type: 'EPORTAL' as const,
      applicantName: req.accountNumber, // OnlineAccessRequest only stores accountNumber and email initially, maybe needs user join later if available. For now just show acc.
      applicantEmail: req.email,
      date: req.createdAt,
      status: req.status,
      details: `Activation for ${req.accountNumber}`,
      raw: req
    })),
    ...chequeReqs.map(req => ({
      id: req.id,
      type: 'CHEQUE' as const,
      applicantName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Unknown',
      applicantEmail: req.user?.email || 'Unknown',
      date: req.createdAt,
      status: req.status,
      details: `${req.numberOfLeaves} leaves via ${req.deliveryMethod}`,
      raw: req
    }))
  ];

  // Sort by date descending
  requests.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <AdminPageShell 
      title="Application Management Hub" 
      subtitle="Unified inbox for new accounts, e-portal access, and cheque requests."
    >
      <UnifiedApplicationList 
        requests={requests}
        onAccountApprove={handleApprove}
        onAccountReject={handleReject}
        onAccountVerify={handleRequestVerification}
        onEportalApprove={handleEportalApprove}
        onEportalReject={handleEportalReject}
        onChequeApprove={handleChequeApprove}
        onChequeReject={handleChequeReject}
      />
    </AdminPageShell>
  );
}
