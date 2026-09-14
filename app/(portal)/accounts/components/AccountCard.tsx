import { useState, useEffect } from "react";
import {
  Building,
  MoreHorizontal,
  Eye,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Wallet,
  Landmark,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { formatCurrency, formatDate, languageToLocale } from "@/lib/utils";
import { getTransactions } from "@/app/actions/transactions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Account {
  id: string;
  name: string;
  accountNumber: string;
  maskedNumber: string;
  balance: number;
  availableBalance: number;
  creditLimit?: number;
  type: "checking" | "savings" | "credit" | "investment" | "loan";
  interestRate: string;
  monthlyChange: number;
  openedDate: string;
  status: "active" | "inactive" | "closed" | "suspended";
  currency: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "credit" | "debit";
}

interface AccountCardProps {
  account: Account;
  onViewDetails: (account: Account, initialTab?: string) => void;
  userPreferences: {
    language: string;
    currency: string;
  };
}

export function AccountCard({
  account,
  onViewDetails,
  userPreferences,
}: AccountCardProps) {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const locale = languageToLocale(userPreferences.language);

  useEffect(() => {
    const loadRecentActivity = async () => {
      setIsLoadingActivity(true);
      try {
        const data = await getTransactions({
          accountId: account.id,
          limit: 3,
        });
        const txs = (data || []).map((tx: any) => ({
          id: tx.id,
          description: tx.description,
          amount: tx.amount,
          date: tx.createdAt || tx.date,
          type: (
            tx.type === "DEPOSIT" ||
            tx.type === "CREDIT" ||
            tx.type === "credit"
              ? "credit"
              : "debit"
          ) as "credit" | "debit",
        }));
        setRecentTransactions(txs);
      } catch (error) {
        console.error("Failed to load recent activity for card", error);
      } finally {
        setIsLoadingActivity(false);
      }
    };

    loadRecentActivity();
  }, [account.id]);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return Wallet;
      case "savings":
        return PiggyBank;
      case "credit":
        return CreditCard;
      case "investment":
        return TrendingUp;
      default:
        return Landmark;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case "checking":
        return "green";
      case "savings":
        return "gold";
      case "credit":
        return "charcoal";
      default:
        return "charcoal";
    }
  };

  const isCredit = account.type === "credit";
  const utilization =
    isCredit && account.creditLimit
      ? (Math.abs(account.balance) / account.creditLimit) * 100
      : 0;

  return (
    <Card className="rounded-none hover:shadow-vintage-lg transition-all duration-300 group hover:-translate-y-1">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border/40 bg-muted/10">
        <div className="flex items-center gap-3">
          <VintageIcon
            icon={getAccountIcon(account.type)}
            variant={getAccountColor(account.type) as any}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-charcoal text-base">
              {account.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              {account.maskedNumber}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onViewDetails(account)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" /> Statements
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Building className="mr-2 h-4 w-4" /> Account Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Body */}
      <CardContent className="pt-6 space-y-6">
        {/* Balance Section */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {isCredit ? "Available Credit" : "Available Balance"}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono ${
                account.balance < 0 ? "text-red-600" : "text-foreground"
              }`}>
              {formatCurrency(
                isCredit
                  ? (account.creditLimit || 0) - Math.abs(account.balance)
                  : Math.abs(account.balance),
                account.currency || userPreferences.currency,
                locale,
              )}
            </span>
            {account.interestRate !== "0.00%" && (
              <span className="text-xs text-vintage-green font-medium bg-vintage-green/10 px-2 py-0.5 rounded-full">
                {account.interestRate} APY
              </span>
            )}
          </div>
          {isCredit && account.creditLimit && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Credit Used</span>
                <span className="font-medium">{utilization.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-none overflow-hidden">
                <div
                  className={`h-full rounded-none transition-all duration-500 ${
                    utilization > 80 ? "bg-red-500" : "bg-vintage-green"
                  }`}
                  style={{ width: `${utilization}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>
                  {formatCurrency(
                    Math.abs(account.balance),
                    account.currency || userPreferences.currency,
                    locale,
                  )}
                </span>
                <span>
                  {formatCurrency(
                    account.creditLimit,
                    account.currency || userPreferences.currency,
                    locale,
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity Preview */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Recent Activity
          </h4>
          <div className="space-y-3">
            {isLoadingActivity ? (
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-muted/20 animate-pulse rounded-none"
                />
              ))
            ) : recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 2).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between text-sm group/tx">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className={`p-1 rounded-full ${tx.type === "credit" ? "bg-vintage-green/10 text-vintage-green" : "bg-slate-100 text-slate-500"}`}>
                      {tx.type === "credit" ? (
                        <ArrowDownLeft className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                    </div>
                    <span className="truncate text-charcoal/80 group-hover/tx:text-charcoal transition-colors">
                      {tx.description}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-medium whitespace-nowrap ${tx.type === "credit" ? "text-vintage-green" : "text-charcoal"}`}>
                    {tx.type === "credit" ? "+" : "-"}
                    {formatCurrency(
                      Math.abs(tx.amount),
                      account.currency || userPreferences.currency,
                      locale,
                    )}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer Actions */}
      <div className="flex items-center border-t border-border/40 p-4 bg-muted/5 gap-2">
        <Button
          variant="outline"
          className="flex-1 h-9 text-xs border-border/60 hover:border-vintage-gold/50 hover:bg-vintage-gold/5 rounded-none px-2"
          onClick={() => onViewDetails(account)}>
          <Eye className="w-3.5 h-3.5 mr-2" />
          View
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-9 text-xs border-border/60 hover:border-vintage-gold/50 hover:bg-vintage-gold/5 rounded-none px-2"
          onClick={() => onViewDetails(account, "statements")}>
          <FileText className="w-3.5 h-3.5 mr-2" />
          Statements
        </Button>
        {isCredit ? (
          <Button className="flex-1 h-9 text-xs bg-vintage-navy hover:bg-vintage-navy/90 text-white rounded-none shadow-sm px-2">
            <CreditCard className="w-3.5 h-3.5 mr-2" />
            Pay Bill
          </Button>
        ) : (
          <Button className="flex-1 h-9 text-xs bg-vintage-navy hover:bg-vintage-navy/90 text-white rounded-none shadow-sm px-2">
            <ArrowUpRight className="w-3.5 h-3.5 mr-2" />
            Transfer
          </Button>
        )}
      </div>
    </Card>
  );
}
