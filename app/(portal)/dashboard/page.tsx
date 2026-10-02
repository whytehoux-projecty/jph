import "./dashboard-animations.css";
import { Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";
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
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SpendingByCategory } from "@/components/dashboard/SpendingByCategory";
import { AccountsList } from "@/components/dashboard/AccountsList";
import { PendingApprovals } from "@/components/dashboard/PendingApprovals";
import { DashboardIntelligenceSidebar } from "@/components/dashboard/DashboardIntelligenceSidebar";
import { getProfile } from "@/app/actions/profile";
import { getAccounts } from "@/app/actions/accounts";
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
  let user, accounts, stats, transactions, allTransactions, goal;
  
  try {
    user = await getProfile();
    accounts = await getAccounts();
    stats = await getTransactionStats("month");
    transactions = await getTransactions({ limit: 5 });
    allTransactions = await getTransactions({ limit: 50 });
    goal = await getSavingsGoal();
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5">
      {/* ── Consolidated Treasury & Liquidity Banner (Greeting removed, moved to Sub-Header) ── */}
      <div className="relative overflow-hidden rounded-sm border border-ink-900 bg-ink-900 p-5 md:p-6 text-paper-50 shadow-none">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-vermilion-600/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            {/* Identity & Vault Eyebrow */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-white/10 px-2 py-0.5 text-[#F4724A] border border-white/10 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8532B] animate-pulse" />
                Heritage Vault · Private Banking
              </span>
              <span className="text-white/50 text-[11px]">
                Vault ID: HTB-{user?.id ? user.id.slice(-6).toUpperCase() : "880194"} · FDIC Insured to $250,000
              </span>
            </div>

            {/* Total Balance Amount */}
            <div>
              <p className="text-[11px] font-mono font-medium text-white/60 uppercase tracking-widest">
                Consolidated Liquid Deposits
              </p>
              <div className="mt-1 flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold tabular-nums text-white tracking-tight">
                  {formatCurrency(totalBalance, currency, languageToLocale(language))}
                </span>
                <span className="inline-flex items-center text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-sm">
                  Settled & Verified
                </span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/transfer"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-sm bg-vermilion-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-vermilion-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Transfer Funds
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-sm border border-white/20 bg-white/5 px-3.5 text-xs font-medium text-paper-50 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Refresh
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-paper-200/60 p-0.5 rounded-sm">
          <TabsTrigger value="overview" className="text-xs px-3 py-1">
            {translate(language, "nav.overview") || "Overview"}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs px-3 py-1">
            {translate(language, "nav.analytics") || "Analytics"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Main 12-Column Responsive Ledger Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Primary Ledger Column (8 of 12 columns) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Executive Actions */}
              <ErrorBoundary>
                <QuickActions />
              </ErrorBoundary>

              {/* 4 Core Financial Stat Cards */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardStatCard
                  title="Primary Checking"
                  value={formatCurrency(accounts[0]?.balance || totalBalance, currency, languageToLocale(language))}
                  icon={Wallet}
                  subtitle="Operating Liquidity"
                />
                <DashboardStatCard
                  title={translate(language, "overview.incomeMonth") || "Inflow (Month)"}
                  value={`+${formatCurrency(income, currency, languageToLocale(language))}`}
                  icon={ArrowDownLeft}
                  changeType="positive"
                  subtitle={translate(language, "overview.totalDeposits") || "Settled deposits"}
                />
                <DashboardStatCard
                  title={translate(language, "overview.expensesMonth") || "Outflow (Month)"}
                  value={`−${formatCurrency(expenses, currency, languageToLocale(language))}`}
                  icon={ArrowUpRight}
                  changeType="negative"
                  subtitle={translate(language, "overview.withdrawalsTransfers") || "Wires & transfers"}
                />
                <DashboardStatCard
                  title={translate(language, "overview.savingsGoals") || "Savings Reserve"}
                  value={formatCurrency(savingsGoal, currency, languageToLocale(language))}
                  icon={PiggyBank}
                  subtitle={`of ${formatCurrency(savingsTarget)} target`}
                />
              </div>

              {/* Cash Flow Chart & Recent Transactions */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-12">
                <Card className="md:col-span-7 bg-white border-paper-200 shadow-none">
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

                <Card className="md:col-span-5 bg-white border-paper-200 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                      <CardTitle className="text-sm font-semibold text-ink-900">Recent Activity</CardTitle>
                      <CardDescription className="text-xs text-ink-500">
                        Latest settled items
                      </CardDescription>
                    </div>
                    <Link
                      href="/transactions"
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

              {/* Accounts Vault & Pending Approvals */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-7">
                  <ErrorBoundary>
                    <AccountsList accounts={accounts} language={language} />
                  </ErrorBoundary>
                </div>
                <div className="md:col-span-5">
                  <ErrorBoundary>
                    <PendingApprovals items={pendingItems} language={language} />
                  </ErrorBoundary>
                </div>
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
            <Card className="lg:col-span-8 bg-white border-paper-200 shadow-none">
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
              <Card className="bg-white border-paper-200 shadow-none">
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
    </div>
  );
}
