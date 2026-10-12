import DepositClient from "./DepositClient";
import { getProfile } from "@/app/actions/profile";
import { getAccounts } from "@/app/actions/accounts";
import {
  getBankRoutingDetails,
  getCryptoDepositConfigs,
  getDepositLocations,
  getRecentDeposits,
  getUserDepositPermissions,
} from "@/app/actions/deposits";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DepositPage() {
  try {
    const [user, rawAccounts, routingDetails, cryptoConfigs, locations, recentDeposits, permissions] =
      await Promise.all([
        getProfile(),
        getAccounts(),
        getBankRoutingDetails(),
        getCryptoDepositConfigs(),
        getDepositLocations(),
        getRecentDeposits().catch(() => []),
        getUserDepositPermissions(),
      ]);


    const userPreferences = {
      language: user?.preferredLanguage || "en",
      currency: user?.preferredCurrency || "USD",
      name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Vault Holder",
    };

    const accounts = (rawAccounts || []).map((acc: any) => ({
      id: acc.id,
      accountNumber: acc.accountNumber,
      accountType: acc.accountType,
      balance: acc.balance,
      currency: acc.currency || "USD",
      name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
    }));

    return (
      <DepositClient
        userPreferences={userPreferences}
        accounts={accounts}
        routingDetails={routingDetails}
        cryptoConfigs={cryptoConfigs}
        locations={locations}
        recentDeposits={recentDeposits}
        permissions={permissions}
      />
    );
  } catch (error) {
    redirect("/login");
  }
}
