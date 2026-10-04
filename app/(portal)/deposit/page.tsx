import DepositClient from "./DepositClient";
import { getProfile } from "@/app/actions/profile";
import { getAccounts } from "@/app/actions/accounts";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DepositPage() {
  let userPreferences, accounts;
  
  try {
    const user = await getProfile();
    userPreferences = {
      language: user?.preferredLanguage || "en",
      currency: user?.preferredCurrency || "USD",
    };
    
    const rawAccounts = await getAccounts();
    accounts = rawAccounts.map((acc: any) => ({
      id: acc.id,
      accountNumber: acc.accountNumber,
      accountType: acc.accountType,
      balance: acc.balance,
      currency: acc.currency,
      name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
    }));
  } catch (error) {
    redirect('/login');
  }

  return <DepositClient userPreferences={userPreferences} accounts={accounts} />;
}
