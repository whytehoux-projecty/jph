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

  return (
    <div className="flex-1 space-y-6 p-6 pt-4">
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
          <Card className="col-span-4 animate-scale-in shadow-sm hover:shadow-md transition-shadow duration-300 bg-[color:var(--heritage-navy)]/90 border-[color:var(--heritage-navy-mid)] text-white">
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
            <Card className="animate-slide-in-right shadow-sm hover:shadow-md transition-shadow duration-300 bg-[color:var(--heritage-navy)]/90 border-[color:var(--heritage-navy-mid)] text-white">
              <CardHeader>
                <CardTitle className="text-white font-playfair">
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-[color:var(--heritage-surface)]/80">
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
