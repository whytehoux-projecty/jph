import "./dashboard-animations.css";
import { Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Progress } from "@/components/ui/progress";
import { Overview } from "@/components/dashboard/overview";
import { RecentTransactions } from "@/components/dashboard/recent-sales";
import { formatCurrency } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SpendingByCategory } from "@/components/dashboard/SpendingByCategory";
import { getProfile } from "@/app/actions/profile";
import { getAccounts } from "@/app/actions/accounts";
import { getTransactionStats, getRecentTransactions } from "@/app/actions/transactions";
import { getSavingsGoal } from "@/app/actions/savings";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let user, accounts, stats, transactions, goal;
  
  try {
    user = await getProfile();
    accounts = await getAccounts();
    stats = await getTransactionStats("month");
    transactions = await getRecentTransactions(5);
    goal = await getSavingsGoal();
  } catch (error) {
    redirect('/login');
  }

  if (!user || !accounts || !stats || !transactions) return null;

  const totalBalance = accounts.reduce((sum: any, acc: any) => sum + Number(acc.balance), 0);
  const income = stats.income || 0;
  const expenses = stats.expenses || 0;
  const savingsGoal = goal?.currentAmount || 0;
  const savingsTarget = goal?.targetAmount || 25000;
  const serializedTransactions = transactions.map((t: any) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt?.toISOString() || t.createdAt.toISOString(),
    processedAt: t.processedAt?.toISOString(),
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex-1 space-y-6 p-6 pt-4">
      {/* Fix #37: Greeting / personalization on main dashboard */}
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-3xl font-bold tracking-tight font-playfair">
          {getGreeting()}, <span className="text-[color:var(--heritage-gold)]">{user?.firstName || 'there'}</span>
        </h2>
        <p className="text-sm text-muted-foreground hidden md:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-4">
            <ErrorBoundary>
              <QuickActions />
            </ErrorBoundary>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            title="Total Balance"
            value={formatCurrency(totalBalance)}
            icon={Wallet}
            subtitle="Across all accounts"
            animate="animate-fade-in-up animate-delay-100"
          />
          <DashboardStatCard
            title="Income (Month)"
            value={`+${formatCurrency(income)}`}
            icon={ArrowDownLeft}
            changeType="positive"
            subtitle="Total deposits"
            animate="animate-fade-in-up animate-delay-200"
          />
          <DashboardStatCard
            title="Expenses (Month)"
            value={`-${formatCurrency(expenses)}`}
            icon={ArrowUpRight}
            changeType="negative"
            subtitle="Withdrawals & transfers"
            animate="animate-fade-in-up animate-delay-300"
          />
          <DashboardStatCard
            title="Savings Goals"
            value={formatCurrency(savingsGoal)}
            icon={PiggyBank}
            subtitle={`of ${formatCurrency(savingsTarget)} goal`}
            animate="animate-fade-in-up animate-delay-400"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Fix #2: CardDescription on dark cards — use text-white/70 not heritage-surface/80 */}
          <Card className="col-span-4 animate-scale-in shadow-sm hover:shadow-md transition-shadow duration-300 bg-[color:var(--heritage-navy)] border-[color:var(--heritage-navy-mid)] text-white">
            <CardHeader>
              <CardTitle className="text-white font-playfair">Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ErrorBoundary>
                <Overview income={income} expense={expenses} />
              </ErrorBoundary>
            </CardContent>
          </Card>

          <div className="col-span-3 space-y-4">
            <Card className="animate-slide-in-right shadow-sm hover:shadow-md transition-shadow duration-300 bg-[color:var(--heritage-navy)] border-[color:var(--heritage-navy-mid)] text-white">
              <CardHeader>
                <CardTitle className="text-white font-playfair">
                  Recent Transactions
                </CardTitle>
                {/* Fix #2: was text-[heritage-surface]/80 = invisible white-on-navy */}
                <CardDescription className="text-white/70">
                  Latest activity across all accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <RecentTransactions transactions={serializedTransactions} />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Spending by Category */}
            <ErrorBoundary>
              <SpendingByCategory
                transactions={serializedTransactions}
                totalExpenses={expenses}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
