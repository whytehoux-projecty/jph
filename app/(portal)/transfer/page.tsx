import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import { getEnabledUserTransferMethods } from "@/app/actions/transferConfig";
import { getProviders } from "@/app/actions/bills";
import TransferClient from "./TransferClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TransferPage() {
  let accounts, userPreferences, transferMethods = [], providers;
  
  try {
    const rawAccounts = await getAccounts();
    accounts = rawAccounts.map((acc: any) => ({
      id: acc.id,
      accountNumber: acc.accountNumber,
      accountType: acc.accountType,
      balance: acc.balance,
      currency: acc.currency,
      name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
    }));

    const user = await getProfile();
    userPreferences = {
      language: user?.preferredLanguage || "en",
      currency: user?.preferredCurrency || "USD",
    };

    transferMethods = await getEnabledUserTransferMethods();

    const rawProviders = await getProviders();
    providers = rawProviders.reduce((acc: any, p: any) => {
        if (!acc[p.country]) acc[p.country] = {};
        if (!acc[p.country][p.category]) acc[p.country][p.category] = [];
        acc[p.country][p.category].push(p.name);
        return acc;
    }, {});
  } catch (error) {
    redirect('/login');
  }

  return <TransferClient initialAccounts={accounts} userPreferences={userPreferences} transferMethods={transferMethods} initialProviders={providers} />;
}
