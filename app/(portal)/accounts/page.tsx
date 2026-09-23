import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import AccountsClient from "./AccountsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  let user, rawAccounts;
  
  try {
    user = await getProfile();
    rawAccounts = await getAccounts();
  } catch (error) {
    redirect('/login');
  }

  const userPreferences = {
    language: user?.preferredLanguage || "en",
    currency: user?.preferredCurrency || "USD",
  };

  const initialAccounts = rawAccounts.map((acc: any) => ({
    id: acc.id,
    name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
    accountNumber: acc.accountNumber,
    maskedNumber: `****${acc.accountNumber.slice(-4)}`,
    balance: acc.balance,
    availableBalance: acc.balance,
    type: acc.accountType.toLowerCase(),
    interestRate:
      acc.accountType.toLowerCase().includes("savings")
        ? "4.20% APY"
        : acc.accountType.toLowerCase().includes("credit") || acc.accountType.toLowerCase().includes("loan")
        ? "21.99% APR"
        : acc.accountType.toLowerCase().includes("investment") || acc.accountType.toLowerCase().includes("wealth")
        ? "Variable"
        : "0.00%",
    monthlyChange: 0,
    openedDate: acc.createdAt.toISOString(),
    status: acc.status.toLowerCase(),
    currency: acc.currency,
  }));

  return (
    <AccountsClient 
      initialAccounts={initialAccounts}
      userPreferences={userPreferences}
    />
  );
}
