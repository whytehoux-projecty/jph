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
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SpendingByCategory } from "@/components/dashboard/SpendingByCategory";
import { DashboardIntelligenceSidebar } from "@/components/dashboard/DashboardIntelligenceSidebar";
import { BalanceBanner } from "@/components/dashboard/BalanceBanner";
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
    <Tabs defaultValue="overview" className="w-full max-w-7xl mx-auto space-y-5">
      {/* ── Total Balance Banner Widget ── */}
      <BalanceBanner
        totalBalance={totalBalance}
        currency={currency}
        language={language}
        accounts={accounts}
        initialHideBalance={user?.hideBalance}
      />

        <TabsContent value="overview" className="m-0">
          {/* Main 12-Column Responsive Ledger Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Primary Ledger Column (8 of 12 columns) */}
            <div className="lg:col-span-8 space-y-5">
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

              {/* Executive Actions */}
              <ErrorBoundary>
                <QuickActions />
              </ErrorBoundary>

              {/* Cash Flow Chart & Recent Transactions */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-12">
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
