import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { LoansManagementClient } from '@/components/admin/LoansManagementClient';
import { getAdminLoans } from '@/app/actions/admin-ebank';
import { getAvailableLoanProducts } from '@/app/actions/savings';

export const dynamic = 'force-dynamic';

export default async function AdminLoansPage() {
  const [loans, loanProducts] = await Promise.all([
    getAdminLoans(),
    getAvailableLoanProducts(),
  ]);

  return (
    <AdminPageShell
      title="Lending & Credit Underwriting Desk"
      subtitle="Review pending institutional loan applications, approve pre-approvals, and execute direct account disbursement."
    >
      <LoansManagementClient
        initialLoans={loans}
        loanProducts={loanProducts}
      />
    </AdminPageShell>
  );
}
