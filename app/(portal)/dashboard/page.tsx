import "./dashboard-animations.css";
import { Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank, LayoutGrid, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/dashboard/overview";
import { RecentTransactions } from "@/components/dashboard/recent-sales";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, languageToLocale, translate } from '@/lib/utils';
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PrimaryAccountCard } from "@/components/dashboard/PrimaryAccountCard";
import { CashFlowRatioCard } from "@/components/dashboard/CashFlowRatioCard";
import { SavingsLoansCard } from "@/components/dashboard/SavingsLoansCard";
import { InvestmentPortfolioCard } from "@/components/dashboard/InvestmentPortfolioCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SpendingByCategory } from "@/components/dashboard/SpendingByCategory";
import { DashboardIntelligenceSidebar } from "@/components/dashboard/DashboardIntelligenceSidebar";
import { BalanceBanner } from "@/components/dashboard/BalanceBanner";
import type { Notice } from "@/components/dashboard/NoticeCarousel";
import { getProfile } from "@/app/actions/profile";
import { getAccounts, getCryptoWallets } from "@/app/actions/accounts";
import { getTransactions, getTransactionStats } from "@/app/actions/transactions";
import { getSavingsGoal } from "@/app/actions/savings";
import { redirect } from "next/navigation";
import Link from "next/link";


export const dynamic = "force-dynamic";

const processChartData = (txs: any[]) => {
  const monthlyData: Record<
    string,
    { name: string; income: number; expense: number }
  > = {};

  const sortedTxs = [...txs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  sortedTxs.forEach((tx) => {
    const date = new Date(tx.createdAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = date.toLocaleString("default", { month: "short" });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { name: monthName, income: 0, expense: 0 };
    }

    const amt = Number(tx.amount);
    if (amt > 0) {
      monthlyData[monthKey].income += amt;
    } else {
      monthlyData[monthKey].expense += Math.abs(amt);
    }
  });

  return Object.values(monthlyData);
};

export default async function DashboardPage() {
  let user, accounts, stats, transactions, allTransactions, goal, cryptoWallets;
  
  try {
    user = await getProfile();
    accounts = await getAccounts();
    stats = await getTransactionStats("month");
    transactions = await getTransactions({ limit: 5 });
    allTransactions = await getTransactions({ limit: 50 });
    goal = await getSavingsGoal();
    cryptoWallets = await getCryptoWallets();
  } catch (error) {
    redirect('/login');
  }

  if (!user || !accounts || !stats || !transactions || !allTransactions) return null;

  const totalBalance = accounts.reduce((sum: any, acc: any) => sum + Number(acc.balance), 0);
  const income = stats.income || 0;
  const expenses = stats.expenses || 0;
  const savingsGoal = goal?.currentAmount || 0;
  const savingsTarget = goal?.targetAmount || 25000;
  const analyticsData = processChartData(allTransactions || []);
  const language = user?.preferredLanguage || 'en';
  const currency = user?.preferredCurrency || 'USD';

  // Savings accounts and Goals
  const savingsAccounts = accounts.filter((a: any) =>
    a.accountType.toLowerCase().includes("saving")
  );
  // Savings: account balances only; the goal amount is a fallback when no savings account exists
  // (a goal usually tracks money already held in a savings account, so adding both double counts).
  const totalSavings = savingsAccounts.length > 0
    ? savingsAccounts.reduce((sum: number, a: any) => sum + Number(a.balance || 0), 0)
    : (goal?.currentAmount || 0);

  // Real balance history of the primary account for the sparkline
  const primaryAcc: any = accounts.find((a: any) => a.isPrimary) || accounts[0];
  const primarySeries: number[] = primaryAcc
    ? (allTransactions || [])
        .filter((t: any) => t.accountId === primaryAcc.id && typeof t.runningBalance === "number")
        .slice(0, 12)
        .reverse()
        .map((t: any) => t.runningBalance as number)
    : [];

  // Loan and Credit Liability accounts
  const loanAccounts = accounts.filter(
    (a: any) =>
      a.accountType.toLowerCase().includes("loan") ||
      a.accountType.toLowerCase().includes("credit")
  );
  const totalLoans = loanAccounts.reduce(
    (sum: number, a: any) => sum + Math.abs(Number(a.balance || 0)),
    0
  );

  const hasSavingsData = savingsAccounts.length > 0 || Boolean(goal);
  const hasLoansData = loanAccounts.length > 0;

  // Attached Investment & Wealth accounts
  const investmentAccounts = accounts.filter(
    (a: any) =>
      a.accountType.toLowerCase().includes("invest") ||
      a.accountType.toLowerCase().includes("wealth")
  );

  const serializedTransactions = (transactions || []).map((t: any) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt?.toISOString() || t.createdAt.toISOString(),
    processedAt: t.processedAt?.toISOString(),
  }));

  const pendingItems = (allTransactions || [])
    .filter((t: any) => t.status === "PENDING" || t.status === "processing")
    .map((t: any) => ({
      id: t.id,
      type: t.transactionType || "Wire Transfer",
      description: t.description || "Pending transaction",
      amount: Math.abs(t.amount),
      currency: t.currency || currency,
      date: t.createdAt.toISOString(),
    }));

  const notices: Notice[] = [];
  const restricted = accounts.filter((a: any) => a.status === "FROZEN" || a.status === "SUSPENDED");
  if (restricted.length > 0) {
    notices.push({
      id: "restricted-accounts",
      tone: "critical",
      title: `${restricted.length} account${restricted.length > 1 ? "s are" : " is"} restricted`,
      message: "Some transactions are unavailable until the restriction is lifted. Contact your advisor for assistance.",
      href: "/support",
      cta: "Contact support",
    });
  }
  if ((user as any)?.eportalNotificationMessage) {
    notices.push({
      id: "admin-message",
      tone: "critical",
      title: "Important message from your bank",
      message: (user as any).eportalNotificationMessage,
    });
  }
  if (pendingItems.length > 0) {
    notices.push({
      id: "pending-items",
      tone: "info",
      title: `${pendingItems.length} transaction${pendingItems.length > 1 ? "s" : ""} pending`,
      message: "Your recent transfers are being processed and will settle shortly.",
      href: "/activities",
      cta: "View activity",
    });
  }
  notices.push(
    {
      id: "promo-rewards",
      tone: "promo",
      title: "Benefits & Rewards",
      message: "Explore member perks, cashback offers and exclusive privileges included with your account.",
      href: "/benefits",
      cta: "Explore rewards",
    },
    {
      id: "promo-deposit",
      tone: "promo",
      title: "Fund your account in minutes",
      message: "Deposit by cheque, wire or crypto and watch your balance update securely.",
      href: "/deposit",
      cta: "Make a deposit",
    }
  );

  return (
    <Tabs defaultValue="overview" className="w-full max-w-7xl mx-auto space-y-[2.3px]">
      {/* ── Total Balance Banner Widget ── */}
      <BalanceBanner
        totalBalance={totalBalance}
        currency={currency}
        language={language}
        accounts={accounts}
        initialHideBalance={user?.hideBalance}
        notices={notices}
      />

        <TabsContent value="overview" className="m-0">
          {/* Main 12-Column Responsive Ledger Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[2.3px] items-start">
            {/* Primary Ledger Column (8 of 12 columns) */}
            <div className="lg:col-span-8 space-y-[2.3px]">
              <div className="space-y-[2.3px]">
                {/* 4 Core Financial Stat Cards (Redesigned) */}
                <div className="grid gap-[2.3px] grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                  {/* Card 1: Primary Account (dynamic visual, h1 primary, h3 secondary, green/red status) */}
                  <PrimaryAccountCard
                    accounts={accounts}
                    series={primarySeries}
                    currency={currency}
                    language={language}
                  />

                  {/* Card 2: Cash Flow (Credits green face-down vs Debits red face-up ratio) */}
                  <CashFlowRatioCard
                    credits={income}
                    debits={expenses}
                    currency={currency}
                    language={language}
                  />

                  {/* Card 3: Savings & Loans (Savings green, Loans red) */}
                  <SavingsLoansCard
                    savingsBalance={totalSavings}
                    loansBalance={totalLoans}
                    hasSavingsData={hasSavingsData}
                    hasLoansData={hasLoansData}
                    currency={currency}
                    language={language}
                  />

                  {/* Card 4: Investment Balance (USDC/USDT + attached investment accounts) */}
                  <InvestmentPortfolioCard
                    cryptoWallets={cryptoWallets || []}
                    investmentAccounts={investmentAccounts}
                    currency={currency}
                    language={language}
                  />
                </div>

                {/* Section Divider */}
                <div className="border-t border-paper-200" />

                {/* Quick Action Buttons */}
                <ErrorBoundary>
                  <QuickActions />
                </ErrorBoundary>
              </div>

              {/* Cash Flow Chart & Recent Transactions */}
              <div className="grid gap-[2.3px] grid-cols-1 md:grid-cols-12">
                <Card className="md:col-span-7 bg-paper-50 border-paper-200 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-ink-900">Liquidity & Cash Flow</CardTitle>
                    <CardDescription className="text-xs text-ink-500">6-month settled trend</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-1 pb-3">
                    <ErrorBoundary>
                      <Overview data={analyticsData.slice(-6)} />
                    </ErrorBoundary>
                  </CardContent>
                </Card>

                <Card className="md:col-span-5 bg-paper-50 border-paper-200 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                      <CardTitle className="text-sm font-semibold text-ink-900">Recent Activity</CardTitle>
                      <CardDescription className="text-xs text-ink-500">
                        Latest settled items
                      </CardDescription>
                    </div>
                    <Link
                      href="/activities"
                      className="text-xs font-medium text-vermilion-600 hover:underline"
                    >
                      View all
                    </Link>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <ErrorBoundary>
                      <RecentTransactions transactions={serializedTransactions} />
                    </ErrorBoundary>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Intelligence Column: Integrated Client Concierge, Credit Score, Upcoming Bills */}
            <div className="lg:col-span-4">
              <ErrorBoundary>
                <DashboardIntelligenceSidebar user={user} />
              </ErrorBoundary>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
            <Card className="lg:col-span-8 bg-paper-50 border-paper-200 shadow-none">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-ink-900">Financial Analysis</CardTitle>
                <CardDescription className="text-xs text-ink-500">Income vs Expenses over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ErrorBoundary>
                  <Overview data={analyticsData} />
                </ErrorBoundary>
              </CardContent>
            </Card>

            <div className="lg:col-span-4 space-y-4">
              <Card className="bg-paper-50 border-paper-200 shadow-none">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-ink-900">Savings Progress</CardTitle>
                  <CardDescription className="text-xs text-ink-500">
                    Target: {formatCurrency(savingsGoal, currency, languageToLocale(language))}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-xs text-ink-600">Total Saved</span>
                    <span className="font-bold font-mono tabular-nums text-ink-900">
                      {formatCurrency(totalBalance, currency, languageToLocale(language))}
                    </span>
                  </div>
                  <div className="w-full">
                    <Progress
                      value={(totalBalance / (savingsGoal || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                  <p className="text-[11px] text-ink-500 font-mono text-right">
                    {((totalBalance / (savingsGoal || 1)) * 100).toFixed(1)}% of reserve goal
                  </p>
                </CardContent>
              </Card>

              <ErrorBoundary>
                <SpendingByCategory
                  transactions={transactions}
                  totalExpenses={expenses}
                />
              </ErrorBoundary>
            </div>
          </div>
        </TabsContent>
    </Tabs>
  );
}
