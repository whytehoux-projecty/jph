import { redirect } from "next/navigation";
import SavingsClient from "./SavingsClient";
import { getProfile } from "@/app/actions/profile";
import { getAccounts } from "@/app/actions/accounts";
import {
  getSavingsGoals,
  getAvailableLoanProducts,
  getUserCreditScore,
  getRecentLoanApplications,
  getUserLoanPermissions,
} from "@/app/actions/savings";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  let userPreferences = {
    language: "en",
    currency: "USD",
    name: "Heritage Client",
    email: "",
  };

  try {
    const user = await getProfile();
    if (user) {
      userPreferences = {
        language: user.preferredLanguage || "en",
        currency: user.preferredCurrency || "USD",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Heritage Client",
        email: user.email || "",
      };
    }
  } catch {
    redirect("/login");
  }

  let accounts: any[] = [];
  try {
    const rawAccounts = await getAccounts();
    accounts = rawAccounts.map((a: any) => ({
      id: a.id,
      name: a.name || `${a.accountType} Account`,
      accountType: a.accountType,
      balance: a.balance,
      currency: a.currency,
      accountNumber: a.accountNumber,
    }));
  } catch {
    accounts = [];
  }

  let savingsGoals: any[] = [];
  let loanProducts: any[] = [];
  let creditScore = { score: 752, rating: "Excellent", change: 8 };
  let recentLoans: any[] = [];
  let loanPermissions: any = { enabled: true, methods: { auto: true, mortgage: true, personal: true, heloc: true, business: true } };

  try {
    const [goals, products, cs, loans, perms] = await Promise.all([
      getSavingsGoals(),
      getAvailableLoanProducts(),
      getUserCreditScore(),
      getRecentLoanApplications(),
      getUserLoanPermissions(),
    ]);

    savingsGoals = goals;
    loanProducts = products;
    creditScore = cs;
    recentLoans = loans;
    loanPermissions = perms;
  } catch (err) {
    console.error("Error fetching savings and loan data:", err);
  }

  return (
    <SavingsClient
      userPreferences={userPreferences}
      accounts={accounts}
      initialSavingsGoals={savingsGoals}
      loanProducts={loanProducts}
      creditScore={creditScore}
      initialRecentLoans={recentLoans}
      loanPermissions={loanPermissions}
    />
  );
}

