import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { DepositsManagementClient } from '@/components/admin/DepositsManagementClient';
import { getAdminDeposits, getAdminWithdrawals } from '@/app/actions/admin-ebank';
import {
  getBankRoutingDetails,
  getCryptoDepositConfigs,
  getDepositLocations,
} from '@/app/actions/deposits';

export const dynamic = 'force-dynamic';

export default async function AdminDepositsPage() {
  const [deposits, withdrawals, routingDetails, cryptoConfigs, locations] = await Promise.all([
    getAdminDeposits(),
    getAdminWithdrawals(),
    getBankRoutingDetails(),
    getCryptoDepositConfigs(),
    getDepositLocations(),
  ]);

  return (
    <AdminPageShell
      title="Deposits & Treasury Ingestion"
      subtitle="Review pending deposits and withdrawal requests, and check the bank details, crypto addresses and branches customers see."
    >
      <DepositsManagementClient
        initialDeposits={deposits}
        initialWithdrawals={withdrawals}
        routingDetails={routingDetails}
        cryptoConfigs={cryptoConfigs}
        locations={locations}
      />
    </AdminPageShell>
  );
}
