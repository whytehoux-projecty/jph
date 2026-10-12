import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { DepositsManagementClient } from '@/components/admin/DepositsManagementClient';
import { getAdminDeposits } from '@/app/actions/admin-ebank';
import {
  getBankRoutingDetails,
  getCryptoDepositConfigs,
  getDepositLocations,
} from '@/app/actions/deposits';

export const dynamic = 'force-dynamic';

export default async function AdminDepositsPage() {
  const [deposits, routingDetails, cryptoConfigs, locations] = await Promise.all([
    getAdminDeposits(),
    getBankRoutingDetails(),
    getCryptoDepositConfigs(),
    getDepositLocations(),
  ]);

  return (
    <AdminPageShell
      title="Deposits & Treasury Ingestion"
      subtitle="Review pending deposits, configure institutional wire routing, crypto addresses, and vault drop hubs."
    >
      <DepositsManagementClient
        initialDeposits={deposits}
        routingDetails={routingDetails}
        cryptoConfigs={cryptoConfigs}
        locations={locations}
      />
    </AdminPageShell>
  );
}
