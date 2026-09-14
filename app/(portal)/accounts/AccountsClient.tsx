"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Download,
  Landmark,
  SlidersHorizontal,
  AlertCircle,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { getTransactions } from "@/app/actions/transactions";
import { formatCurrency, languageToLocale } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AccountDetailsDialog } from "./components/AccountDetailsDialog";
import { AccountAnalytics } from "./components/AccountAnalytics";
import {
  OpenAccountDialog,
  LinkExternalAccountDialog,
} from "./components/AccountActionDialogs";
import { AccountCard, Account } from "./components/AccountCard";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "credit" | "debit";
}

import { Sentry } from "@/lib/sentry-mock";

export default function AccountsClient({ initialAccounts, userPreferences }: { initialAccounts: Account[], userPreferences: { language: string; currency: string } }) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [detailsInitialTab, setDetailsInitialTab] =
    useState<string>("overview");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isOpenAccountOpen, setIsOpenAccountOpen] = useState(false);

  // Filter & Sort State
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("balance-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [isFiltersLoaded, setIsFiltersLoaded] = useState(false);

  useEffect(() => {
    // Data is loaded via server component props now.
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("accounts.filters");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.filterType) {
          setFilterType(parsed.filterType);
        }
        if (parsed.sortOrder) {
          setSortOrder(parsed.sortOrder);
        }
        if (typeof parsed.searchQuery === "string") {
          setSearchQuery(parsed.searchQuery);
        }
      }
    } catch (err) {
      console.error("Failed to load account filters from storage", err);
    } finally {
      setIsFiltersLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isFiltersLoaded) return;
    try {
      const payload = {
        filterType,
        sortOrder,
        searchQuery,
      };
      window.localStorage.setItem("accounts.filters", JSON.stringify(payload));
    } catch {}
  }, [filterType, sortOrder, searchQuery, isFiltersLoaded]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("accounts.promoDismissedAt");
      if (!raw) {
        setShowPromo(true);
        return;
      }
      const dismissedAt = new Date(raw).getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (Number.isFinite(dismissedAt)) {
        if (Date.now() - dismissedAt > sevenDaysMs) {
          setShowPromo(true);
        }
      }
    } catch {
      setShowPromo(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      const threshold = 40;
      setIsHeaderCompact(window.scrollY > threshold);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const loadTransactions = async (accountId: string) => {
    setIsLoadingTransactions(true);
    try {
      const data = await getTransactions({ accountId, limit: 5 });
      const txs = (data || []).map((tx: any) => ({
        id: tx.id,
        description: tx.description || tx.reference || "Transaction",
        amount: Number(tx.amount),
        date: tx.createdAt,
        type: (tx.type === "DEPOSIT" || tx.type === "CREDIT" ? "credit" : "debit") as "credit" | "debit",
      }));
      setTransactions(txs);
    } catch (error) {
      console.error("Failed to load transactions", error);
      // Don't block UI for transaction load failure
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Load Transactions when Account Selected
  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount.id);
    }
  }, [selectedAccount]);

  // Computed Properties
  const filteredAccounts = useMemo(() => {
    return accounts
      .filter((acc) => {
        if (filterType === "liquid") {
          if (
            acc.type !== "checking" &&
            acc.type !== "savings" &&
            acc.type !== "investment"
          ) {
            return false;
          }
        } else if (filterType === "active") {
          if (acc.status !== "active") {
            return false;
          }
        } else if (filterType !== "all" && acc.type !== filterType) {
          return false;
        }
        if (
          searchQuery &&
          !acc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !acc.accountNumber.includes(searchQuery)
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortOrder) {
          case "balance-desc":
            return b.balance - a.balance;
          case "balance-asc":
            return a.balance - b.balance;
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
  }, [accounts, filterType, sortOrder, searchQuery]);

  useEffect(() => {
    if (isLoading) return;
    if (error) {
      setLiveMessage("We could not load your accounts.");
      return;
    }
    const total = accounts.length;
    const active = accounts.filter((acc) => acc.status === "active").length;
    const visibleCount = filteredAccounts.length;
    if (total === 0) {
      setLiveMessage("No accounts available.");
      return;
    }
    setLiveMessage(
      `Showing ${visibleCount} of ${total} accounts, ${active} active.`,
    );
  }, [accounts, filteredAccounts.length, isLoading, error]);

  const totalBalance = useMemo(
    () =>
      accounts.reduce(
        (sum, acc) => (acc.type === "credit" ? sum : sum + acc.balance),
        0,
      ),
    [accounts],
  );

  const totalLiquidAssets = useMemo(
    () =>
      accounts
        .filter(
          (acc) =>
            acc.type === "checking" ||
            acc.type === "savings" ||
            acc.type === "investment",
        )
        .reduce((sum, acc) => sum + acc.balance, 0),
    [accounts],
  );

  const activeAccountsCount = useMemo(
    () => accounts.filter((acc) => acc.status === "active").length,
    [accounts],
  );

  const totalCreditUtilization = useMemo(() => {
    const creditAccounts = accounts.filter(
      (acc) => acc.type === "credit" && acc.creditLimit,
    );
    if (creditAccounts.length === 0) return 0;
    const totalLimit = creditAccounts.reduce(
      (sum, acc) => sum + (acc.creditLimit || 0),
      0,
    );
    const totalUsed = creditAccounts.reduce(
      (sum, acc) => sum + Math.abs(acc.balance),
      0,
    );
    return totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
  }, [accounts]);

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

  const handlePromoDismiss = () => {
    setShowPromo(false);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "accounts.promoDismissedAt",
        new Date().toISOString(),
      );
    } catch {}
  };

  const handleKpiDrilldown = (type: "liquid" | "active" | "pending") => {
    setSelectedAccount(null);
    if (type === "liquid") {
      setFilterType("liquid");
      setSortOrder("balance-desc");
      setSearchQuery("");
    } else if (type === "active") {
      setFilterType("active");
      setSearchQuery("");
    } else if (type === "pending") {
      setFilterType("credit");
      setSortOrder("balance-desc");
      setSearchQuery("");
    }
    if (typeof window !== "undefined") {
      const target = document.getElementById("accounts-grid");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Render Helpers
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-[280px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-4 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/20">
      <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
        <Landmark className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium text-charcoal mb-2">
        No Accounts Found
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        {searchQuery
          ? "No accounts match your search criteria. Try adjusting your filters."
          : "You don't have any accounts yet. Open a new account to get started."}
      </p>
      {searchQuery && (
        <Button variant="outline" onClick={() => setSearchQuery("")}>
          Clear Search
        </Button>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">
        Failed to Load Accounts
      </h3>
      <p className="text-red-600 mb-6">{error}</p>
      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        className="border-red-200 hover:bg-red-100 text-red-700">
        <RefreshCw className="w-4 h-4 mr-2" /> Retry
      </Button>
      {process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={() => {
            console.error("Accounts page error:", error);
            Sentry.captureException(error);
          }}
          className="mt-3 text-xs text-red-700 underline-offset-4 hover:underline">
          Log to console
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 animate-fade-in-up pb-20">
      <div className="sr-only" aria-live="polite">
        {liveMessage}
      </div>

      {showPromo && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-[color:var(--heritage-navy)]/15 bg-[color:var(--heritage-surface)]/90 px-4 py-3 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--heritage-navy)]">
              Private concierge upgrade
            </p>
            <p className="text-xs text-muted-foreground">
              Unlock tailored wealth management with our private concierge team.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="small"
              className="h-8 border-[color:var(--heritage-navy)]/40 text-[color:var(--heritage-navy)] text-xs"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/support";
                }
              }}>
              Learn more
            </Button>
            <button
              type="button"
              onClick={handlePromoDismiss}
              className="text-xs text-muted-foreground hover:text-charcoal">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Page Header — not sticky, scrolls away */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-charcoal">
            My Accounts
          </h1>
          <p className="text-muted-foreground mt-1">
            View balances, activity, and manage every account from one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={isLoading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            className="bg-[color:var(--heritage-navy)] hover:bg-[color:var(--heritage-navy)]/90 text-white"
            onClick={() => setIsOpenAccountOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Open Account
          </Button>
        </div>
      </div>

      {/* KPI Analytics — not sticky, scrolls away */}
      <AccountAnalytics
        currency={userPreferences.currency}
        totalLiquidAssets={totalLiquidAssets}
        activeAccountsCount={activeAccountsCount}
        onDrilldown={handleKpiDrilldown}
      />

      {/* Filter Bar — sticky, stays visible while scrolling the account grid */}
      <div className="sticky top-[70px] z-30 bg-white/95 backdrop-blur-md border border-border shadow-sm rounded-xl px-4 py-3">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {(["all", "checking", "savings", "credit", "investment"] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "primary" : "ghost"}
                size="small"
                onClick={() => setFilterType(type)}
                className="capitalize shrink-0">
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by nickname or last 4 digits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[200px]">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance-desc">Balance (High → Low)</SelectItem>
                <SelectItem value="balance-asc">Balance (Low → High)</SelectItem>
                <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z → A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      {error ? (
        renderErrorState()
      ) : isLoading ? (
        renderSkeletons()
      ) : filteredAccounts.length === 0 ? (
        renderEmptyState()
      ) : (
        <div
          id="accounts-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onViewDetails={(acc, tab) => {
                setSelectedAccount(acc);
                setDetailsInitialTab(tab || "overview");
              }}
              userPreferences={userPreferences}
            />
          ))}
        </div>
      )}

      {/* Detailed View Modal */}
      <AccountDetailsDialog
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        account={selectedAccount}
        transactions={transactions}
        isLoadingTransactions={isLoadingTransactions}
        userPreferences={userPreferences}
        initialTab={detailsInitialTab}
      />

      <OpenAccountDialog
        isOpen={isOpenAccountOpen}
        onClose={() => setIsOpenAccountOpen(false)}
      />

      <LinkExternalAccountDialog
        isOpen={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
      />
    </div>
  );
}
