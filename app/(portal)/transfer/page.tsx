import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import { getEnabledUserTransferMethods } from "@/app/actions/transferConfig";
import TransferClient from "./TransferClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TransferPage() {
  let accounts, userPreferences, transferMethods = [];
  
  try {
    const rawAccounts = await getAccounts();
    accounts = rawAccounts.map((acc: any) => ({
      id: acc.id,
      accountNumber: acc.accountNumber,
      accountType: acc.accountType,
      balance: acc.balance,
      currency: acc.currency,
    }));

    const user = await getProfile();
    userPreferences = {
      language: user?.preferredLanguage || "en",
      currency: user?.preferredCurrency || "USD",
    };

    transferMethods = await getEnabledUserTransferMethods();
  } catch (error) {
    redirect('/login');
  }

  return <TransferClient initialAccounts={accounts} userPreferences={userPreferences} transferMethods={transferMethods} />;
}
