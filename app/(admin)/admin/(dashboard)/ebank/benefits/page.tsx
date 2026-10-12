import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { BenefitsManagementClient } from '@/components/admin/BenefitsManagementClient';
import { getAdminBenefits } from '@/app/actions/admin-ebank';

export const dynamic = 'force-dynamic';

export default async function AdminBenefitsPage() {
  const data = await getAdminBenefits();

  return (
    <AdminPageShell
      title="Rewards & Lifestyle Concierge Desk"
      subtitle="Manage loyalty points redemptions, fulfill 24/7 lifestyle concierge requests, and review private advisory bookings."
    >
      <BenefitsManagementClient initialData={data} />
    </AdminPageShell>
  );
}
