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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
        if (language === 'es') return 'Buenos días';
        if (language === 'fr') return 'Bonjour';
        if (language === 'de') return 'Guten Morgen';
        return 'Good morning';
    }
    if (hour < 18) {
        if (language === 'es') return 'Buenas tardes';
        if (language === 'fr') return 'Bon après-midi';
        if (language === 'de') return 'Guten Tag';
        return 'Good afternoon';
    }
    if (language === 'es') return 'Buenas noches';
    if (language === 'fr') return 'Bonsoir';
    if (language === 'de') return 'Guten Abend';
    return 'Good evening';
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 theme-ink bg-ink-900 text-paper-50 p-6 md:p-8 rounded shadow-none mb-6 -mx-2 md:mx-0">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-h2 font-bold tracking-tight font-display text-paper-50">
            {getGreeting()}, {user?.firstName || "there"}
          </h2>
          <div>
            <p className="text-xs font-medium text-ink-500 mb-1 uppercase tracking-widest">Total Deposit Balance</p>
            <p className="text-4xl md:text-display-lg font-mono font-bold tabular-nums text-paper-50">
              {formatCurrency(totalBalance, currency, languageToLocale(language))}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded font-semibold transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:pointer-events-none disabled:opacity-50 border border-paper-200/20 bg-transparent text-paper-50 hover:bg-paper-50/10 shadow-none h-10 px-6 text-sm">
            Refresh Data
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            {translate(language, "nav.overview") || "Overview"}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            {translate(language, "nav.analytics") || "Analytics"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-4">
              <ErrorBoundary>
                <QuickActions />
              </ErrorBoundary>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardStatCard
              title={translate(language, "overview.totalBalance") || "Total Balance"}
              value={formatCurrency(totalBalance, currency, languageToLocale(language))}
              icon={Wallet}
              subtitle={translate(language, "overview.acrossAllAccounts") || "Across all accounts"}
              animate="animate-fade-in-up animate-delay-100"
            />
            <DashboardStatCard
              title={translate(language, "overview.incomeMonth") || "Income (Month)"}
              value={`+${formatCurrency(income, currency, languageToLocale(language))}`}
              icon={ArrowDownLeft}
              changeType="positive"
              subtitle={translate(language, "overview.totalDeposits") || "Total deposits"}
              animate="animate-fade-in-up animate-delay-200"
            />
            <DashboardStatCard
              title={translate(language, "overview.expensesMonth") || "Expenses (Month)"}
              value={`−${formatCurrency(expenses, currency, languageToLocale(language))}`}
              icon={ArrowUpRight}
              changeType="negative"
              subtitle={translate(language, "overview.withdrawalsTransfers") || "Withdrawals & transfers"}
              animate="animate-fade-in-up animate-delay-300"
            />
            <DashboardStatCard
              title={translate(language, "overview.savingsGoals") || "Savings Goals"}
              value={formatCurrency(savingsGoal, currency, languageToLocale(language))}
              icon={PiggyBank}
              subtitle={`of ${formatCurrency(savingsTarget)} target`}
              animate="animate-fade-in-up animate-delay-400"
            />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4 bg-white border-paper-200 shadow-none animate-scale-in hover-lift">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ErrorBoundary>
                  <Overview data={analyticsData.slice(-6)} />
                </ErrorBoundary>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3 bg-white border-paper-200 shadow-none animate-slide-in-right hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Latest activity across all accounts.
                  </CardDescription>
                </div>
                <Link href="/transactions" className="text-sm font-medium text-ink-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 rounded-md px-1">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <RecentTransactions transactions={serializedTransactions} />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <div className="col-span-1 lg:col-span-4">
              <ErrorBoundary>
                <AccountsList accounts={accounts} language={language} />
              </ErrorBoundary>
            </div>
            <div className="col-span-1 lg:col-span-3">
              <ErrorBoundary>
                <PendingApprovals items={pendingItems} language={language} />
              </ErrorBoundary>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4 bg-white border-paper-200 shadow-none">
              <CardHeader>
                <CardTitle>Financial Analysis</CardTitle>
                <CardDescription>Income vs Expenses over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ErrorBoundary>
                  <Overview data={analyticsData} />
                </ErrorBoundary>
              </CardContent>
            </Card>
            <div className="col-span-1 lg:col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Savings Progress</CardTitle>
                  <CardDescription>
                    Progress towards your goal of {formatCurrency(savingsGoal)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total Saved</span>
                    <span className="font-bold font-inter tabular-nums lining-nums">
                      {formatCurrency(totalBalance)}
                    </span>
                  </div>
                  <div className="w-full">
                    <Progress
                      value={(totalBalance / savingsGoal) * 100}
                      className="h-2"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {((totalBalance / savingsGoal) * 100).toFixed(1)}% of goal
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
