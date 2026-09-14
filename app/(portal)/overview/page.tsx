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
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SpendingByCategory } from "@/components/dashboard/SpendingByCategory";
import { getProfile } from "@/app/actions/profile";
import { getAccounts } from "@/app/actions/accounts";
import { getTransactions, getTransactionStats } from "@/app/actions/transactions";
import { getSavingsGoal } from "@/app/actions/savings";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

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

export default async function OverviewPage() {
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
  const savingsGoal = goal?.targetAmount || 25000;
  const analyticsData = processChartData(allTransactions || []);
  const language = user?.preferredLanguage || 'en';
  const currency = user?.preferredCurrency || 'USD';
  const serializedTransactions = (transactions || []).map((t: any) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt?.toISOString() || t.createdAt.toISOString(),
    processedAt: t.processedAt?.toISOString(),
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
    <div className="flex-1 space-y-6 p-6 pt-4">
      <div className="flex items-center justify-between space-y-2 pb-4">
        <h2 className="text-3xl font-bold tracking-tight font-playfair">
          {getGreeting()}, {user?.firstName || "there"}
        </h2>
        <div className="flex items-center space-x-2">
          <Link href="/overview" className={buttonVariants({ variant: "primary", size: "small" })}>
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="animate-fade-in-up animate-delay-100 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">
                  {translate(language, "overview.totalBalance") || "Total Balance"}
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalBalance, currency, languageToLocale(language))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {translate(language, "overview.acrossAllAccounts") || "Across all accounts"}
                </p>
              </CardContent>
            </Card>
            <Card className="animate-fade-in-up animate-delay-200 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">
                  {translate(language, "overview.incomeMonth") || "Income (Month)"}
                </CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +
                  {formatCurrency(income, currency, languageToLocale(language))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {translate(language, "overview.totalDeposits") || "Total deposits"}
                </p>
              </CardContent>
            </Card>
            <Card className="animate-fade-in-up animate-delay-300 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">
                  {translate(language, "overview.expensesMonth") || "Expenses (Month)"}
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  -
                  {formatCurrency(expenses, currency, languageToLocale(language))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {translate(language, "overview.withdrawalsTransfers") || "Withdrawals & transfers"}
                </p>
              </CardContent>
            </Card>
            <Card className="animate-fade-in-up animate-delay-400 hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">
                  {translate(language, "overview.savingsGoals") || "Savings Goals"}
                </CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(savingsGoal, currency, languageToLocale(language))}
                </div>
                <p className="text-xs text-muted-foreground">Target 2026</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 animate-scale-in hover-lift">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ErrorBoundary>
                  <Overview income={income} expense={expenses} />
                </ErrorBoundary>
              </CardContent>
            </Card>
            <Card className="col-span-3 animate-slide-in-right hover-lift">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest activity across all accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <RecentTransactions transactions={serializedTransactions} />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
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
            <div className="col-span-3 space-y-4">
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
                    <span className="font-bold">
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
