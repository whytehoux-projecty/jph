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
  ArrowRightLeft,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { getTransactions } from "@/app/actions/transactions";
import { requestPrimaryVaultChange } from "@/app/actions/accounts";
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
  AccountSwapDialog,
} from "./components/AccountActionDialogs";
import { VaultExplainerPanel } from "./components/VaultExplainerPanel";
import { AccountCard, Account } from "./components/AccountCard";
import { normalizeVaultType } from "@/lib/vault-rules";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchInput } from "@/components/ui/SearchInput";
import { SortSelect } from "@/components/ui/SortSelect";
import { PromoBanner } from "@/components/ui/PromoBanner";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "credit" | "debit";
}

import { Sentry } from "@/lib/sentry-mock";

interface AccountsClientProps {
  initialAccounts: Account[];
  userPreferences: { language: string; currency: string };
  pendingActionsCount: number;
  promoMessage: string | null;
  eligibilityData?: any;
}

export default function VaultsClient({
  initialAccounts,
  userPreferences,
  pendingActionsCount,
  promoMessage,
  eligibilityData,
}: AccountsClientProps) {
  const router = useRouter();
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
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [preselectedSwapAccountId, setPreselectedSwapAccountId] = useState<string>("");

  const handleRequestPrimary = async (acc: Account) => {
    try {
      const res = await requestPrimaryVaultChange(acc.id);
      toast.success({
        title: "Request Submitted",
        description: res.message,
      });
      router.refresh();
    } catch (err: any) {
      toast.error({
        title: "Request Failed",
        description: err.message || "Failed to submit Primary designation request.",
      });
    }
  };

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
          if (parsed.filterType === "bank accounts" || parsed.filterType === "checking") {
            setFilterType("depository");
          } else if (parsed.filterType === "wallets" || parsed.filterType === "credit cards") {
            setFilterType("all");
          } else {
            setFilterType(parsed.filterType);
          }
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
        const vType = acc.vaultType || normalizeVaultType(acc.type || "");
        if (filterType === "depository" || filterType === "bank accounts") {
          return (
            vType === "SAVINGS" ||
            vType === "CURRENT" ||
            acc.type === "checking" ||
            acc.type === "current" ||
            acc.type === "savings"
          );
        }
        if (filterType === "sub" || filterType === "wallets") {
          return (
            vType === "DCA" ||
            vType === "INVESTMENT" ||
            vType === "OFFSHORE" ||
            acc.type === "dca" ||
            acc.type === "investment" ||
            acc.type === "offshore" ||
            acc.type === "wallet"
          );
        }
        if (filterType === "external") {
          return Boolean(acc.isExternal);
        }
        // "all" shows every single vault
        return true;
      })
      .filter((acc) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          acc.name.toLowerCase().includes(q) ||
          acc.accountNumber.includes(q) ||
          (acc.vaultType && acc.vaultType.toLowerCase().includes(q)) ||
          (acc.institutionName && acc.institutionName.toLowerCase().includes(q))
        );
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
      accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0),
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
  const hasAccounts = accounts.length > 0;

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "checking":
      case "current":
        return Landmark;
      case "savings":
        return PiggyBank;
      case "credit":
        return CreditCard;
      case "investment":
        return TrendingUp;
      case "dca":
      case "wallet":
        return Wallet;
      case "offshore":
        return Landmark;
      default:
        return Landmark;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "checking":
      case "current":
        return "green";
      case "savings":
        return "gold";
      case "credit":
        return "ink-900";
      case "investment":
        return "gold";
      case "dca":
      case "wallet":
        return "green";
      default:
        return "ink-900";
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
      setFilterType("all");
      setSortOrder("balance-desc");
      setSearchQuery("");
    } else if (type === "active") {
      setFilterType("depository");
      setSearchQuery("");
    } else if (type === "pending") {
      setFilterType("sub");
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
    <div className="text-center py-16 bg-paper-100 border border-dashed border-paper-300 p-8 space-y-4">
      <div className="mx-auto w-16 h-16 bg-paper-200 border border-paper-300 flex items-center justify-center text-ink-700">
        <Landmark className="w-8 h-8 stroke-2" />
      </div>
      <div>
        <h3 className="font-display font-bold text-lg text-ink-900">
          {searchQuery ? "No Matching Vaults" : "No Vaults Found"}
        </h3>
        <p className="text-xs sm:text-sm text-ink-600 max-w-md mx-auto mt-1">
          {searchQuery
            ? `No accounts match "${searchQuery}". Try clearing your search query or switching tabs.`
            : filterType !== "all"
            ? `You don't have any vaults in this category yet. Switch to "All Vaults" or open a new vault.`
            : "You don't have any active vaults configured yet. Open a Primary savings or current vault to begin."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {searchQuery ? (
          <Button variant="outline" size="small" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        ) : filterType !== "all" ? (
          <Button variant="outline" size="small" onClick={() => setFilterType("all")}>
            View All Vaults
          </Button>
        ) : (
          <>
            <Button
              className="bg-ink-900 hover:bg-ink-800 text-white"
              size="small"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsOpenAccountOpen(true)}
            >
              Open New Vault
            </Button>
            <Button
              variant="outline"
              size="small"
              className="border-paper-300"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={() => setIsLinkOpen(true)}
            >
              Link External Vault
            </Button>
          </>
        )}
      </div>
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
    <>
      <div className="mx-auto w-full max-w-7xl rounded-sm border border-paper-300 bg-white shadow-sm overflow-hidden mb-12">
        <div className="sr-only" aria-live="polite">
        {liveMessage}
      </div>

      {/* Page Header — styled like Transfers & Pay Bills with breadcrumb back link */}
      <header className="space-y-3 border-b border-paper-300 bg-paper-100 p-6 sm:p-7">
        <Link
          href="/vaults"
          className="inline-flex items-center gap-1 text-small text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
        >
          <ChevronLeft className="h-4 w-4" /> Vaults & Cards
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-h2 font-bold text-ink-900">
              Vaults
            </h1>
            <p className="max-w-2xl text-body text-ink-700">
              Manage your personal savings, checking, digital assets, and custody vaults from a unified ledger.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="small"
              className="border-paper-300 bg-white hover:bg-paper-50"
              onClick={() => window.location.reload()}
              disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 stroke-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="small"
              className="border-paper-300 bg-white hover:bg-paper-50 text-ink-800"
              onClick={() => setIsLinkOpen(true)}>
              <ExternalLink className="w-4 h-4 mr-1.5 stroke-2 text-vintage-gold" />
              Link External Vault
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={() => setIsOpenAccountOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5 stroke-2" />
              Open New Vault
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8 space-y-8 bg-white">
        {showPromo && promoMessage && (
          <PromoBanner
            title="Important Notice"
            body={promoMessage}
            ctaLabel="View Details"
            onCtaClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/support";
              }
            }}
            onDismiss={handlePromoDismiss}
          />
        )}

        {/* In-App Explanation Panel: Single Source of Truth Rules & Explainer Copy */}
        <VaultExplainerPanel
          heldTypes={eligibilityData?.heldTypes || accounts.map((a: any) => a.vaultType || a.type?.toUpperCase())}
          onOpenNew={() => setIsOpenAccountOpen(true)}
          onLinkExternal={() => setIsLinkOpen(true)}
        />

        {hasAccounts && (
          <>
            {/* KPI Analytics */}
            <AccountAnalytics
              currency={userPreferences.currency}
              totalLiquidAssets={totalLiquidAssets}
              activeAccountsCount={activeAccountsCount}
              pendingActionsCount={pendingActionsCount}
              onDrilldown={handleKpiDrilldown}
            />

            {/* Filter Bar */}
            <div className="border border-paper-300 bg-paper-50/60 p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <Tabs value={filterType} onValueChange={setFilterType} className="w-full md:w-auto">
                  <TabsList className="w-full md:w-auto inline-flex p-1 bg-paper-100 border border-paper-300 rounded-none">
                    <TabsTrigger
                      value="all"
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-none data-[state=active]:bg-ink-900 data-[state=active]:text-white"
                    >
                      All Vaults ({accounts.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="depository"
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-none data-[state=active]:bg-ink-900 data-[state=active]:text-white"
                    >
                      Core Depository
                    </TabsTrigger>
                    <TabsTrigger
                      value="sub"
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-none data-[state=active]:bg-ink-900 data-[state=active]:text-white"
                    >
                      Sub-Accounts
                    </TabsTrigger>
                    <TabsTrigger
                      value="external"
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-none data-[state=active]:bg-ink-900 data-[state=active]:text-white"
                    >
                      External Linked
                    </TabsTrigger>
                  </TabsList>
                  <div className="hidden">
                    <TabsContent value="all" />
                    <TabsContent value="depository" />
                    <TabsContent value="sub" />
                    <TabsContent value="external" />
                  </div>
                </Tabs>

                <div className="flex items-center gap-2 w-full md:w-auto flex-1 md:flex-none justify-end">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search by name, vault type, or last 4..."
                  />
                  <SortSelect value={sortOrder} onChange={setSortOrder} />
                </div>
              </div>
            </div>
          </>
        )}

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
              onSwapRequest={(acc) => {
                setPreselectedSwapAccountId(acc.id);
                setIsSwapOpen(true);
              }}
              onRequestPrimary={handleRequestPrimary}
              userPreferences={userPreferences}
            />
          ))}
        </div>
      )}
      </div>
    </div>

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
      existingAccounts={accounts as any}
      onSuccess={() => router.refresh()}
    />

    <LinkExternalAccountDialog
      isOpen={isLinkOpen}
      onClose={() => setIsLinkOpen(false)}
      existingAccounts={accounts as any}
      onSuccess={() => router.refresh()}
    />

    <AccountSwapDialog
      isOpen={isSwapOpen}
      onClose={() => setIsSwapOpen(false)}
      existingAccounts={accounts as any}
      preselectedAccountId={preselectedSwapAccountId}
      onSuccess={() => router.refresh()}
    />
  </>
);
}
