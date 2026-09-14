import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getStatements } from "@/app/actions/statements";
import { toast } from "@/lib/toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  TrendingUp,
  CreditCard,
  Wallet,
  PiggyBank,
  Landmark,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate, languageToLocale } from "@/lib/utils";
import { useState, useEffect } from "react";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";

interface Account {
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

interface AccountDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  userPreferences: {
    language: string;
    currency: string;
  };
  initialTab?: string;
}

export function AccountDetailsDialog({
  isOpen,
  onClose,
  account,
  transactions,
  isLoadingTransactions,
  userPreferences,
  initialTab = "overview",
}: AccountDetailsDialogProps) {
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [statements, setStatements] = useState<any[]>([]);
  const [isLoadingStatements, setIsLoadingStatements] = useState(false);
  const [statementsError, setStatementsError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!account) return null;

  const locale = languageToLocale(userPreferences.language);

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

  useEffect(() => {
    const loadStatements = async () => {
      if (!account || activeTab !== "statements") return;
      setIsLoadingStatements(true);
      setStatementsError(null);
      try {
        const response = await getStatements();
        // Since we don't have account specific filtering in getStatements yet, we filter client side
        const items = Array.isArray(response) ? response.filter(s => s.accountId === account.id) : [];
        setStatements(items);
      } catch (err) {
        console.error("Failed to load account statements", err);
        setStatementsError("We could not retrieve your statements right now.");
        setStatements([]);
      } finally {
        setIsLoadingStatements(false);
      }
    };

    loadStatements();
  }, [account, activeTab]);

  const handleDownloadStatement = async (statement: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const blob = new Blob(["Simulated PDF Content"], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const periodSource =
        statement.periodStart ||
        statement.generatedAt ||
        new Date().toISOString();
      const periodLabel = new Date(periodSource).toISOString().slice(0, 7);
      const last4 = account.accountNumber.slice(-4);
      a.href = url;
      a.download = `Statement-${periodLabel}-${last4}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download statement", err);
      toast.error({ title: "Download failed", description: "Could not download statement. Please try again." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-none flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border/40 bg-muted/10">
          <div className="flex items-center gap-4">
            <VintageIcon
              icon={getAccountIcon(account.type)}
              variant={getAccountColor(account.type) as any}
              size="lg"
            />
            <div>
              <DialogTitle className="text-2xl font-playfair text-charcoal">
                {account.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs">
                  {showAccountNumber
                    ? account.accountNumber
                    : account.maskedNumber}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 text-muted-foreground hover:text-charcoal"
                  onClick={() => setShowAccountNumber(!showAccountNumber)}>
                  {showAccountNumber ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
                <Badge
                  variant={account.status === "active" ? "success" : "warning"}
                  className="ml-2 text-[10px] uppercase tracking-wider h-5">
                  {account.status}
                </Badge>
              </DialogDescription>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Current Balance
              </p>
              <p
                className={`text-2xl font-bold font-mono ${
                  account.balance < 0 ? "text-red-600" : "text-charcoal"
                }`}>
                {formatCurrency(
                  Math.abs(account.balance),
                  account.currency || userPreferences.currency,
                  locale,
                )}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col">
          <div className="px-6 border-b border-border/40 bg-white sticky top-0 z-10">
            <TabsList className="h-auto p-0 bg-transparent gap-6">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-vintage-gold data-[state=active]:text-vintage-navy px-2 py-3 bg-transparent shadow-none transition-all">
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-vintage-gold data-[state=active]:text-vintage-navy px-2 py-3 bg-transparent shadow-none transition-all">
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="statements"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-vintage-gold data-[state=active]:text-vintage-navy px-2 py-3 bg-transparent shadow-none transition-all">
                Statements
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-vintage-gold data-[state=active]:text-vintage-navy px-2 py-3 bg-transparent shadow-none transition-all">
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 flex-1 bg-muted/5">
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Stats */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="rounded-none">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-xs text-muted-foreground uppercase">
                          Available Balance
                        </p>
                        <p className="text-lg font-mono font-semibold">
                          {formatCurrency(
                            account.availableBalance,
                            account.currency || userPreferences.currency,
                            locale,
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-none">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-xs text-muted-foreground uppercase">
                          Interest Rate
                        </p>
                        <p className="text-lg font-mono font-semibold text-vintage-green">
                          {account.interestRate}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {account.type === "credit" && account.creditLimit && (
                    <Card className="rounded-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Credit Utilization
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-2xl font-bold text-charcoal">
                            {(
                              (Math.abs(account.balance) /
                                account.creditLimit) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                          <span className="text-sm text-muted-foreground">
                            of{" "}
                            {formatCurrency(
                              account.creditLimit,
                              account.currency,
                              locale,
                            )}{" "}
                            limit
                          </span>
                        </div>
                        <Progress
                          value={
                            (Math.abs(account.balance) / account.creditLimit) *
                            100
                          }
                          className="h-2"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Activity Preview */}
                  <Card className="rounded-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base">
                        Recent Activity
                      </CardTitle>
                      <Button
                        variant="link"
                        size="small"
                        className="text-vintage-navy p-0 h-auto"
                        onClick={() => setActiveTab("activity")}>
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {isLoadingTransactions ? (
                          [1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-10 bg-muted/20 animate-pulse rounded-none"
                            />
                          ))
                        ) : transactions.slice(0, 3).length > 0 ? (
                          transactions.slice(0, 3).map((tx) => (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    ["credit", "deposit"].includes(tx.type) ||
                                    tx.amount > 0
                                      ? "bg-green-100 text-green-700"
                                      : "bg-charcoal/10 text-charcoal"
                                  }`}>
                                  {["credit", "deposit"].includes(tx.type) ||
                                  tx.amount > 0 ? (
                                    <ArrowDownLeft size={14} />
                                  ) : (
                                    <ArrowUpRight size={14} />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-charcoal">
                                    {tx.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(tx.date, "short", locale)}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`font-mono text-sm font-medium ${
                                  ["credit", "deposit"].includes(tx.type) ||
                                  tx.amount > 0
                                    ? "text-green-600"
                                    : "text-charcoal"
                                }`}>
                                {["credit", "deposit"].includes(tx.type) ||
                                tx.amount > 0
                                  ? "+"
                                  : ""}
                                {formatCurrency(
                                  Math.abs(tx.amount),
                                  account.currency || userPreferences.currency,
                                  locale,
                                )}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No recent activity
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Quick Actions & Insights */}
                <div className="space-y-6">
                  <Card className="rounded-none">
                    <CardHeader>
                      <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        icon={<ArrowUpRight className="w-4 h-4 mr-2" />}>
                        Transfer Funds
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        icon={<Download className="w-4 h-4 mr-2" />}>
                        Download Statement
                      </Button>
                      <Button
                        className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        variant="outline"
                        icon={<Lock className="w-4 h-4 mr-2" />}>
                        Freeze Account
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-soft-gold/10 to-transparent border-soft-gold/20 rounded-none">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-vintage-gold" />{" "}
                        Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {account.type === "savings" &&
                          `You are earning ${account.interestRate} APY. Adding $500/mo could grow your savings by 12% by year end.`}
                        {account.type === "credit" &&
                          `Your utilization is healthy. Keep it under 30% to maintain your high credit score.`}
                        {account.type === "checking" &&
                          `Spending is 5% lower than last month. Great job sticking to your budget!`}
                        {account.type === "investment" &&
                          `Your portfolio is up 8% this year. Consider rebalancing your assets.`}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative w-full max-w-xs">
                  <Input
                    placeholder="Search transactions..."
                    className="pl-9 h-9 text-sm"
                  />
                  <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <Button variant="outline" size="small">
                  Filter
                </Button>
              </div>

              <Card className="rounded-none">
                <CardContent className="p-0">
                  {isLoadingTransactions ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Loading...
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="divide-y divide-border/40">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                              {["credit", "deposit"].includes(tx.type) ? (
                                <ArrowDownLeft className="w-5 h-5 text-green-600" />
                              ) : (
                                <ArrowUpRight className="w-5 h-5 text-charcoal" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-charcoal">
                                {tx.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(tx.date, "long", locale)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`font-mono font-medium ${
                              ["credit", "deposit"].includes(tx.type) ||
                              tx.amount > 0
                                ? "text-green-600"
                                : "text-charcoal"
                            }`}>
                            {["credit", "deposit"].includes(tx.type) ||
                            tx.amount > 0
                              ? "+"
                              : ""}
                            {formatCurrency(
                              Math.abs(tx.amount),
                              account.currency || userPreferences.currency,
                              locale,
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      No transactions found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statements" className="mt-0 space-y-4">
              <Card className="rounded-none">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Statements</CardTitle>
                  <DialogDescription>
                    View and download your monthly account statements.
                  </DialogDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStatements ? (
                    <div className="space-y-3">
                      <div className="h-10 bg-muted/40 animate-pulse" />
                      <div className="h-10 bg-muted/40 animate-pulse" />
                      <div className="h-10 bg-muted/40 animate-pulse" />
                    </div>
                  ) : statements.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">
                      {statementsError ||
                        "No downloadable statements are available for this account yet."}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {statements.map((statement) => {
                        const periodSource =
                          statement.periodStart ||
                          statement.generatedAt ||
                          statement.periodEnd;
                        const periodLabel = periodSource
                          ? new Date(periodSource).toLocaleDateString(
                              languageToLocale(userPreferences.language),
                              { month: "long", year: "numeric" },
                            )
                          : "Statement";
                        const statementType =
                          statement.statementType || "MONTHLY";
                        return (
                          <div
                            key={statement.id}
                            className="flex items-center justify-between p-3 border border-border/40 hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-50 text-red-600 flex items-center justify-center">
                                <FileText size={20} />
                              </div>
                              <div>
                                <p className="font-medium text-charcoal">
                                  {periodLabel}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {statementType} • ****
                                  {account.accountNumber.slice(-4)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleDownloadStatement(statement)
                              }>
                              <Download size={16} />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-none">
                <CardHeader>
                  <CardTitle className="text-lg">Tax Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 border border-border/40 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-charcoal/5 text-charcoal flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">
                          2025 Form 1099-INT
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tax Statement
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-6">
              <Card className="rounded-none">
                <CardHeader>
                  <CardTitle className="text-lg">Account Preferences</CardTitle>
                  <DialogDescription>
                    Manage settings for this specific account.
                  </DialogDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Account Nickname</Label>
                    <div className="flex gap-2">
                      <Input
                        id="nickname"
                        defaultValue={account.name}
                        className="max-w-md rounded-none"
                      />
                      <Button variant="outline" className="rounded-none">
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Visible only to you on your dashboard and statements.
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-border/40">
                    <div className="space-y-0.5">
                      <Label className="text-base">Paperless Statements</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive statements via email instead of mail
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-border/40">
                    <div className="space-y-0.5">
                      <Label className="text-base">Transaction Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify me of transactions over $500
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-border/40">
                    <div className="space-y-0.5">
                      <Label className="text-base text-red-600">
                        Freeze Account
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Temporarily disable all outgoing transactions
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
