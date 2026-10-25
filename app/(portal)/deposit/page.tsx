import { getProfile } from "@/app/actions/profile";
import { getAccounts } from "@/app/actions/accounts";
import {
  getBankRoutingDetails,
  getCryptoDepositConfigs,
  getDepositLocations,
  getRecentDeposits,
  getUserDepositPermissions,
} from "@/app/actions/deposits";
import { loadOrSignIn } from "@/lib/portal-data";
import { maskAccountNumber } from "@/lib/format";
import { languageToLocale } from "@/lib/utils";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import DepositClient, { type DepositAccount } from "./DepositClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Deposit and withdraw" };

export default async function DepositPage() {
  const { user, rawAccounts, routingDetails, cryptoConfigs, locations, recent, permissions } = await loadOrSignIn(async () => {
    const [user, rawAccounts, routingDetails, cryptoConfigs, locations, recent, permissions] = await Promise.all([
      getProfile(),
      getAccounts(),
      getBankRoutingDetails(),
      getCryptoDepositConfigs(),
      getDepositLocations(),
      getRecentDeposits(),
      getUserDepositPermissions(),
    ]);
    return { user, rawAccounts, routingDetails, cryptoConfigs, locations, recent, permissions };
  });

  // Only the bank's own, active accounts can take deposits or fund withdrawals.
  const accounts: DepositAccount[] = rawAccounts
    .filter((a) => !a.isExternal && a.status === "ACTIVE")
    .map((a) => ({
      id: a.id,
      label: `${VAULT_TYPES[normalizeVaultType(a.accountType)]?.label ?? a.accountType} ${maskAccountNumber(a.accountNumber)}`,
      accountNumber: a.accountNumber,
      balance: Number(a.balance),
      currency: a.currency || "USD",
    }));

  return (
    <DepositClient
      holderName={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
      locale={languageToLocale(user?.preferredLanguage || "en")}
      hideBalances={!!user?.hideBalance}
      accounts={accounts}
      routingDetails={routingDetails}
      cryptoConfigs={cryptoConfigs}
      locations={locations}
      recent={recent}
      permissions={permissions}
    />
  );
}
