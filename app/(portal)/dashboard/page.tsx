import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { BalanceVisibilityProvider } from "@/components/dashboard/balance-visibility";
import { BalanceSummary } from "@/components/dashboard/BalanceSummary";
import { AccountList, type DashboardAccount, type DashboardWallet } from "@/components/dashboard/AccountList";
import { RecentTransactions, type DashboardTransaction } from "@/components/dashboard/RecentTransactions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MonthSummary } from "@/components/dashboard/MonthSummary";
import { AdvisorCard } from "@/components/dashboard/AdvisorCard";
import { getProfile } from "@/app/actions/profile";
import { getAccounts, getCryptoWallets } from "@/app/actions/accounts";
import { countPendingTransactions, getTransactions, getTransactionStats } from "@/app/actions/transactions";
import { getBillHistory } from "@/app/actions/bills";
import { languageToLocale } from "@/lib/utils";
import { totalsByCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview" };

const RECENT_COUNT = 6;

async function loadDashboard() {
  const [user, accounts, stats, recent, wallets, pendingCount, bills] = await Promise.all([
    getProfile(),
    getAccounts(),
    getTransactionStats("month"),
    getTransactions({ limit: RECENT_COUNT }),
    getCryptoWallets(),
    countPendingTransactions(),
    getBillHistory(),
  ]);
  return { user, accounts, stats, recent, wallets, pendingCount, bills };
}

export default async function DashboardPage() {
  let data: Awaited<ReturnType<typeof loadDashboard>>;
  try {
    data = await loadDashboard();
  } catch (error) {
    // Signed out (or session expired) → sign in. Anything else is a real
    // failure and goes to error.tsx, which offers a retry.
    if (error instanceof Error && error.message === "Unauthorized") redirect("/login");
    throw error;
  }

  const { user, accounts, stats, recent, wallets, pendingCount, bills } = data;
  if (!user) redirect("/login");

  const locale = languageToLocale(user.preferredLanguage || "en");
  const fallbackCurrency = user.preferredCurrency || "USD";

  const accountRows: DashboardAccount[] = accounts.map((a) => ({
    id: a.id,
    accountNumber: a.accountNumber,
    accountType: a.accountType,
    currency: a.currency || fallbackCurrency,
    balance: Number(a.balance),
    status: a.status,
    isPrimary: a.isPrimary,
    isExternal: a.isExternal,
    institutionName: a.institutionName,
  }));
  const walletRows: DashboardWallet[] = wallets.map((w) => ({
    id: w.id,
    currency: w.currency,
    balance: Number(w.balance),
    status: w.status,
  }));
  const txRows: DashboardTransaction[] = recent.map((t) => ({
    id: t.id,
    type: t.type,
    transactionType: t.transactionType,
    description: t.description,
    amount: Number(t.amount),
    currency: t.currency || fallbackCurrency,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  }));

  // Headline total: the bank's own accounts only, per currency.
  const ownAccounts = accountRows.filter((a) => !a.isExternal);
  const totals = totalsByCurrency(ownAccounts, fallbackCurrency);
  const singleCurrency = totals.length <= 1;

  const restricted = accountRows.filter((a) => a.status === "FROZEN" || a.status === "SUSPENDED");
  const pendingBills = bills.filter((b) => b.status === "PENDING").length;
  const bankMessage = user.eportalNotificationMessage?.trim();

  return (
    <BalanceVisibilityProvider initialHidden={user.hideBalance}>
      <PageHeader
        title={`Welcome back, ${user.firstName.charAt(0).toUpperCase()}${user.firstName.slice(1).toLowerCase()}`}
        description="Your balances, recent activity and anything that needs your attention."
        actions={
          <Button asChild size="lg" icon={<ArrowLeftRight aria-hidden="true" />}>
            <Link href="/transfer">Move money</Link>
          </Button>
        }
      />

      {(restricted.length > 0 || bankMessage || pendingCount > 0 || pendingBills > 0) && (
        <section aria-label="Alerts" className="mb-6 flex flex-col gap-3">
          {restricted.length > 0 && (
            <Alert
              variant="danger"
              title={
                restricted.length === 1
                  ? "One of your accounts is restricted"
                  : `${restricted.length} of your accounts are restricted`
              }
              actions={
                <Button asChild variant="secondary" size="sm">
                  <Link href="/support">Contact support</Link>
                </Button>
              }
            >
              Some payments and transfers are unavailable until the restriction is lifted.
            </Alert>
          )}
          {bankMessage && (
            <Alert variant="warning" title="Message from Heritage Trust">
              {bankMessage}
            </Alert>
          )}
          {(pendingCount > 0 || pendingBills > 0) && (
            <Alert
              variant="info"
              title="Being processed"
              actions={
                <Button asChild variant="secondary" size="sm">
                  <Link href={pendingCount > 0 ? "/activities" : "/bills"}>View details</Link>
                </Button>
              }
            >
              {[
                pendingCount > 0 && `${pendingCount} ${pendingCount === 1 ? "transaction is" : "transactions are"} pending`,
                pendingBills > 0 && `${pendingBills} bill ${pendingBills === 1 ? "payment is" : "payments are"} awaiting processing`,
              ]
                .filter(Boolean)
                .join(", and ")}
              .
            </Alert>
          )}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-8 lg:gap-8">
          <BalanceSummary totals={totals} accountCount={ownAccounts.length} locale={locale} />
          <QuickActions />
          <AccountList accounts={accountRows} wallets={walletRows} locale={locale} />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4 lg:gap-8">
          {singleCurrency && (
            <MonthSummary
              moneyIn={stats.income || 0}
              moneyOut={stats.expenses || 0}
              currency={totals[0]?.currency ?? fallbackCurrency}
              locale={locale}
            />
          )}
          {user.accountManagerName && (
            <AdvisorCard
              name={user.accountManagerName}
              title={user.accountManagerTitle}
              phone={user.accountManagerPhone}
              email={user.accountManagerEmail}
            />
          )}
        </div>

        <div className="lg:col-span-12">
          <RecentTransactions transactions={txRows} locale={locale} />
        </div>
      </div>
    </BalanceVisibilityProvider>
  );
}
