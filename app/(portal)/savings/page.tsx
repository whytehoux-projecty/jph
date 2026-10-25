import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import {
  getRecentLoanApplications,
  getSavingsGoals,
  getUserCreditScore,
  getUserLoanPermissions,
} from "@/app/actions/savings";
import { loadOrSignIn } from "@/lib/portal-data";
import { maskAccountNumber } from "@/lib/format";
import { languageToLocale } from "@/lib/utils";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import { LOAN_PRODUCTS } from "@/lib/loan-products";
import type { ContributionMode, Frequency } from "@/lib/savings-schedule";
import type { MoneyAccount } from "@/components/portal/money-fields";
import SavingsClient, { type GoalView, type LoanApplicationView } from "./SavingsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Savings and loans" };

export default async function SavingsPage() {
  const { user, rawAccounts, goals, creditScore, loans, permissions } = await loadOrSignIn(async () => {
    const [user, rawAccounts, goals, creditScore, loans, permissions] = await Promise.all([
      getProfile(),
      getAccounts(),
      getSavingsGoals(),
      getUserCreditScore(),
      getRecentLoanApplications(),
      getUserLoanPermissions(),
    ]);
    return { user, rawAccounts, goals, creditScore, loans, permissions };
  });

  const accountLabel = (a: { accountType: string; accountNumber: string }) =>
    `${VAULT_TYPES[normalizeVaultType(a.accountType)]?.label ?? a.accountType} ${maskAccountNumber(a.accountNumber)}`;

  const accounts: MoneyAccount[] = rawAccounts
    .filter((a) => !a.isExternal && a.status === "ACTIVE")
    .map((a) => ({ id: a.id, label: accountLabel(a), accountNumber: a.accountNumber, balance: Number(a.balance), currency: a.currency || "USD" }));

  const goalViews: GoalView[] = goals.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    targetDate: g.targetDate.toISOString(),
    accountId: g.accountId,
    accountLabel: g.account ? accountLabel(g.account) : null,
    mode: g.contributionMode as ContributionMode,
    amount: g.contributionAmount,
    frequency: g.frequency as Frequency | null,
    scheduleDay: g.scheduleDay,
    nextContributionAt: g.nextContributionAt?.toISOString() ?? null,
  }));

  const loanViews: LoanApplicationView[] = loans.map((l) => ({
    id: l.id,
    reference: l.reference,
    loanName: l.loanName,
    amount: l.amount,
    currency: l.currency,
    termMonths: l.termMonths,
    status: l.status,
    rejectionReason: l.rejectionReason,
    createdAt: l.createdAt,
    accountLabel: accountLabel(l),
  }));

  // Products the bank publishes and an administrator hasn't turned off for this customer.
  const loanProducts = permissions.enabled ? LOAN_PRODUCTS.filter((p) => permissions.methods[p.permission] !== false) : [];

  return (
    <SavingsClient
      accounts={accounts}
      goals={goalViews}
      creditScore={creditScore}
      loanProducts={loanProducts}
      loans={loanViews}
      locale={languageToLocale(user?.preferredLanguage || "en")}
      hideBalances={!!user?.hideBalance}
    />
  );
}
