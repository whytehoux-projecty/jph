import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { LoansManagementClient } from '@/components/admin/LoansManagementClient';
import { getAdminLoans } from '@/app/actions/admin-ebank';
import { LOAN_PRODUCTS } from '@/lib/loan-products';

export const dynamic = 'force-dynamic';

export default async function AdminLoansPage() {
  const loans = await getAdminLoans();

  return (
    <AdminPageShell
      title="Lending & Credit Underwriting Desk"
      subtitle="Review loan applications from the portal. Approving disburses the amount into the customer's chosen account."
    >
      <LoansManagementClient
        initialLoans={loans}
        loanProducts={LOAN_PRODUCTS}
      />
    </AdminPageShell>
  );
}
