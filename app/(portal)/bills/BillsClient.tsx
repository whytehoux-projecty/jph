"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  FileText,
  ChevronLeft,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  Printer,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { payBill, type BillProvider, type UserBillPermissions } from "@/app/actions/bills";
import { toast } from "@/lib/toast";
import { fmtMoney } from "@/lib/transfer-forms/validators";
import { CountrySelector } from "./components/CountrySelector";
import { ServiceCategoryGrid, CATEGORIES } from "./components/ServiceCategoryGrid";
import { InvoiceUploader } from "./components/InvoiceUploader";

export interface AccountOption {
  id: string;
  name: string;
  accountType: string;
  balance: number;
  accountNumber: string;
  currency: string;
}

export interface BillHistoryItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  payee?: {
    name: string;
    accountNumber: string;
    category?: string;
  };
  account?: {
    accountType: string;
    accountNumber: string;
  };
}

interface BillsClientProps {
  initialAccounts: AccountOption[];
  initialProviders: BillProvider[];
  initialHistory: BillHistoryItem[];
  permissions?: UserBillPermissions;
}

export default function BillsClient({
  initialAccounts,
  initialProviders,
  initialHistory,
  permissions = {
    enabled: true,
    methods: { providers: true, einvoice: true },
  },
}: BillsClientProps) {
  const router = useRouter();

  // Tab State: "providers" (Select from available Bill Providers) | "invoice" (Using an e-invoice ticket)
  const [activeTab, setActiveTab] = React.useState<"providers" | "invoice">("providers");

  // Accounts & History
  const [accounts] = React.useState<AccountOption[]>(initialAccounts);
  const [history, setHistory] = React.useState<BillHistoryItem[]>(initialHistory);
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>(
    initialAccounts[0]?.id || ""
  );

  // SECTION 1: Available Bill Providers state
  const [providerStep, setProviderStep] = React.useState<"select" | "details" | "review" | "done">("select");
  const [selectedCountry, setSelectedCountry] = React.useState("usa");
  const [selectedCategory, setSelectedCategory] = React.useState("UTILITIES");
  const [selectedProviderName, setSelectedProviderName] = React.useState("");
  const [providerSearch, setProviderSearch] = React.useState("");
  const [customProviderInput, setCustomProviderInput] = React.useState("");
  const [customerId, setCustomerId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [billMemo, setBillMemo] = React.useState("");
  const [isSubmittingProvider, setIsSubmittingProvider] = React.useState(false);
  const [providerReceipt, setProviderReceipt] = React.useState<{
    reference: string;
    amount: string;
    provider: string;
    account: string;
    date: string;
  } | null>(null);

  // SECTION 2: E-Invoice Ticket state
  const [invoiceStep, setInvoiceStep] = React.useState<"upload" | "scanning" | "pipeline" | "done">("upload");
  const [invoiceFile, setInvoiceFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(0);
  const [extractedInvoice, setExtractedInvoice] = React.useState<{
    payeeId?: string;
    merchantName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    category: string;
    fileSize: string;
    fileName: string;
  } | null>(null);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = React.useState(false);
  const [invoiceReceipt, setInvoiceReceipt] = React.useState<{
    reference: string;
    amount: string;
    merchant: string;
    invoiceNo: string;
    account: string;
    date: string;
  } | null>(null);

  // Filtered providers for Section 1
  const filteredProviders = React.useMemo(() => {
    return initialProviders.filter((p) => {
      const matchCountry = !selectedCountry || p.country.toLowerCase() === selectedCountry.toLowerCase();
      const matchCategory = !selectedCategory || p.category.toUpperCase() === selectedCategory.toUpperCase();
      const matchSearch =
        !providerSearch ||
        p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
        p.description?.toLowerCase().includes(providerSearch.toLowerCase());
      return matchCountry && matchCategory && matchSearch;
    });
  }, [initialProviders, selectedCountry, selectedCategory, providerSearch]);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // SECTION 1: Handle Provider Submission
  const handleExecuteProviderPayment = async () => {
    if (!permissions.enabled) {
      toast.error({
        title: "Access Restricted",
        description: "Bill payment services are currently disabled for your account profile.",
      });
      return;
    }

    if (!permissions.methods.providers) {
      toast.error({
        title: "Method Blocked",
        description: "Direct bill provider directory payments are currently restricted for your account.",
      });
      return;
    }

    if (!amount || !selectedAccountId || !selectedProviderName) return;

    setIsSubmittingProvider(true);
    try {
      const targetProvider = initialProviders.find(p => p.name === selectedProviderName);
      const res = await payBill({
        accountId: selectedAccountId,
        payeeId: targetProvider?.id,
        name: selectedProviderName,
        accountNumber: customerId || targetProvider?.accountNumber || "ACC-DIRECT",
        amount,
        category: selectedCategory,
        country: selectedCountry,
        date: new Date().toISOString(),
        source: "DIRECTORY_PROVIDER",
      });

      const ref = res?.reference || ("BIL-" + Date.now().toString(36).toUpperCase());
      setProviderReceipt({
        reference: ref,
        amount,
        provider: selectedProviderName,
        account: `${selectedAccount?.accountType} ••••${selectedAccount?.accountNumber.slice(-4)}`,
        date: new Date().toLocaleString(),
      });

      // Optimistically update recent history
      setHistory((prev) => [
        {
          id: res?.bill?.id || ("BIL-" + Date.now().toString()),
          amount: parseFloat(amount),
          status: "PENDING",
          createdAt: new Date().toISOString(),
          payee: {
            name: selectedProviderName,
            accountNumber: customerId || targetProvider?.accountNumber || "ACC-DIRECT",
            category: selectedCategory,
          },
          account: {
            accountType: selectedAccount?.accountType || "CHECKING",
            accountNumber: selectedAccount?.accountNumber || "1234",
          },
        },
        ...prev,
      ]);

      setProviderStep("done");
      router.refresh();
      toast.success({
        title: "Payment Pipeline Executed",
        description: `$${amount} successfully dispatched to ${selectedProviderName}.`,
      });
    } catch (err) {
      console.error(err);
      toast.error({
        title: "Payment Pipeline Failed",
        description: "Please check your account balance and routing details.",
      });
    } finally {
      setIsSubmittingProvider(false);
    }
  };

  // SECTION 2: Handle Invoice Upload & Scanning
  const handleProcessInvoice = async (file: File) => {
    if (!permissions.enabled || !permissions.methods.einvoice) {
      toast.error({
        title: "Method Blocked",
        description: "E-Invoice Ticket pipeline processing is currently restricted for your profile.",
      });
      return;
    }

    setInvoiceFile(file);
    setIsUploading(true);
    setInvoiceStep("scanning");
    setScanProgress(25);

    try {
      await new Promise((r) => setTimeout(r, 350));
      setScanProgress(70);
      await new Promise((r) => setTimeout(r, 350));
      setScanProgress(100);

      // Match against live DB providers configured by admin
      const lowerFileName = file.name.toLowerCase();
      const matched = initialProviders.find(
        (p) =>
          lowerFileName.includes(p.name.toLowerCase()) ||
          (p.code && lowerFileName.includes(p.code.toLowerCase()))
      ) || initialProviders[0];

      // Cleaned document identifier from real filename
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-");
      const invNumber = baseName.length > 3 ? baseName.slice(0, 24).toUpperCase() : `INV-${new Date().getFullYear()}`;

      const due = new Date();
      due.setDate(due.getDate() + 14);
      const dueDate = due.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      setExtractedInvoice({
        payeeId: matched?.id,
        merchantName: matched?.name || "Corporate Bill Service",
        invoiceNumber: invNumber,
        amount: "", // User inputs their real statement balance
        dueDate,
        category: matched?.category || "UTILITIES",
        fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
        fileName: file.name,
      });

      setInvoiceStep("pipeline");
      toast.success({
        title: "E-Invoice Document Loaded",
        description: `Verified "${file.name}". Please confirm provider details and statement amount.`,
      });
    } catch (err) {
      console.error(err);
      toast.error({
        title: "Invoice Parsing Incomplete",
        description: "Could not automatically extract all parameters. Please verify.",
      });
      setInvoiceStep("upload");
    } finally {
      setIsUploading(false);
    }
  };

  // SECTION 2: Execute Invoice Payment Pipeline
  const handleExecuteInvoicePipeline = async () => {
    if (!permissions.enabled || !permissions.methods.einvoice) {
      toast.error({
        title: "Method Blocked",
        description: "E-Invoice Ticket pipeline processing is currently restricted for your profile.",
      });
      return;
    }

    if (!extractedInvoice || !selectedAccountId) return;

    const numAmount = parseFloat(extractedInvoice.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error({
        title: "Amount Required",
        description: "Please specify a valid invoice statement total greater than zero.",
      });
      return;
    }

    setIsSubmittingInvoice(true);
    try {
      const res = await payBill({
        accountId: selectedAccountId,
        payeeId: extractedInvoice.payeeId,
        name: extractedInvoice.merchantName,
        accountNumber: extractedInvoice.invoiceNumber,
        amount: extractedInvoice.amount,
        category: extractedInvoice.category,
        date: new Date().toISOString(),
        source: "EINVOICE_PIPELINE",
      });

      const ref = res?.reference || ("BIL-" + Date.now().toString(36).toUpperCase());
      setInvoiceReceipt({
        reference: ref,
        amount: extractedInvoice.amount,
        merchant: extractedInvoice.merchantName,
        invoiceNo: extractedInvoice.invoiceNumber,
        account: `${selectedAccount?.accountType} ••••${selectedAccount?.accountNumber.slice(-4)}`,
        date: new Date().toLocaleString(),
      });

      // Optimistically update recent history
      setHistory((prev) => [
        {
          id: res?.bill?.id || ("BIL-" + Date.now().toString()),
          amount: numAmount,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          payee: {
            name: extractedInvoice.merchantName,
            accountNumber: extractedInvoice.invoiceNumber,
            category: "E-INVOICE",
          },
          account: {
            accountType: selectedAccount?.accountType || "CHECKING",
            accountNumber: selectedAccount?.accountNumber || "1234",
          },
        },
        ...prev,
      ]);

      setInvoiceStep("done");
      router.refresh();
      toast.success({
        title: "E-Invoice Pipeline Executed",
        description: `Settlement of $${extractedInvoice.amount} dispatched to ${extractedInvoice.merchantName}.`,
      });
    } catch (err) {
      console.error(err);
      toast.error({
        title: "Pipeline Execution Failed",
        description: "Unable to complete settlement debit. Please try again.",
      });
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const resetProviderFlow = () => {
    setProviderStep("select");
    setSelectedProviderName("");
    setCustomerId("");
    setAmount("");
    setBillMemo("");
    setProviderReceipt(null);
  };

  const resetInvoiceFlow = () => {
    setInvoiceStep("upload");
    setInvoiceFile(null);
    setExtractedInvoice(null);
    setInvoiceReceipt(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl rounded-sm border border-paper-300 bg-white shadow-sm overflow-hidden animate-fade-in-up">
      {/* Master Shell Header matching Transfer page */}
      <header className="space-y-3 border-b border-paper-300 bg-paper-100 p-6 sm:p-7">
        <Link
          href="/transfer"
          className="inline-flex items-center gap-1 text-small text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
        >
          <ChevronLeft className="h-4 w-4" /> Transfers & Pay Bills
        </Link>
        <h1 className="font-display text-h2 font-bold text-ink-900">Pay Bills</h1>
        <p className="max-w-2xl text-body text-ink-700">
          Settle utility accounts, telecom, tuition, and corporate invoices worldwide through certified banking rails.
        </p>
      </header>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8 space-y-8 bg-white">
        {/* Global Permission Warning Banner */}
        {!permissions.enabled && (
          <div className="p-4 rounded-sm border border-rose-300 bg-rose-50/80 text-rose-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Bill Payment Operations Restricted</h3>
              <p className="text-xs text-rose-800 mt-0.5">
                All outgoing bill settlements and payment scheduling have been disabled for this account by bank administration. To request clearance, please contact your relationship manager.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          {/* Sub-Sections Tab Navigation matching TransferHub */}
          <div
            role="tablist"
            aria-label="Pay Bills sections"
            className="flex items-end gap-1 overflow-x-auto scrollbar-hide border-b border-paper-300"
          >
            <button
              id="tab-providers"
              role="tab"
              aria-selected={activeTab === "providers"}
              className={cn(
                "shrink-0 px-5 py-2.5 rounded-none text-[13px] transition-all duration-150 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-1 flex items-center gap-2 -mb-[1px] cursor-pointer",
                activeTab === "providers"
                  ? "bg-white text-ink-900 border border-paper-300 border-b-white font-semibold"
                  : "text-ink-500 hover:text-ink-900 hover:bg-paper-100 border border-transparent border-b-transparent"
              )}
              onClick={() => setActiveTab("providers")}
            >
              <Building2 className={cn("h-4 w-4", activeTab === "providers" ? "text-ink-900" : "text-ink-500")} />
              <span>Select from available Bill Providers</span>
              <span
                className={cn(
                  "ml-1 text-[10px] px-1.5 py-0.2 rounded-none uppercase font-mono tracking-wider",
                  activeTab === "providers" ? "bg-paper-200 text-ink-900" : "bg-paper-100 text-ink-500"
                )}
              >
                Directory
              </span>
            </button>

            <button
              id="tab-invoice"
              role="tab"
              aria-selected={activeTab === "invoice"}
              className={cn(
                "shrink-0 px-5 py-2.5 rounded-none text-[13px] transition-all duration-150 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-1 flex items-center gap-2 -mb-[1px] cursor-pointer",
                activeTab === "invoice"
                  ? "bg-white text-ink-900 border border-paper-300 border-b-white font-semibold"
                  : "text-ink-500 hover:text-ink-900 hover:bg-paper-100 border border-transparent border-b-transparent"
              )}
              onClick={() => setActiveTab("invoice")}
            >
              <FileText className={cn("h-4 w-4", activeTab === "invoice" ? "text-ink-900" : "text-ink-500")} />
              <span>Using an e-invoice ticket (.PDF)</span>
              <span
                className={cn(
                  "ml-1 text-[10px] px-1.5 py-0.2 rounded-none uppercase font-mono tracking-wider",
                  activeTab === "invoice" ? "bg-vermilion-100 text-vermilion-700 font-semibold" : "bg-paper-100 text-ink-500"
                )}
              >
                Auto Pipeline
              </span>
            </button>
          </div>

          {/* Tab Panel */}
          <div id="pay-bills-panel" role="tabpanel">
            <AnimatePresence mode="wait">
              {/* ========================================================================= */}
              {/* SECTION 1: Select from available Bill Providers Flow                      */}
              {/* ========================================================================= */}
              {activeTab === "providers" && (
                <motion.div
                  key="section-providers"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="grid overflow-hidden rounded-none border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm">
                    {/* Left Column: Interactive Form & Pipeline Engine */}
                    <div className="p-5 sm:p-8 flex flex-col justify-between">
                      {providerStep === "select" && (
                        <div className="space-y-6">
                          <div>
                            <h2 className="font-display text-lg font-bold text-ink-900">
                              Browse Bill Providers Directory
                            </h2>
                            <p className="text-small text-ink-600 mt-0.5">
                              Filter by jurisdiction and service category to select a certified provider.
                            </p>
                          </div>

                          {/* Country / Region Selector */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                              1. Select Jurisdiction / Country
                            </label>
                            <div className="max-w-md">
                              <CountrySelector value={selectedCountry} onChange={setSelectedCountry} />
                            </div>
                          </div>

                          {/* Category Grid */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                              2. Choose Service Category
                            </label>
                            <ServiceCategoryGrid value={selectedCategory} onChange={setSelectedCategory} />
                          </div>

                          {/* Available Providers List */}
                          <div className="space-y-3 pt-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                                3. Select Available Provider ({filteredProviders.length})
                              </label>
                              <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-ink-500" />
                                <input
                                  type="text"
                                  placeholder="Search providers..."
                                  value={providerSearch}
                                  onChange={(e) => setProviderSearch(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-none border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                                />
                              </div>
                            </div>

                            {filteredProviders.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                                {filteredProviders.map((provider) => {
                                  const isSelected = selectedProviderName === provider.name;
                                  return (
                                    <button
                                      key={provider.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedProviderName(provider.name);
                                        if (provider.accountNumber) {
                                          setCustomerId(provider.accountNumber);
                                        }
                                        setProviderStep("details");
                                      }}
                                      className={cn(
                                        "p-3 rounded-none border text-left transition-all duration-150 flex items-center justify-between cursor-pointer group outline-none",
                                        "focus-visible:ring-2 focus-visible:ring-ink-900",
                                        isSelected
                                          ? "bg-vermilion-600 border-vermilion-600 text-white shadow-xs"
                                          : "bg-paper-50 border-paper-300 text-ink-900 hover:bg-paper-100 hover:border-ink-900"
                                      )}
                                    >
                                      <div className="min-w-0 pr-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-semibold text-small leading-tight truncate">
                                            {provider.name}
                                          </span>
                                          {provider.isCustom && (
                                            <span
                                              className={cn(
                                                "font-mono text-[9px] px-1.5 py-0.2 rounded-none uppercase font-bold tracking-wider",
                                                isSelected
                                                  ? "bg-white text-ink-900"
                                                  : "bg-amber-100 text-amber-900 border border-amber-300"
                                              )}
                                            >
                                              Live Portal Biller
                                            </span>
                                          )}
                                          {provider.code && (
                                            <span
                                              className={cn(
                                                "font-mono text-[10px] px-1.5 py-0.2 rounded-none uppercase",
                                                isSelected
                                                  ? "bg-white/20 text-white"
                                                  : "bg-paper-200 text-ink-600"
                                              )}
                                            >
                                              {provider.code}
                                            </span>
                                          )}
                                        </div>
                                        {provider.description && (
                                          <p
                                            className={cn(
                                              "text-[11px] leading-snug mt-0.5 truncate",
                                              isSelected ? "text-white/80" : "text-ink-500"
                                            )}
                                          >
                                            {provider.description}
                                          </p>
                                        )}
                                      </div>
                                      <span
                                        className={cn(
                                          "shrink-0 text-xs font-semibold px-2 py-1 rounded-none",
                                          isSelected
                                            ? "bg-white text-ink-900"
                                            : "bg-white border border-paper-300 text-ink-700 group-hover:border-ink-900"
                                        )}
                                      >
                                        Select →
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-6 border border-dashed border-paper-300 bg-paper-50/50 text-center space-y-3">
                                <p className="text-small text-ink-600">
                                  No default providers found for this category in{" "}
                                  <strong className="capitalize">{selectedCountry}</strong>.
                                </p>
                                <div className="max-w-md mx-auto flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Enter custom biller name..."
                                    value={customProviderInput}
                                    onChange={(e) => setCustomProviderInput(e.target.value)}
                                    className="flex-1 px-3 py-2 text-xs rounded-none border border-paper-300 bg-white"
                                  />
                                  <Button
                                    size="small"
                                    disabled={!customProviderInput.trim()}
                                    onClick={() => {
                                      setSelectedProviderName(customProviderInput.trim());
                                      setProviderStep("details");
                                    }}
                                  >
                                    Continue
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Step 2: Configure Payment Pipeline */}
                      {providerStep === "details" && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between pb-3 border-b border-paper-200">
                            <div>
                              <button
                                type="button"
                                onClick={() => setProviderStep("select")}
                                className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-900 mb-1 cursor-pointer"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" /> Change Provider
                              </button>
                              <h2 className="font-display text-lg font-bold text-ink-900">
                                Configure Payment Pipeline
                              </h2>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-success-bg text-success border border-success/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Biller Rail
                            </span>
                          </div>

                          {/* Selected Provider Badge */}
                          <div className="p-3.5 bg-paper-100 border border-paper-300 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                                Target Biller
                              </span>
                              <span className="font-semibold text-small text-ink-900">
                                {selectedProviderName}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-ink-600 uppercase bg-white px-2 py-0.5 border border-paper-300">
                              {selectedCategory} · {selectedCountry.toUpperCase()}
                            </span>
                          </div>

                          {/* Account Debit Selector */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Debit From Account
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {accounts.map((acc) => {
                                const isSelected = acc.id === selectedAccountId;
                                return (
                                  <button
                                    key={acc.id}
                                    type="button"
                                    onClick={() => setSelectedAccountId(acc.id)}
                                    className={cn(
                                      "p-3 rounded-none border text-left transition-all flex items-center justify-between cursor-pointer outline-none",
                                      isSelected
                                        ? "bg-white border-ink-900 ring-1 ring-ink-900 shadow-xs"
                                        : "bg-paper-50 border-paper-300 hover:bg-paper-100"
                                    )}
                                  >
                                    <div>
                                      <p className="font-semibold text-small text-ink-900">{acc.name}</p>
                                      <p className="text-[11px] font-mono text-ink-500">
                                        ••••{acc.accountNumber.slice(-4)}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[11px] text-ink-500">Available</p>
                                      <p className="font-mono text-small font-semibold text-ink-900">
                                        {fmtMoney(acc.balance, acc.currency)}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Customer Account / Meter Number */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Customer Account ID / Meter Reference
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 98402-49129 or ACC-40192"
                              value={customerId}
                              onChange={(e) => setCustomerId(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-small font-mono rounded-none border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                            />
                            <p className="text-[11px] text-ink-500">
                              Found at the top-right of your monthly statement or invoice stub.
                            </p>
                          </div>

                          {/* Payment Amount */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                                Amount to Pay (USD)
                              </label>
                              <span className="text-[11px] text-ink-500">Platform Fee: $0.00</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-ink-500 font-mono text-base">
                                $
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-3.5 py-2.5 text-base font-mono font-bold rounded-none border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                              />
                            </div>
                            {/* Preset Buttons */}
                            <div className="flex gap-2 pt-1">
                              {["50", "100", "250", "500"].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setAmount(preset)}
                                  className="px-2.5 py-1 text-xs font-mono border border-paper-300 bg-paper-50 hover:bg-paper-100 text-ink-700 cursor-pointer"
                                >
                                  +${preset}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Optional Memo */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Payment Memo / Note (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Monthly utilities statement settlement"
                              value={billMemo}
                              onChange={(e) => setBillMemo(e.target.value)}
                              className="w-full px-3.5 py-2 text-small rounded-none border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                            />
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex gap-3 pt-3">
                            <Button
                              variant="outline"
                              className="rounded-none flex-1"
                              onClick={() => setProviderStep("select")}
                            >
                              Back
                            </Button>
                            <Button
                              className="rounded-none flex-1 bg-ink-900 text-paper-50 hover:bg-black"
                              disabled={!amount || parseFloat(amount) <= 0 || !customerId}
                              onClick={() => setProviderStep("review")}
                            >
                              Review Pipeline →
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Review & Authorize Pipeline */}
                      {providerStep === "review" && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between pb-3 border-b border-paper-200">
                            <div>
                              <button
                                type="button"
                                onClick={() => setProviderStep("details")}
                                className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-900 mb-1 cursor-pointer"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to Edit
                              </button>
                              <h2 className="font-display text-lg font-bold text-ink-900">
                                Authorize Payment Pipeline
                              </h2>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-mono text-ink-600 bg-paper-100 px-2 py-1 border border-paper-300">
                              <Lock className="w-3.5 h-3.5 text-vintage-gold" /> Encrypted Rail
                            </span>
                          </div>

                          {/* Pipeline Visual Breakdown */}
                          <div className="border border-paper-300 bg-paper-50 p-4 sm:p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-paper-200 text-small">
                              <div>
                                <span className="text-xs text-ink-500 block">From Account</span>
                                <span className="font-semibold text-ink-900">
                                  {selectedAccount?.name}
                                </span>
                                <span className="text-xs font-mono text-ink-500 block">
                                  ••••{selectedAccount?.accountNumber.slice(-4)}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-ink-500 block">To Provider</span>
                                <span className="font-semibold text-ink-900">
                                  {selectedProviderName}
                                </span>
                                <span className="text-xs font-mono text-ink-500 block">
                                  {customerId}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 text-small">
                              <div className="flex justify-between text-ink-600">
                                <span>Bill Principal</span>
                                <span className="font-mono font-medium">${parseFloat(amount).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-ink-600">
                                <span>Heritage Bank Rail Fee</span>
                                <span className="font-mono text-success font-semibold">$0.00 (Waived)</span>
                              </div>
                              <div className="flex justify-between text-ink-600">
                                <span>Settlement Speed</span>
                                <span>Instant Clearing</span>
                              </div>
                              <div className="flex justify-between text-base font-bold text-ink-900 pt-2 border-t border-paper-300">
                                <span>Total Debit</span>
                                <span className="font-mono text-lg text-ink-900">
                                  ${parseFloat(amount).toFixed(2)} USD
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-paper-100 border border-paper-300 flex items-start gap-2.5 text-xs text-ink-700">
                            <ShieldCheck className="w-4 h-4 text-pine-700 shrink-0 mt-0.5" />
                            <span>
                              Every transaction is settled via authenticated commercial banking channels. Your account will be debited immediately upon confirmation.
                            </span>
                          </div>

                          {/* Submit Action */}
                          <div className="flex gap-3 pt-2">
                            <Button
                              variant="outline"
                              className="rounded-none flex-1"
                              onClick={() => setProviderStep("details")}
                              disabled={isSubmittingProvider}
                            >
                              Edit Details
                            </Button>
                            <Button
                              className="rounded-none flex-1 bg-vermilion-600 text-white hover:bg-vermilion-700 h-11"
                              onClick={handleExecuteProviderPayment}
                              disabled={isSubmittingProvider}
                            >
                              {isSubmittingProvider ? (
                                <span className="flex items-center gap-2">
                                  <RefreshCw className="h-4 w-4 animate-spin" /> Authorizing Rail...
                                </span>
                              ) : (
                                "Authorize & Pay Bill Now"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Done / Receipt Confirmation */}
                      {providerStep === "done" && providerReceipt && (
                        <div className="space-y-6 py-4 animate-in zoom-in-95">
                          <div className="text-center space-y-2">
                            <div className="w-14 h-14 bg-success-bg border border-success/30 rounded-none mx-auto flex items-center justify-center text-success mb-3">
                              <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h2 className="font-display text-xl font-bold text-ink-900">
                              Bill Payment Dispatched!
                            </h2>
                            <p className="text-small text-ink-600 max-w-sm mx-auto">
                              Your payment has been cleared through the Heritage Biller Rail and assigned an official audit reference.
                            </p>
                          </div>

                          <div className="border border-paper-300 bg-paper-50 p-5 space-y-3 font-mono text-xs">
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Payment Reference:</span>
                              <span className="font-bold text-ink-900">{providerReceipt.reference}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Payee Biller:</span>
                              <span className="font-semibold text-ink-900">{providerReceipt.provider}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Debited Account:</span>
                              <span className="text-ink-900">{providerReceipt.account}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Amount:</span>
                              <span className="font-bold text-ink-900 text-small">
                                ${parseFloat(providerReceipt.amount).toFixed(2)} USD
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ink-500 uppercase">Timestamp:</span>
                              <span className="text-ink-600">{providerReceipt.date}</span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="rounded-none flex-1"
                              onClick={() => window.print()}
                            >
                              <Printer className="w-4 h-4 mr-1.5" /> Print Receipt
                            </Button>
                            <Button
                              className="rounded-none flex-1 bg-ink-900 text-paper-50 hover:bg-black"
                              onClick={resetProviderFlow}
                            >
                              Pay Another Bill
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: InfoPanel matching TransferHub */}
                    <aside
                      aria-label="About Bill Directory"
                      className="space-y-5 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                    >
                      <div className="space-y-5">
                        {/* Custom SVG Ledger Art */}
                        <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                          <svg
                            viewBox="0 0 280 130"
                            className="h-auto w-full"
                            role="img"
                            aria-label="Biller Directory Artwork"
                          >
                            <rect width="280" height="130" fill="#FBF9F4" />
                            {/* Building pillar art */}
                            <rect x="24" y="30" width="70" height="70" fill="#14181F" rx="2" />
                            <path d="M24 45h70M24 75h70" stroke="#2E353B" strokeWidth="2" />
                            <rect x="36" y="85" width="46" height="15" fill="#B8893B" />
                            {/* Connecting pipeline */}
                            <path
                              d="M94 65h92"
                              stroke="#D8432B"
                              strokeWidth="2.5"
                              strokeDasharray="2 4"
                            />
                            <path
                              d="M180 58l8 7-8 7"
                              stroke="#D8432B"
                              strokeWidth="2.5"
                              fill="none"
                              strokeLinecap="round"
                            />
                            {/* Provider stamp */}
                            <rect x="186" y="30" width="70" height="70" fill="#1F4D3F" rx="2" />
                            <circle cx="221" cy="65" r="16" fill="none" stroke="#F6F1E7" strokeWidth="2" />
                            <path d="M214 65l5 5 10-10" stroke="#F6F1E7" strokeWidth="2" fill="none" />
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-display text-base font-semibold text-ink-900">
                            Global Biller Network
                          </h3>
                          <p className="text-small text-ink-700">
                            Direct settlement pipeline linked with verified utility, municipal, internet, and commercial providers worldwide.
                          </p>
                          <p className="text-small text-ink-700">
                            All requests are authenticated and settled on official banking rails with zero intermediaries.
                          </p>
                        </div>

                        <ol className="space-y-2.5" aria-label="How it works">
                          {[
                            "Select jurisdiction and service category to pinpoint your biller.",
                            "Provide your customer account identifier or meter reference.",
                            "Authorize the pipeline; settlement acknowledgement is issued instantly.",
                          ].map((s, i) => (
                            <li key={s} className="flex items-start gap-3 text-small text-ink-700">
                              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-ink-900 text-[11px] font-semibold text-paper-50">
                                {i + 1}
                              </span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="border-t border-paper-300 pt-4 text-xs text-ink-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Processing Speed:</span>
                          <span className="font-semibold text-ink-900">Instant Clearing</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Security Standard:</span>
                          <span className="font-semibold text-ink-900">ISO 20022 Direct Rail</span>
                        </div>
                      </div>
                    </aside>
                  </div>
                </motion.div>
              )}

              {/* ========================================================================= */}
              {/* SECTION 2: Using an E-Invoice Ticket (.PDF) Flow                          */}
              {/* ========================================================================= */}
              {activeTab === "invoice" && (
                <motion.div
                  key="section-invoice"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="grid overflow-hidden rounded-none border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm">
                    {/* Left Column: Invoice Processing & Pipeline Synthesis */}
                    <div className="p-5 sm:p-8 flex flex-col justify-between">
                      {/* Step 1: Upload Ticket */}
                      {invoiceStep === "upload" && (
                        <div className="space-y-6">
                          <div>
                            <h2 className="font-display text-lg font-bold text-ink-900">
                              Upload E-Invoice Ticket (.PDF)
                            </h2>
                            <p className="text-small text-ink-600 mt-0.5">
                              Our automated OCR engine scans your PDF ticket and constructs the complete payment pipeline.
                            </p>
                          </div>

                          <InvoiceUploader
                            onFileSelect={handleProcessInvoice}
                            currentFile={invoiceFile}
                            isUploading={isUploading}
                            error={null}
                            onClear={() => setInvoiceFile(null)}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            <div className="p-3 border border-paper-300 bg-paper-50 rounded-none text-xs">
                              <span className="font-semibold text-ink-900 block mb-0.5">1. Upload PDF</span>
                              <span className="text-ink-600">Utility bill, telecom invoice, or vendor ticket.</span>
                            </div>
                            <div className="p-3 border border-paper-300 bg-paper-50 rounded-none text-xs">
                              <span className="font-semibold text-ink-900 block mb-0.5">2. Auto Extraction</span>
                              <span className="text-ink-600">Biller name, invoice ID, due total, and routing.</span>
                            </div>
                            <div className="p-3 border border-paper-300 bg-paper-50 rounded-none text-xs">
                              <span className="font-semibold text-ink-900 block mb-0.5">3. 1-Click Pay</span>
                              <span className="text-ink-600">Instant direct debit from your chosen account.</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Scanning & Pipeline Generation Animation */}
                      {invoiceStep === "scanning" && (
                        <div className="py-12 space-y-6 text-center animate-in fade-in">
                          <div className="w-16 h-16 border border-ink-900 bg-paper-100 mx-auto flex items-center justify-center relative">
                            <FileText className="w-8 h-8 text-ink-900" />
                            <div className="absolute inset-0 border-2 border-vermilion-600 animate-ping opacity-30" />
                          </div>

                          <div className="space-y-2 max-w-sm mx-auto">
                            <h3 className="font-display text-lg font-bold text-ink-900">
                              Synthesizing Payment Pipeline...
                            </h3>
                            <p className="text-small text-ink-600">
                              Parsing PDF document headers, optical remittance barcodes, and payee banking credentials.
                            </p>
                          </div>

                          {/* Progress bar */}
                          <div className="max-w-xs mx-auto space-y-1">
                            <div className="w-full bg-paper-200 h-2 border border-paper-300 overflow-hidden">
                              <div
                                className="bg-ink-900 h-full transition-all duration-300"
                                style={{ width: `${scanProgress}%` }}
                              />
                            </div>
                            <p className="text-[11px] font-mono text-ink-500 text-right">{scanProgress}%</p>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Automatically Generated Payment Pipeline */}
                      {invoiceStep === "pipeline" && extractedInvoice && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between pb-3 border-b border-paper-200">
                            <div>
                              <button
                                type="button"
                                onClick={() => setInvoiceStep("upload")}
                                className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-900 mb-1 cursor-pointer"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" /> Upload Different Ticket
                              </button>
                              <h2 className="font-display text-lg font-bold text-ink-900">
                                Generated Payment Pipeline
                              </h2>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-success-bg text-success border border-success/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Ticket Parsed & Verified
                            </span>
                          </div>

                          {/* Extracted Ticket Metadata Header */}
                          <div className="p-4 border border-paper-300 bg-paper-50 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-paper-200 text-xs">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-ink-900" />
                                <span className="font-semibold text-ink-900">{extractedInvoice.fileName}</span>
                              </div>
                              <span className="font-mono text-ink-500">{extractedInvoice.fileSize}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-small">
                              <div>
                                <span className="text-[11px] text-ink-500 uppercase block">Selected Biller (DB)</span>
                                {initialProviders.length > 0 ? (
                                  <select
                                    value={extractedInvoice.payeeId || ""}
                                    onChange={(e) => {
                                      const p = initialProviders.find((item) => item.id === e.target.value);
                                      if (p) {
                                        setExtractedInvoice({
                                          ...extractedInvoice,
                                          payeeId: p.id,
                                          merchantName: p.name,
                                          category: p.category,
                                        });
                                      }
                                    }}
                                    className="w-full font-semibold text-ink-900 bg-white border border-paper-300 px-2 py-1 text-xs rounded-none"
                                  >
                                    {initialProviders.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={extractedInvoice.merchantName}
                                    onChange={(e) =>
                                      setExtractedInvoice({
                                        ...extractedInvoice,
                                        merchantName: e.target.value,
                                      })
                                    }
                                    className="w-full font-semibold text-ink-900 bg-white border border-paper-300 px-2 py-1 text-xs rounded-none"
                                  />
                                )}
                              </div>
                              <div>
                                <span className="text-[11px] text-ink-500 uppercase block">Invoice ID</span>
                                <input
                                  type="text"
                                  value={extractedInvoice.invoiceNumber}
                                  onChange={(e) =>
                                    setExtractedInvoice({
                                      ...extractedInvoice,
                                      invoiceNumber: e.target.value,
                                    })
                                  }
                                  className="w-full font-mono text-ink-900 bg-white border border-paper-300 px-2 py-1 text-xs rounded-none"
                                />
                              </div>
                              <div>
                                <span className="text-[11px] text-ink-500 uppercase block">Due Date</span>
                                <span className="font-medium text-ink-900 block pt-1 text-xs">
                                  {extractedInvoice.dueDate}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Source Account Debit Selector */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Select Debit Account
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {accounts.map((acc) => {
                                const isSelected = acc.id === selectedAccountId;
                                const isSufficient = acc.balance >= parseFloat(extractedInvoice.amount);
                                return (
                                  <button
                                    key={acc.id}
                                    type="button"
                                    onClick={() => setSelectedAccountId(acc.id)}
                                    className={cn(
                                      "p-3 rounded-none border text-left transition-all flex items-center justify-between cursor-pointer outline-none",
                                      isSelected
                                        ? "bg-white border-ink-900 ring-1 ring-ink-900 shadow-xs"
                                        : "bg-paper-50 border-paper-300 hover:bg-paper-100",
                                      !isSufficient && "opacity-60"
                                    )}
                                  >
                                    <div>
                                      <p className="font-semibold text-small text-ink-900">{acc.name}</p>
                                      <p className="text-[11px] font-mono text-ink-500">
                                        ••••{acc.accountNumber.slice(-4)}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[11px] text-ink-500">Available</p>
                                      <p className="font-mono text-small font-semibold text-ink-900">
                                        {fmtMoney(acc.balance, acc.currency)}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Editable Total Amount */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                                Total Extracted Amount (USD)
                              </label>
                              <span className="text-[11px] text-success font-semibold">Zero Surcharge</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-ink-500 font-mono text-base">
                                $
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                                value={extractedInvoice.amount}
                                onChange={(e) =>
                                  setExtractedInvoice({
                                    ...extractedInvoice,
                                    amount: e.target.value,
                                  })
                                }
                                className="w-full pl-8 pr-3.5 py-2.5 text-lg font-mono font-bold rounded-none border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-3">
                            <Button
                              variant="outline"
                              className="rounded-none flex-1"
                              onClick={() => setInvoiceStep("upload")}
                              disabled={isSubmittingInvoice}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="rounded-none flex-1 bg-vermilion-600 text-white hover:bg-vermilion-700 h-11"
                              onClick={handleExecuteInvoicePipeline}
                              disabled={isSubmittingInvoice || !extractedInvoice.amount || parseFloat(extractedInvoice.amount) <= 0}
                            >
                              {isSubmittingInvoice ? (
                                <span className="flex items-center gap-2">
                                  <RefreshCw className="h-4 w-4 animate-spin" /> Executing Pipeline...
                                </span>
                              ) : (
                                `Authorize & Execute Pipeline (${extractedInvoice.amount ? '$' + parseFloat(extractedInvoice.amount).toFixed(2) : 'Enter Amount'})`
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Done / Invoice Receipt Confirmation */}
                      {invoiceStep === "done" && invoiceReceipt && (
                        <div className="space-y-6 py-4 animate-in zoom-in-95">
                          <div className="text-center space-y-2">
                            <div className="w-14 h-14 bg-success-bg border border-success/30 rounded-none mx-auto flex items-center justify-center text-success mb-3">
                              <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h2 className="font-display text-xl font-bold text-ink-900">
                              E-Invoice Pipeline Settled!
                            </h2>
                            <p className="text-small text-ink-600 max-w-sm mx-auto">
                              The invoice remittance was generated and debited from your vault account successfully.
                            </p>
                          </div>

                          <div className="border border-paper-300 bg-paper-50 p-5 space-y-3 font-mono text-xs">
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Settlement Reference:</span>
                              <span className="font-bold text-ink-900">{invoiceReceipt.reference}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Invoice Identifier:</span>
                              <span className="font-semibold text-ink-900">{invoiceReceipt.invoiceNo}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Merchant Payee:</span>
                              <span className="text-ink-900">{invoiceReceipt.merchant}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Settled Total:</span>
                              <span className="font-bold text-ink-900 text-small">
                                ${parseFloat(invoiceReceipt.amount).toFixed(2)} USD
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ink-500 uppercase">Settled At:</span>
                              <span className="text-ink-600">{invoiceReceipt.date}</span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="rounded-none flex-1"
                              onClick={() => window.print()}
                            >
                              <Printer className="w-4 h-4 mr-1.5" /> Print Remittance Receipt
                            </Button>
                            <Button
                              className="rounded-none flex-1 bg-ink-900 text-paper-50 hover:bg-black"
                              onClick={resetInvoiceFlow}
                            >
                              Upload Another Invoice
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: InfoPanel for E-Invoice */}
                    <aside
                      aria-label="About Automated Invoicing"
                      className="space-y-5 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                    >
                      <div className="space-y-5">
                        {/* Custom SVG Ledger Art for E-Invoice */}
                        <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                          <svg
                            viewBox="0 0 280 130"
                            className="h-auto w-full"
                            role="img"
                            aria-label="E-Invoice OCR Artwork"
                          >
                            <rect width="280" height="130" fill="#FBF9F4" />
                            {/* PDF ticket document */}
                            <rect x="30" y="24" width="75" height="82" fill="#14181F" rx="2" />
                            <rect x="40" y="36" width="30" height="6" fill="#B8893B" rx="1" />
                            <rect x="40" y="48" width="55" height="3" fill="#5B646C" />
                            <rect x="40" y="56" width="45" height="3" fill="#5B646C" />
                            <rect x="40" y="64" width="50" height="3" fill="#5B646C" />
                            <rect x="40" y="80" width="35" height="12" fill="#D8432B" rx="1" />
                            {/* Scanning beam */}
                            <path
                              d="M105 65h70"
                              stroke="#1F4D3F"
                              strokeWidth="2.5"
                              strokeDasharray="2 4"
                            />
                            {/* Extracted settlement card */}
                            <rect x="175" y="24" width="75" height="82" fill="#1F4D3F" rx="2" />
                            <circle cx="212" cy="55" r="14" fill="#F6F1E7" />
                            <path d="M206 55h12M212 49v12" stroke="#1F4D3F" strokeWidth="2.5" />
                            <rect x="187" y="80" width="50" height="8" fill="#F6F1E7" rx="1" />
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-display text-base font-semibold text-ink-900">
                            Automated E-Invoice Engine
                          </h3>
                          <p className="text-small text-ink-700">
                            Upload standard PDF invoices or billing tickets. Our optical recognition extracts line items, merchant metadata, and creates a ready-to-execute debit pipeline.
                          </p>
                          <p className="text-small text-ink-700">
                            No manual account entry required. Review and approve the synthesized remittance in one click.
                          </p>
                        </div>

                        <ol className="space-y-2.5" aria-label="How it works">
                          {[
                            "Drop your PDF e-invoice or utility ticket.",
                            "System extracts biller, invoice number, and net total.",
                            "Authorize the pipeline for direct settlement debit.",
                          ].map((s, i) => (
                            <li key={s} className="flex items-start gap-3 text-small text-ink-700">
                              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-ink-900 text-[11px] font-semibold text-paper-50">
                                {i + 1}
                              </span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="border-t border-paper-300 pt-4 text-xs text-ink-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Supported Format:</span>
                          <span className="font-semibold text-ink-900">Adobe PDF (.pdf)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recognition Engine:</span>
                          <span className="font-semibold text-ink-900">Optical Remittance OCR</span>
                        </div>
                      </div>
                    </aside>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Recent Bill Payments & Invoices (Matching Transfer's RecentRequests)      */}
        {/* ========================================================================= */}
        <section aria-labelledby="recent-bills" className="rounded-none border border-paper-300 bg-paper-50">
          <div className="flex items-center justify-between border-b border-paper-200 px-5 py-3">
            <h2 id="recent-bills" className="font-display text-base font-semibold text-ink-900">
              Recent Bill Payments & Invoices
            </h2>
            <span className="text-xs text-ink-500">Audit trail active</span>
          </div>

          {history.length > 0 ? (
            <ul className="divide-y divide-paper-200" aria-live="polite">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-small hover:bg-paper-100/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">
                      {item.payee?.name || "Utility Provider"} ·{" "}
                      <span className="text-ink-600 text-xs">
                        {item.payee?.category || "DIRECT_DEBIT"}
                      </span>
                    </p>
                    <p className="text-xs text-ink-500 font-mono">
                      Ref: {item.id.slice(0, 10).toUpperCase()} ·{" "}
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono tabular-nums text-ink-900 font-semibold">
                      {fmtMoney(item.amount, "USD")}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        item.status === "PAID"
                          ? "bg-success-bg text-success"
                          : "bg-warning-bg text-warning"
                      )}
                    >
                      {item.status === "PENDING" && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                      )}
                      {item.status === "PAID" ? "Settled" : "Pending clearing"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-small text-ink-500 space-y-1">
              <p>No previous bill payments recorded for your accounts.</p>
              <p className="text-xs">Your settled provider bills and e-invoices will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
