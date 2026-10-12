"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  PiggyBank,
  Landmark,
  Car,
  Home,
  HandCoins,
  Building,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Lock,
  Printer,
  Calculator,
  TrendingUp,
  Check,
  DollarSign,
  Calendar,
  FileText,
  Info,
  Trash2,
  Plus,
  Percent,
  Wallet,
  AlertCircle,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { fmtMoney } from "@/lib/transfer-forms/validators";
import { toast } from "@/lib/toast";
import {
  createSavingsPlan,
  depositToSavingsPlan,
  deleteSavingsPlan,
  submitLoanApplication,
  type SavingsGoalItem,
  type LoanProduct,
  type LoanApplicationItem,
} from "@/app/actions/savings";

export interface AccountOption {
  id: string;
  name: string;
  accountType: string;
  balance: number;
  currency: string;
  accountNumber: string;
}

interface SavingsClientProps {
  userPreferences: {
    language: string;
    currency: string;
    name: string;
    email: string;
  };
  accounts: AccountOption[];
  initialSavingsGoals: SavingsGoalItem[];
  loanProducts: LoanProduct[];
  creditScore: {
    score: number;
    rating: string;
    change: number;
  };
  initialRecentLoans: LoanApplicationItem[];
  loanPermissions?: {
    enabled: boolean;
    methods: {
      auto: boolean;
      mortgage: boolean;
      personal: boolean;
      heloc: boolean;
      business: boolean;
    };
  };
}

type MainPillar = "savings" | "loans";
type SavingsSubTab = "create-plan" | "active-plans" | "growth-calculator";

export default function SavingsClient({
  userPreferences,
  accounts,
  initialSavingsGoals,
  loanProducts,
  creditScore,
  initialRecentLoans,
  loanPermissions,
}: SavingsClientProps) {
  const router = useRouter();

  const isLoansGloballyEnabled = loanPermissions ? loanPermissions.enabled !== false : true;
  const isLoanProductAllowed = (categoryOrId: string) =>
    isLoansGloballyEnabled &&
    (loanPermissions?.methods ? (loanPermissions.methods as any)[categoryOrId] !== false : true);

  // Primary Pillar: "savings" vs "loans"
  const [activePillar, setActivePillar] = React.useState<MainPillar>("savings");


  // Savings Sub-Tab
  const [savingsTab, setSavingsTab] = React.useState<SavingsSubTab>("create-plan");

  // Account selector
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>(
    accounts[0]?.id || ""
  );
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // ---------------------------------------------------------------------------
  // SECTION 1: Savings State & Handlers
  // ---------------------------------------------------------------------------
  const [savingsGoals, setSavingsGoals] = React.useState<SavingsGoalItem[]>(initialSavingsGoals);
  const [planName, setPlanName] = React.useState("");
  const [planCategory, setPlanCategory] = React.useState("Emergency Reserve");
  const [targetAmount, setTargetAmount] = React.useState("");
  const [targetMonths, setTargetMonths] = React.useState(12);
  const [planTier, setPlanTier] = React.useState<"vault" | "cd" | "treasury">("vault");
  const [initialDeposit, setInitialDeposit] = React.useState("");
  const [autoSaveFreq, setAutoSaveFreq] = React.useState<"none" | "weekly" | "biweekly" | "monthly">("monthly");
  const [isSubmittingPlan, setIsSubmittingPlan] = React.useState(false);
  const [planReceipt, setPlanReceipt] = React.useState<{
    reference: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    tierName: string;
    apy: string;
  } | null>(null);

  // Quick Goal Presets
  const goalPresets = [
    { name: "Emergency Vault Reserve", cat: "Safety Net", target: 20000, months: 12 },
    { name: "Luxury Home Downpayment", cat: "Real Estate", target: 75000, months: 24 },
    { name: "Vintage Automobile Acquisition", cat: "Vehicle", target: 35000, months: 18 },
    { name: "Offshore Family Trust Fund", cat: "Wealth Transfer", target: 100000, months: 36 },
    { name: "Child Higher Education Endowment", cat: "Education", target: 50000, months: 48 },
    { name: "Annual Private Retreat & Travel", cat: "Leisure", target: 15000, months: 6 },
  ];

  // Tier definitions
  const tiers = {
    vault: { name: "High-Yield Vault Reserve", apy: "4.75%", apyNum: 0.0475, desc: "Daily compounded interest with unlimited liquidity & zero lockup." },
    cd: { name: "Guaranteed Certificate of Deposit", apy: "5.25%", apyNum: 0.0525, desc: "Fixed rate guarantee with term lock bonus upon maturity." },
    treasury: { name: "Sovereign Treasury Sweep", apy: "5.10%", apyNum: 0.0510, desc: "Secured by short-term US Treasury bills with state tax exemption." },
  };

  // Quick Amount presets
  const amountPresets = [5000, 15000, 25000, 50000, 100000];

  // Date Calculation
  const calculatedTargetDate = React.useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + targetMonths);
    return d.toISOString().split("T")[0];
  }, [targetMonths]);

  // Projected Monthly Needed & Estimated Interest
  const targetNum = parseFloat(targetAmount) || 0;
  const initNum = parseFloat(initialDeposit) || 0;
  const remainingToSave = Math.max(0, targetNum - initNum);
  const monthlyNeeded = targetMonths > 0 ? remainingToSave / targetMonths : 0;
  const avgBalance = initNum + remainingToSave / 2;
  const estimatedInterest = Math.round(avgBalance * tiers[planTier].apyNum * (targetMonths / 12));

  const handleCreateSavingsPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) {
      toast.error({ title: "Plan name required", description: "Please enter a descriptive name for your savings plan." });
      return;
    }
    if (!targetNum || targetNum <= 0) {
      toast.error({ title: "Invalid target amount", description: "Please enter a target amount greater than $0." });
      return;
    }
    if (initNum > 0 && selectedAccount && initNum > selectedAccount.balance) {
      toast.error({
        title: "Insufficient funds for initial deposit",
        description: `Your selected account has $${selectedAccount.balance.toLocaleString()}.`,
      });
      return;
    }

    setIsSubmittingPlan(true);
    try {
      const res = await createSavingsPlan({
        name: planName,
        targetAmount: targetNum,
        initialDeposit: initNum,
        targetDate: calculatedTargetDate,
        category: planCategory,
        sourceAccountId: selectedAccountId,
        autoSaveFrequency: autoSaveFreq,
        autoSaveAmount: monthlyNeeded,
      });

      if (res.success && res.goal) {
        setSavingsGoals((prev) => [res.goal!, ...prev]);
        setPlanReceipt({
          reference: `SAV-${Date.now().toString().slice(-6)}`,
          name: res.goal.name,
          targetAmount: res.goal.targetAmount,
          currentAmount: res.goal.currentAmount,
          targetDate: new Date(res.goal.targetDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          tierName: tiers[planTier].name,
          apy: tiers[planTier].apy,
        });

        toast.success({
          title: "Savings Plan Established",
          description: `"${res.goal.name}" targeting $${res.goal.targetAmount.toLocaleString()} has been launched.`,
        });
      } else {
        toast.error({ title: "Failed to create plan", description: res.error || "Please verify your parameters." });
      }
    } catch {
      toast.error({ title: "Error", description: "Failed to establish savings plan." });
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  // Quick Deposit into Existing Goal
  const [depositModalGoal, setDepositModalGoal] = React.useState<SavingsGoalItem | null>(null);
  const [quickDepositAmount, setQuickDepositAmount] = React.useState("");
  const [isDepositingGoal, setIsDepositingGoal] = React.useState(false);

  const handleDepositToGoal = async () => {
    if (!depositModalGoal) return;
    const amount = parseFloat(quickDepositAmount);
    if (!amount || amount <= 0) {
      toast.error({ title: "Invalid amount", description: "Please enter an amount to contribute." });
      return;
    }
    if (selectedAccount && amount > selectedAccount.balance) {
      toast.error({ title: "Insufficient funds", description: `Account balance is $${selectedAccount.balance.toLocaleString()}.` });
      return;
    }

    setIsDepositingGoal(true);
    try {
      const res = await depositToSavingsPlan(depositModalGoal.id, amount, selectedAccountId);
      if (res.success && res.newBalance !== undefined) {
        setSavingsGoals((prev) =>
          prev.map((g) => (g.id === depositModalGoal.id ? { ...g, currentAmount: res.newBalance! } : g))
        );
        toast.success({
          title: "Contribution Applied",
          description: `Deposited $${amount.toLocaleString()} into "${depositModalGoal.name}".`,
        });
        setDepositModalGoal(null);
        setQuickDepositAmount("");
      } else {
        toast.error({ title: "Deposit failed", description: res.error || "Please try again." });
      }
    } catch {
      toast.error({ title: "Error", description: "Could not apply contribution." });
    } finally {
      setIsDepositingGoal(false);
    }
  };

  const handleDeleteGoal = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to close and delete the savings plan "${name}"?`)) return;
    const res = await deleteSavingsPlan(id);
    if (res.success) {
      setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success({ title: "Plan Removed", description: `"${name}" has been deleted.` });
    }
  };

  // ---------------------------------------------------------------------------
  // SECTION 2: Loans State & Handlers
  // ---------------------------------------------------------------------------
  const [selectedLoanId, setSelectedLoanId] = React.useState<string>(
    loanProducts[0]?.id || "auto-loan"
  );
  const selectedLoan =
    loanProducts.find((p) => p.id === selectedLoanId) || loanProducts[0];

  const [loanAmount, setLoanAmount] = React.useState<number>(
    selectedLoan ? Math.min(Math.max(selectedLoan.minAmount, 35000), selectedLoan.maxAmount) : 35000
  );
  const [selectedTermMonths, setSelectedTermMonths] = React.useState<number>(
    selectedLoan?.availableTerms[2] || selectedLoan?.availableTerms[0] || 48
  );

  // Sync loan term when switching loan products
  React.useEffect(() => {
    if (selectedLoan) {
      setLoanAmount(Math.min(Math.max(selectedLoan.minAmount, 35000), selectedLoan.maxAmount));
      setSelectedTermMonths(selectedLoan.availableTerms[1] || selectedLoan.availableTerms[0]);
    }
  }, [selectedLoanId]);

  // Amortization calculation
  const monthlyRate = (selectedLoan?.startingApr || 5) / 100 / 12;
  const n = selectedTermMonths;
  const calculatedMonthlyPayment = React.useMemo(() => {
    if (monthlyRate === 0 || n === 0) return loanAmount / n;
    const p = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    return Math.round(p * 100) / 100;
  }, [loanAmount, monthlyRate, n]);

  const totalRepayment = Math.round(calculatedMonthlyPayment * n);
  const totalInterestPaid = Math.max(0, totalRepayment - loanAmount);

  // Loan Application Form State
  const [annualIncome, setAnnualIncome] = React.useState("120000");
  const [employmentStatus, setEmploymentStatus] = React.useState("Full-Time Executive");
  const [loanPurpose, setLoanPurpose] = React.useState("Vehicle acquisition and upgrades");
  const [isSubmittingLoan, setIsSubmittingLoan] = React.useState(false);
  const [recentLoans, setRecentLoans] = React.useState<LoanApplicationItem[]>(initialRecentLoans);
  const [loanApprovalVoucher, setLoanApprovalVoucher] = React.useState<{
    reference: string;
    loanName: string;
    amount: number;
    apr: number;
    termMonths: number;
    monthlyPayment: number;
    disbursementAccount: string;
    status: string;
    date: string;
  } | null>(null);

  const handleSubmitLoanApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const inc = parseFloat(annualIncome);
    if (!inc || inc < 15000) {
      toast.error({ title: "Income verification required", description: "Please enter your verifiable annual gross income." });
      return;
    }

    setIsSubmittingLoan(true);
    try {
      const res = await submitLoanApplication({
        loanType: selectedLoan.id,
        amount: loanAmount,
        termMonths: selectedTermMonths,
        monthlyPayment: calculatedMonthlyPayment,
        purpose: loanPurpose,
        annualIncome: inc,
        employmentStatus,
        targetAccountId: selectedAccountId,
      });

      if (res.success && res.reference) {
        const item: LoanApplicationItem = {
          id: res.reference,
          reference: res.reference,
          loanType: selectedLoan.id,
          loanName: selectedLoan.name,
          amount: loanAmount,
          termMonths: selectedTermMonths,
          monthlyPayment: calculatedMonthlyPayment,
          interestRate: selectedLoan.startingApr,
          status: res.status === "REJECTED" ? "SUBMITTED_FOR_UNDERWRITING" : res.status,
          submittedAt: new Date().toISOString(),
          targetAccount: `${selectedAccount?.accountType} ••••${selectedAccount?.accountNumber.slice(-4)}`,
        };

        setRecentLoans((prev) => [item, ...prev]);
        setLoanApprovalVoucher({
          reference: res.reference,
          loanName: selectedLoan.name,
          amount: loanAmount,
          apr: selectedLoan.startingApr,
          termMonths: selectedTermMonths,
          monthlyPayment: calculatedMonthlyPayment,
          disbursementAccount: `${selectedAccount?.accountType} ••••${selectedAccount?.accountNumber.slice(-4)}`,
          status: res.status,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        });

        toast.success({
          title: "Pre-Approval Issued",
          description: `Your application for ${selectedLoan.shortName} (${res.reference}) has been pre-approved!`,
        });
      } else {
        toast.error({ title: "Application error", description: res.message || "Failed to process application." });
      }
    } catch {
      toast.error({ title: "Submission failed", description: "Please check your network connection and retry." });
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  // Helper for loan icons
  const getLoanIcon = (cat: string) => {
    switch (cat) {
      case "auto":
        return Car;
      case "mortgage":
        return Home;
      case "personal":
        return HandCoins;
      case "heloc":
        return Building;
      case "business":
        return Landmark;
      default:
        return FileText;
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl rounded-sm border border-paper-300 bg-white shadow-sm overflow-hidden animate-fade-in-up">
      {/* Header matching Transfer page */}
      <header className="space-y-3 border-b border-paper-300 bg-paper-100 p-6 sm:p-7">
        <Link
          href="/transfer"
          className="inline-flex items-center gap-1 text-small text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
        >
          <ChevronLeft className="h-4 w-4" /> Transfers & Pay Bills
        </Link>
        <h1 className="font-display text-h2 font-bold text-ink-900">Savings & Loans</h1>
        <p className="max-w-2xl text-body text-ink-700">
          Grow your vault wealth with high-yield automated savings plans, or access competitive pre-approved financing across Auto, Mortgage, Personal, and Home Equity credit lines.
        </p>
      </header>

      {/* Main Container */}
      <div className="p-6 sm:p-8 space-y-8 bg-white">
        {/* Primary Pillar Folder Tabs */}
        <div className="flex flex-col">
          <div
            role="tablist"
            aria-label="Savings and Loans Primary Sections"
            className="flex items-end gap-1 overflow-x-auto scrollbar-hide border-b border-paper-300"
          >
            {[
              {
                id: "savings",
                label: "Savings Products & Plans",
                icon: PiggyBank,
                badge: `${savingsGoals.length} Active`,
              },
              {
                id: "loans",
                label: "Available Loan Facilities",
                icon: Landmark,
                badge: `${loanProducts.length} Available`,
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              const isSelected = activePillar === pillar.id;
              return (
                <button
                  key={pillar.id}
                  id={`tab-${pillar.id}`}
                  role="tab"
                  aria-selected={isSelected}
                  className={cn(
                    "shrink-0 px-6 py-3 rounded-none text-sm transition-all duration-150 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-1 flex items-center gap-2.5 -mb-[1px] cursor-pointer",
                    isSelected
                      ? "bg-white text-ink-900 border border-paper-300 border-b-white font-semibold shadow-xs"
                      : "text-ink-500 hover:text-ink-900 hover:bg-paper-100 border border-transparent border-b-transparent"
                  )}
                  onClick={() => setActivePillar(pillar.id as MainPillar)}
                >
                  <Icon className={cn("h-4 w-4", isSelected ? "text-ink-900" : "text-ink-500")} />
                  <span>{pillar.label}</span>
                  <span
                    className={cn(
                      "text-[11px] px-1.5 py-0.5 rounded-none font-mono uppercase",
                      isSelected
                        ? "bg-paper-100 text-ink-900 border border-paper-300"
                        : "bg-paper-100/60 text-ink-500"
                    )}
                  >
                    {pillar.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ================================================================= */}
          {/* PILLAR 1: SAVINGS                                                 */}
          {/* ================================================================= */}
          {activePillar === "savings" && (
            <div className="pt-6 space-y-6">
              {/* Secondary Sub-Tabs for Savings */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper-200 pb-3">
                <div className="flex items-center gap-2">
                  {[
                    { id: "create-plan", label: "Create Saving Plan", icon: Plus },
                    { id: "active-plans", label: `Active Plans (${savingsGoals.length})`, icon: Wallet },
                    { id: "growth-calculator", label: "Yield Simulator", icon: Calculator },
                  ].map((st) => {
                    const SubIcon = st.icon;
                    const isSubActive = savingsTab === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => setSavingsTab(st.id as SavingsSubTab)}
                        className={cn(
                          "px-3.5 py-1.5 text-xs font-medium rounded-none flex items-center gap-1.5 transition-all cursor-pointer",
                          isSubActive
                            ? "bg-ink-900 text-paper-50 shadow-xs"
                            : "bg-paper-100 text-ink-700 hover:bg-paper-200 border border-paper-300"
                        )}
                      >
                        <SubIcon className="h-3.5 w-3.5" />
                        {st.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-xs text-ink-600 bg-paper-100 border border-paper-300 px-3 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  <span>FDIC Insured up to $2.5M via IntraFi CDARS</span>
                </div>
              </div>

              {/* Sub-view: CREATE SAVING PLAN */}
              {savingsTab === "create-plan" && (
                <div className="grid overflow-hidden rounded-none border border-paper-300 bg-white lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1.1fr)] shadow-sm">
                  {/* Left Column: Plan Creation Form */}
                  <div className="p-5 sm:p-8 space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-ink-900 flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-vintage-gold" />
                        Create a Bespoke Savings Plan
                      </h2>
                      <p className="text-small text-ink-600 mt-1">
                        Define your target capital, maturity horizon, and automated recurring deposits.
                      </p>
                    </div>

                    {!planReceipt ? (
                      <form onSubmit={handleCreateSavingsPlan} className="space-y-6">
                        {/* Quick Goal Presets */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-ink-600">
                            Quick Inspiration Presets
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {goalPresets.map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  setPlanName(preset.name);
                                  setPlanCategory(preset.cat);
                                  setTargetAmount(preset.target.toString());
                                  setTargetMonths(preset.months);
                                }}
                                className="px-2.5 py-1 text-xs border border-paper-300 bg-paper-50 hover:bg-paper-100 text-ink-800 rounded-none transition-colors"
                              >
                                {preset.name} (${preset.target.toLocaleString()})
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Plan Name & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-small font-medium text-ink-900">
                              Savings Plan Name <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              value={planName}
                              onChange={(e) => setPlanName(e.target.value)}
                              placeholder="e.g. Estate Vault Reserve"
                              className="w-full border border-paper-300 bg-white px-3.5 py-2.5 text-small text-ink-900 rounded-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-small font-medium text-ink-900">Plan Category</label>
                            <select
                              value={planCategory}
                              onChange={(e) => setPlanCategory(e.target.value)}
                              className="w-full border border-paper-300 bg-white px-3.5 py-2.5 text-small text-ink-900 rounded-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900"
                            >
                              <option value="Emergency Reserve">Emergency Reserve</option>
                              <option value="Real Estate">Real Estate & Estate Downpayment</option>
                              <option value="Vehicle">Luxury Automobile / Marine</option>
                              <option value="Wealth Transfer">Private Wealth / Trust Fund</option>
                              <option value="Education">Education & Tuition Endowment</option>
                              <option value="Retirement">Retirement Buffer</option>
                              <option value="General Savings">General Wealth Vault</option>
                            </select>
                          </div>
                        </div>

                        {/* Target Amount */}
                        <div className="space-y-2">
                          <label className="text-small font-medium text-ink-900">
                            Target Amount (USD) <span className="text-danger">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 font-semibold">$</span>
                            <input
                              type="number"
                              min="100"
                              step="50"
                              value={targetAmount}
                              onChange={(e) => setTargetAmount(e.target.value)}
                              placeholder="25,000"
                              className="w-full pl-8 pr-4 py-2.5 border border-paper-300 bg-white text-small text-ink-900 font-mono rounded-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900"
                              required
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {amountPresets.map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setTargetAmount(amt.toString())}
                                className="px-2.5 py-1 text-xs border border-paper-300 bg-paper-50 hover:bg-paper-100 text-ink-700 rounded-none"
                              >
                                ${amt.toLocaleString()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Target Completion Horizon */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-small font-medium text-ink-900">Target Time Horizon</label>
                            <span className="text-xs font-mono text-ink-600 font-semibold">
                              {targetMonths} Months (Target: {calculatedTargetDate})
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {[
                              { label: "6 Mo", months: 6 },
                              { label: "1 Year", months: 12 },
                              { label: "2 Years", months: 24 },
                              { label: "3 Years", months: 36 },
                              { label: "5 Years", months: 60 },
                            ].map((dur) => (
                              <button
                                key={dur.months}
                                type="button"
                                onClick={() => setTargetMonths(dur.months)}
                                className={cn(
                                  "py-2 text-xs border font-medium rounded-none transition-all",
                                  targetMonths === dur.months
                                    ? "bg-ink-900 text-paper-50 border-ink-900"
                                    : "bg-paper-50 text-ink-700 border-paper-300 hover:bg-paper-100"
                                )}
                              >
                                {dur.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Plan Product Tier Selection */}
                        <div className="space-y-2">
                          <label className="text-small font-medium text-ink-900">Select Compounding Tier</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {(["vault", "cd", "treasury"] as const).map((tKey) => {
                              const t = tiers[tKey];
                              const isTierSelected = planTier === tKey;
                              return (
                                <div
                                  key={tKey}
                                  onClick={() => setPlanTier(tKey)}
                                  className={cn(
                                    "p-3.5 border cursor-pointer rounded-none transition-all relative flex flex-col justify-between",
                                    isTierSelected
                                      ? "border-ink-900 bg-paper-50 ring-1 ring-ink-900"
                                      : "border-paper-300 bg-white hover:border-paper-400"
                                  )}
                                >
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-bold text-ink-900">{t.name}</span>
                                      {isTierSelected && <Check className="w-3.5 h-3.5 text-ink-900" />}
                                    </div>
                                    <div className="text-lg font-bold font-display text-vintage-gold">{t.apy} <span className="text-xs font-normal text-ink-500">APY</span></div>
                                    <p className="text-[11px] text-ink-600 mt-1 leading-snug">{t.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Funding Account & Initial Deposit */}
                        <div className="border border-paper-300 bg-paper-50 p-4 space-y-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-ink-700">
                            <Wallet className="w-4 h-4 text-ink-900" />
                            Funding Vault & Automated Debit
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-ink-800">Source Funding Account</label>
                              <select
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                className="w-full border border-paper-300 bg-white px-3 py-2 text-xs text-ink-900 rounded-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900"
                              >
                                {accounts.map((acc) => (
                                  <option key={acc.id} value={acc.id}>
                                    {acc.name} (••••{acc.accountNumber.slice(-4)}) — ${acc.balance.toLocaleString()}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-ink-800">Initial Funding Deposit ($)</label>
                              <input
                                type="number"
                                min="0"
                                value={initialDeposit}
                                onChange={(e) => setInitialDeposit(e.target.value)}
                                placeholder="0.00 (Optional)"
                                className="w-full border border-paper-300 bg-white px-3 py-2 text-xs text-ink-900 rounded-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-ink-800">Automated Recurring Contribution</label>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { id: "none", label: "Manual" },
                                { id: "weekly", label: "Weekly" },
                                { id: "biweekly", label: "Bi-Weekly" },
                                { id: "monthly", label: "Monthly" },
                              ].map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => setAutoSaveFreq(f.id as any)}
                                  className={cn(
                                    "py-1.5 text-xs border rounded-none transition-all",
                                    autoSaveFreq === f.id
                                      ? "bg-ink-900 text-paper-50 border-ink-900 font-semibold"
                                      : "bg-white text-ink-700 border-paper-300 hover:bg-paper-100"
                                  )}
                                >
                                  {f.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Projected Growth Calculator Preview Card */}
                        {targetNum > 0 && (
                          <div className="border border-paper-300 bg-paper-100 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-vintage-gold" />
                                Growth & Contribution Forecast
                              </span>
                              <span className="text-xs font-mono font-semibold text-vintage-gold">
                                Yield: {tiers[planTier].apy} APY
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div className="bg-white p-2.5 border border-paper-200">
                                <div className="text-[10px] uppercase font-semibold text-ink-500">Monthly Contribution</div>
                                <div className="text-sm font-bold font-mono text-ink-900 mt-0.5">
                                  ${Math.round(monthlyNeeded).toLocaleString()}
                                </div>
                              </div>
                              <div className="bg-white p-2.5 border border-paper-200">
                                <div className="text-[10px] uppercase font-semibold text-ink-500">Estimated Yield</div>
                                <div className="text-sm font-bold font-mono text-success mt-0.5">
                                  +${estimatedInterest.toLocaleString()}
                                </div>
                              </div>
                              <div className="bg-white p-2.5 border border-paper-200">
                                <div className="text-[10px] uppercase font-semibold text-ink-500">Target Capital</div>
                                <div className="text-sm font-bold font-mono text-ink-900 mt-0.5">
                                  ${targetNum.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={isSubmittingPlan}
                          className="w-full h-12 bg-ink-900 text-paper-50 hover:bg-black rounded-none text-small font-semibold tracking-wide"
                        >
                          {isSubmittingPlan ? (
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 animate-spin" /> Establishing Plan...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Establish Savings Plan <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </form>
                    ) : (
                      /* Success Receipt Card */
                      <div className="border border-paper-300 bg-paper-50 p-6 space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-none bg-success/10 border border-success/30 flex items-center justify-center text-success">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-display text-lg font-bold text-ink-900">Savings Plan Established</h3>
                            <p className="text-xs text-ink-500 font-mono">Reference: {planReceipt.reference}</p>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-b border-paper-200 py-4 text-xs">
                          <div className="flex justify-between">
                            <span className="text-ink-500">Plan Title:</span>
                            <span className="font-semibold text-ink-900">{planReceipt.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Target Capital:</span>
                            <span className="font-mono font-bold text-ink-900">${planReceipt.targetAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Starting Balance:</span>
                            <span className="font-mono text-ink-900">${planReceipt.currentAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Compounding Tier:</span>
                            <span className="font-semibold text-ink-900">{planReceipt.tierName} ({planReceipt.apy} APY)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Target Completion:</span>
                            <span className="font-semibold text-ink-900">{planReceipt.targetDate}</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="rounded-none flex-1"
                            onClick={() => window.print()}
                          >
                            <Printer className="w-4 h-4 mr-1.5" /> Print Certificate
                          </Button>
                          <Button
                            className="rounded-none flex-1 bg-ink-900 text-paper-50 hover:bg-black"
                            onClick={() => {
                              setPlanReceipt(null);
                              setSavingsTab("active-plans");
                            }}
                          >
                            View Active Plans
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Savings InfoPanel */}
                  <aside
                    aria-label="About Savings Plans"
                    className="space-y-6 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                  >
                    <div className="space-y-5">
                      {/* Bespoke Heritage Savings Illustration */}
                      <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                        <svg viewBox="0 0 280 130" className="h-auto w-full" role="img" aria-label="Savings Illustration">
                          <rect width="280" height="130" fill="#FBF9F4" />
                          {/* Vault Safe */}
                          <rect x="35" y="25" width="90" height="85" fill="#14181F" rx="3" />
                          <circle cx="80" cy="67" r="24" fill="none" stroke="#B8893B" strokeWidth="3" />
                          <circle cx="80" cy="67" r="8" fill="#B8893B" />
                          <line x1="80" y1="43" x2="80" y2="91" stroke="#F6F1E7" strokeWidth="2" />
                          <line x1="56" y1="67" x2="104" y2="67" stroke="#F6F1E7" strokeWidth="2" />
                          {/* Upward Growth Graph */}
                          <path d="M145 105 L170 85 L200 90 L230 55 L255 35" fill="none" stroke="#D8432B" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="255" cy="35" r="5" fill="#D8432B" />
                          {/* Gold coin stacks */}
                          <rect x="150" y="88" width="22" height="6" fill="#B8893B" rx="2" />
                          <rect x="150" y="80" width="22" height="6" fill="#B8893B" rx="2" />
                          <rect x="150" y="72" width="22" height="6" fill="#B8893B" rx="2" />
                          <rect x="190" y="65" width="22" height="6" fill="#B8893B" rx="2" />
                          <rect x="190" y="57" width="22" height="6" fill="#B8893B" rx="2" />
                        </svg>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-display text-base font-semibold text-ink-900">
                          Heritage Compounding Protocol
                        </h3>
                        <p className="text-small text-ink-700 leading-relaxed">
                          Your assets compound on a daily accrual schedule. Structured deposits are shielded within FDIC-insured custodian vaults up to $2,500,000 via reciprocal depository networks.
                        </p>
                      </div>

                      <div className="border border-paper-300 bg-white p-3.5 space-y-2 text-xs">
                        <div className="font-semibold text-ink-900 uppercase tracking-wider text-[11px]">
                          Key Plan Parameters
                        </div>
                        <div className="flex justify-between border-b border-paper-100 pb-1">
                          <span className="text-ink-600">Compounding Frequency:</span>
                          <span className="font-mono font-medium text-ink-900">Daily Accrual / Monthly Credit</span>
                        </div>
                        <div className="flex justify-between border-b border-paper-100 pb-1">
                          <span className="text-ink-600">Early Liquidity Access:</span>
                          <span className="font-medium text-ink-900">100% Free on Vault Tiers</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-600">Maintenance Fees:</span>
                          <span className="font-bold text-success">$0.00 / Zero Fee</span>
                        </div>
                      </div>

                      <ol className="space-y-2.5" aria-label="Savings steps">
                        {[
                          "Configure your capital goal and designated timeline.",
                          "Select High-Yield Vault, CD, or Treasury sweep.",
                          "Automate transfers to ensure compound growth.",
                          "Reinvest or disburse funds seamlessly upon maturity.",
                        ].map((s, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-small text-ink-700">
                            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-ink-900 text-[11px] font-semibold text-paper-50 font-mono">
                              {idx + 1}
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="pt-4 border-t border-paper-300 text-xs text-ink-500">
                      Heritage Trust Depository Member FDIC. IntraFi Intra-Depository Program terms apply.
                    </div>
                  </aside>
                </div>
              )}

              {/* Sub-view: ACTIVE PLANS */}
              {savingsTab === "active-plans" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-display text-lg font-bold text-ink-900">Active Savings Goals & Plans</h2>
                      <p className="text-xs text-ink-600">Track progress and apply instant top-up contributions.</p>
                    </div>
                    <Button
                      onClick={() => setSavingsTab("create-plan")}
                      className="rounded-none bg-ink-900 text-paper-50 hover:bg-black text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> New Plan
                    </Button>
                  </div>

                  {savingsGoals.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-paper-300 bg-paper-50 p-8 space-y-3">
                      <PiggyBank className="w-10 h-10 text-ink-400 mx-auto" />
                      <h3 className="font-semibold text-ink-800">No active savings plans found</h3>
                      <p className="text-xs text-ink-500 max-w-sm mx-auto">
                        Establish your first savings goal to begin earning daily compounded interest.
                      </p>
                      <Button
                        onClick={() => setSavingsTab("create-plan")}
                        className="rounded-none bg-ink-900 text-paper-50 text-xs"
                      >
                        Create Your First Plan
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {savingsGoals.map((goal) => {
                        const progress = Math.min(
                          100,
                          Math.round((goal.currentAmount / goal.targetAmount) * 100)
                        );
                        const daysRemaining = Math.max(
                          0,
                          Math.ceil(
                            (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                          )
                        );

                        return (
                          <div
                            key={goal.id}
                            className="border border-paper-300 bg-white p-5 rounded-none shadow-xs space-y-4 hover:border-paper-400 transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold bg-paper-100 border border-paper-200 px-2 py-0.5 text-ink-700">
                                    {goal.category || "Vault Reserve"}
                                  </span>
                                  <h3 className="font-display text-base font-bold text-ink-900 mt-2">
                                    {goal.name}
                                  </h3>
                                </div>
                                <button
                                  onClick={() => handleDeleteGoal(goal.id, goal.name)}
                                  className="text-ink-400 hover:text-danger p-1 transition-colors"
                                  title="Delete Plan"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Progress bar */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="font-mono font-bold text-ink-900">
                                    ${goal.currentAmount.toLocaleString()}
                                  </span>
                                  <span className="text-ink-500">
                                    Target: ${goal.targetAmount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="w-full bg-paper-200 h-2 rounded-none overflow-hidden">
                                  <div
                                    className="bg-ink-900 h-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[11px] text-ink-500 font-mono">
                                  <span>{progress}% funded</span>
                                  <span>{daysRemaining} days remaining</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-paper-200 flex items-center justify-between gap-2">
                              <span className="text-[11px] text-ink-600 font-mono">
                                Due: {new Date(goal.targetDate).toLocaleDateString()}
                              </span>
                              <Button
                                size="small"
                                variant="outline"
                                onClick={() => setDepositModalGoal(goal)}
                                className="rounded-none text-xs border-paper-300 hover:bg-paper-100"
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" /> Add Funds
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Funds Modal */}
                  {depositModalGoal && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-white border border-paper-300 p-6 max-w-md w-full space-y-4 rounded-none shadow-xl animate-scale-in">
                        <div className="flex justify-between items-center border-b border-paper-200 pb-3">
                          <h3 className="font-display font-bold text-ink-900 text-base">
                            Contribute to "{depositModalGoal.name}"
                          </h3>
                          <button
                            onClick={() => setDepositModalGoal(null)}
                            className="text-ink-500 hover:text-ink-900 text-sm font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div className="text-xs text-ink-600">
                            Current balance: ${depositModalGoal.currentAmount.toLocaleString()} / Target: ${depositModalGoal.targetAmount.toLocaleString()}
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-ink-800">Source Account</label>
                            <select
                              value={selectedAccountId}
                              onChange={(e) => setSelectedAccountId(e.target.value)}
                              className="w-full border border-paper-300 bg-white p-2 text-xs rounded-none"
                            >
                              {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name} — ${a.balance.toLocaleString()}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-ink-800">Deposit Amount ($)</label>
                            <input
                              type="number"
                              min="1"
                              value={quickDepositAmount}
                              onChange={(e) => setQuickDepositAmount(e.target.value)}
                              placeholder="e.g. 500"
                              className="w-full border border-paper-300 p-2 text-small font-mono rounded-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setDepositModalGoal(null)}
                            className="flex-1 rounded-none text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleDepositToGoal}
                            disabled={isDepositingGoal}
                            className="flex-1 rounded-none bg-ink-900 text-paper-50 hover:bg-black text-xs"
                          >
                            {isDepositingGoal ? "Processing..." : "Transfer Funds"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-view: YIELD CALCULATOR */}
              {savingsTab === "growth-calculator" && (
                <div className="border border-paper-300 bg-white p-6 space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-vintage-gold" />
                      Interactive Compound Wealth Simulator
                    </h2>
                    <p className="text-xs text-ink-600">
                      Simulate long-term returns across Heritage High-Yield Vault (4.75%) and CD accounts (5.25%).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-paper-200 bg-paper-50 p-4 space-y-3">
                      <div className="text-xs uppercase font-bold text-ink-700">1 Year Projection</div>
                      <div className="text-2xl font-display font-bold text-ink-900">
                        ${Math.round(25000 * Math.pow(1 + 0.0475 / 12, 12)).toLocaleString()}
                      </div>
                      <p className="text-xs text-success font-semibold">+$1,187 in interest on $25k</p>
                    </div>

                    <div className="border border-paper-200 bg-paper-50 p-4 space-y-3">
                      <div className="text-xs uppercase font-bold text-ink-700">3 Year Projection</div>
                      <div className="text-2xl font-display font-bold text-ink-900">
                        ${Math.round(50000 * Math.pow(1 + 0.0475 / 12, 36)).toLocaleString()}
                      </div>
                      <p className="text-xs text-success font-semibold">+$7,705 in interest on $50k</p>
                    </div>

                    <div className="border border-paper-200 bg-paper-50 p-4 space-y-3">
                      <div className="text-xs uppercase font-bold text-ink-700">5 Year CD Term</div>
                      <div className="text-2xl font-display font-bold text-ink-900">
                        ${Math.round(100000 * Math.pow(1 + 0.0525 / 12, 60)).toLocaleString()}
                      </div>
                      <p className="text-xs text-success font-semibold">+$29,918 in interest on $100k</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* PILLAR 2: AVAILABLE LOANS                                         */}
          {/* ================================================================= */}
          {activePillar === "loans" && (
            <div className="pt-6 space-y-6">
              {!isLoansGloballyEnabled && (
                <div className="p-4 rounded-none border border-amber-300 bg-amber-50 text-amber-950 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Lending Facilities Restricted</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Institutional credit and loan application facilities are temporarily disabled for your account profile. Please contact your private banking officer for facility reviews or credit limit overrides.
                    </p>
                  </div>
                </div>
              )}

              {/* Credit Rating Tier Badge Banner */}
              <div className="border border-paper-300 bg-paper-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ink-900 text-paper-50 flex items-center justify-center font-bold font-mono text-sm">
                    {creditScore.score}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-ink-500">Your Credit Assessment</div>
                    <div className="text-sm font-bold text-ink-900 flex items-center gap-2">
                      <span>{creditScore.rating} Standing</span>
                      <span className="text-xs font-mono text-success bg-white border border-paper-300 px-1.5 py-0.2">
                        +{creditScore.change} pts this quarter
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-ink-600 max-w-md">
                  Your Tier 1 profile qualifies you for our lowest prime institutional interest rates across all lending facilities.
                </div>
              </div>

              {/* Loan Products Catalog Grid */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="font-display text-lg font-bold text-ink-900">
                    Available Loan Programs for You
                  </h2>
                  <span className="text-xs text-ink-500 font-mono">
                    Select a program to calculate rates & request pre-approval
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {loanProducts.map((p) => {
                    const Icon = getLoanIcon(p.category);
                    const isSelected = selectedLoanId === p.id;
                    const isProductAllowed = isLoanProductAllowed(p.category || p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedLoanId(p.id)}
                        className={cn(
                          "p-4 border rounded-none cursor-pointer transition-all flex flex-col justify-between",
                          isSelected
                            ? "border-ink-900 bg-white ring-2 ring-ink-900 shadow-sm"
                            : "border-paper-300 bg-paper-50 hover:border-paper-400 hover:bg-white",
                          !isProductAllowed && "opacity-75"
                        )}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className={cn("p-2 rounded-none", isSelected ? "bg-ink-900 text-paper-50" : "bg-paper-200 text-ink-800")}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {isProductAllowed ? (
                              <span className="text-[10px] font-bold font-mono text-vintage-gold uppercase">
                                {p.aprDisplay.split(" ")[1]} APR
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] bg-paper-200 text-ink-600 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">
                                <Lock className="w-2.5 h-2.5" /> Locked
                              </span>
                            )}
                          </div>

                          <h3 className="font-display text-sm font-bold text-ink-900 line-clamp-1">
                            {p.shortName}
                          </h3>
                          <p className="text-[11px] text-ink-600 mt-1 line-clamp-2">
                            {p.headline}
                          </p>
                        </div>


                        <div className="mt-3 pt-2 border-t border-paper-200 text-[11px] flex justify-between text-ink-500">
                          <span>Limit:</span>
                          <span className="font-semibold text-ink-900 font-mono">
                            ${(p.maxAmount / 1000).toFixed(0)}k Max
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Master Split View: Selected Loan Calculator & Pre-Approval vs InfoPanel */}
              <div className="grid overflow-hidden rounded-none border border-paper-300 bg-white lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1.1fr)] shadow-sm">
                {/* Left Column: Loan Engine & Application */}
                <div className="p-5 sm:p-8 space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono tracking-wider font-semibold bg-paper-100 border border-paper-200 px-2 py-0.5 text-ink-700">
                        {selectedLoan.category.toUpperCase()} CREDIT FACILITY
                      </span>
                      <span className="text-xs font-semibold text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pre-Qualified
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-ink-900 mt-2">
                      {selectedLoan.name}
                    </h2>
                    <p className="text-small text-ink-600 mt-1">
                      {selectedLoan.description}
                    </p>
                  </div>

                  {/* Highlights and Requirements Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-paper-200 bg-paper-50 p-3.5">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-ink-600">Key Highlights</span>
                      <ul className="space-y-1 text-xs text-ink-800">
                        {selectedLoan.highlights.slice(0, 2).map((h, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-success shrink-0" />
                            <span className="truncate">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-ink-600">Terms & Collateral</span>
                      <div className="text-xs text-ink-800 space-y-0.5">
                        <div><strong className="text-ink-600">Collateral:</strong> {selectedLoan.collateral}</div>
                        <div><strong className="text-ink-600">Fees:</strong> {selectedLoan.originationFee}</div>
                      </div>
                    </div>
                  </div>

                  {!loanApprovalVoucher ? (
                    <div className="space-y-6">
                      {/* Interactive Amortization Calculator */}
                      <div className="border border-paper-300 p-5 space-y-5 bg-paper-50/50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                            <Calculator className="w-4 h-4 text-vintage-gold" />
                            Interactive Payment Calculator
                          </h3>
                          <span className="text-xs font-mono font-bold text-vintage-gold">
                            Fixed {selectedLoan.startingApr}% APR
                          </span>
                        </div>

                        {/* Amount Slider & Numeric Input */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-small font-medium text-ink-900">
                              Borrowing Amount (USD)
                            </label>
                            <span className="text-sm font-bold font-mono text-ink-900">
                              ${loanAmount.toLocaleString()}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={selectedLoan.minAmount}
                            max={selectedLoan.maxAmount}
                            step={1000}
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                            className="w-full accent-ink-900 cursor-pointer"
                          />
                          <div className="flex justify-between text-[11px] font-mono text-ink-500">
                            <span>Min: ${selectedLoan.minAmount.toLocaleString()}</span>
                            <span>Max: ${selectedLoan.maxAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Term Selector */}
                        <div className="space-y-2">
                          <label className="text-small font-medium text-ink-900">Repayment Term</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedLoan.availableTerms.map((term) => (
                              <button
                                key={term}
                                type="button"
                                onClick={() => setSelectedTermMonths(term)}
                                className={cn(
                                  "px-3.5 py-1.5 text-xs font-mono font-semibold rounded-none border transition-all",
                                  selectedTermMonths === term
                                    ? "bg-ink-900 text-paper-50 border-ink-900"
                                    : "bg-white text-ink-700 border-paper-300 hover:bg-paper-100"
                                )}
                              >
                                {term >= 12 ? `${term / 12} Yrs (${term} Mo)` : `${term} Months`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Calculator Output Card */}
                        <div className="grid grid-cols-3 gap-3 border border-paper-300 bg-white p-3.5 text-center">
                          <div>
                            <div className="text-[10px] uppercase font-semibold text-ink-500">Monthly Payment</div>
                            <div className="text-base font-bold font-mono text-ink-900 mt-0.5">
                              ${calculatedMonthlyPayment.toLocaleString()}/mo
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-semibold text-ink-500">Total Interest</div>
                            <div className="text-base font-bold font-mono text-ink-700 mt-0.5">
                              ${totalInterestPaid.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-semibold text-ink-500">Total Loan Cost</div>
                            <div className="text-base font-bold font-mono text-ink-900 mt-0.5">
                              ${totalRepayment.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fast Pre-Approval Application Form */}
                      <form onSubmit={handleSubmitLoanApp} className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-900">
                          <Lock className="w-3.5 h-3.5 text-ink-900" />
                          Pre-Approval Request Details
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-ink-800">
                              Applicant Legal Name
                            </label>
                            <input
                              type="text"
                              value={userPreferences.name}
                              disabled
                              className="w-full border border-paper-300 bg-paper-100 px-3 py-2 text-xs text-ink-900 rounded-none cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-ink-800">
                              Annual Gross Income ($) <span className="text-danger">*</span>
                            </label>
                            <input
                              type="number"
                              min="20000"
                              value={annualIncome}
                              onChange={(e) => setAnnualIncome(e.target.value)}
                              placeholder="120000"
                              className="w-full border border-paper-300 bg-white px-3 py-2 text-xs text-ink-900 rounded-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-ink-800">Employment Status</label>
                            <select
                              value={employmentStatus}
                              onChange={(e) => setEmploymentStatus(e.target.value)}
                              className="w-full border border-paper-300 bg-white px-3 py-2 text-xs text-ink-900 rounded-none focus:border-ink-900"
                            >
                              <option value="Full-Time Executive">Full-Time Executive / Salaried</option>
                              <option value="Self-Employed">Self-Employed / Business Owner</option>
                              <option value="Investment Wealth">Family Office / Private Investments</option>
                              <option value="Retired">Retired / Sovereign Wealth</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-ink-800">Disbursement Vault Account</label>
                            <select
                              value={selectedAccountId}
                              onChange={(e) => setSelectedAccountId(e.target.value)}
                              className="w-full border border-paper-300 bg-white px-3 py-2 text-xs text-ink-900 rounded-none focus:border-ink-900"
                            >
                              {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name} (••••{a.accountNumber.slice(-4)})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-ink-800">Loan Purpose / Asset Notes</label>
                          <input
                            type="text"
                            value={loanPurpose}
                            onChange={(e) => setLoanPurpose(e.target.value)}
                            placeholder="e.g. Vehicle acquisition, luxury estate refinance, business inventory"
                            className="w-full border border-paper-300 bg-white px-3 py-2 text-xs text-ink-900 rounded-none focus:border-ink-900"
                          />
                        </div>

                        {(!isLoansGloballyEnabled || !isLoanProductAllowed(selectedLoan.category || selectedLoan.id)) ? (
                          <div className="p-3 border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>This lending facility is currently restricted for your account profile by administration.</span>
                          </div>
                        ) : null}

                        <Button
                          type="submit"
                          disabled={isSubmittingLoan || !isLoansGloballyEnabled || !isLoanProductAllowed(selectedLoan.category || selectedLoan.id)}
                          className="w-full h-12 bg-ink-900 text-paper-50 hover:bg-black rounded-none text-small font-semibold tracking-wide disabled:opacity-50"
                        >
                          {isSubmittingLoan ? (
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 animate-spin" /> Evaluating Pre-Approval...
                            </span>
                          ) : !isLoansGloballyEnabled || !isLoanProductAllowed(selectedLoan.category || selectedLoan.id) ? (
                            <span className="flex items-center gap-2">
                              <Lock className="w-4 h-4" /> Facility Restricted by Banker
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Request Instant Pre-Approval for ${loanAmount.toLocaleString()}{" "}
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </form>
                    </div>
                  ) : (
                    /* Loan Pre-Approval Voucher Card */
                    <div className="border border-paper-300 bg-paper-50 p-6 space-y-6 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-none bg-success/10 border border-success/30 flex items-center justify-center text-success">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-ink-900">
                            Institutional Loan Pre-Approval Issued
                          </h3>
                          <p className="text-xs text-ink-500 font-mono">Reference ID: {loanApprovalVoucher.reference}</p>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-b border-paper-200 py-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-ink-500">Facility Type:</span>
                          <span className="font-semibold text-ink-900">{loanApprovalVoucher.loanName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">Approved Borrowing Power:</span>
                          <span className="font-mono font-bold text-ink-900">${loanApprovalVoucher.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">Fixed Rate (APR):</span>
                          <span className="font-mono font-semibold text-vintage-gold">{loanApprovalVoucher.apr}% Fixed APR</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">Monthly Installment:</span>
                          <span className="font-mono font-semibold text-ink-900">${loanApprovalVoucher.monthlyPayment.toLocaleString()}/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">Term Length:</span>
                          <span className="font-semibold text-ink-900">{loanApprovalVoucher.termMonths} Months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">Disbursement Account:</span>
                          <span className="font-semibold text-ink-900">{loanApprovalVoucher.disbursementAccount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-500">Approval Date:</span>
                          <span className="font-semibold text-ink-900">{loanApprovalVoucher.date}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="rounded-none flex-1"
                          onClick={() => window.print()}
                        >
                          <Printer className="w-4 h-4 mr-1.5" /> Print Pre-Approval Certificate
                        </Button>
                        <Button
                          className="rounded-none flex-1 bg-ink-900 text-paper-50 hover:bg-black"
                          onClick={() => setLoanApprovalVoucher(null)}
                        >
                          Configure Another Loan
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Loan InfoPanel */}
                <aside
                  aria-label="About Loan Programs"
                  className="space-y-6 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                >
                  <div className="space-y-5">
                    {/* Bespoke Heritage Loan Art */}
                    <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                      <svg viewBox="0 0 280 130" className="h-auto w-full" role="img" aria-label="Bank Facade & Lending Art">
                        <rect width="280" height="130" fill="#FBF9F4" />
                        {/* Classical Bank Pediment */}
                        <path d="M40 55 L95 28 L150 55 Z" fill="#14181F" />
                        <rect x="45" y="55" width="100" height="8" fill="#2E353B" />
                        {/* Columns */}
                        <rect x="52" y="63" width="10" height="42" fill="#14181F" />
                        <rect x="76" y="63" width="10" height="42" fill="#14181F" />
                        <rect x="102" y="63" width="10" height="42" fill="#14181F" />
                        <rect x="126" y="63" width="10" height="42" fill="#14181F" />
                        {/* Base */}
                        <rect x="40" y="105" width="110" height="8" fill="#14181F" />
                        {/* Promissory document & seal */}
                        <rect x="175" y="32" width="70" height="82" fill="#FFFFFF" stroke="#B8893B" strokeWidth="2" />
                        <line x1="185" y1="48" x2="235" y2="48" stroke="#14181F" strokeWidth="2" />
                        <line x1="185" y1="60" x2="235" y2="60" stroke="#14181F" strokeWidth="2" />
                        <line x1="185" y1="72" x2="220" y2="72" stroke="#14181F" strokeWidth="2" />
                        <circle cx="218" cy="90" r="10" fill="#D8432B" />
                        <circle cx="218" cy="90" r="7" fill="none" stroke="#F6F1E7" strokeWidth="1" />
                      </svg>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-display text-base font-semibold text-ink-900">
                        Heritage Lending Philosophy
                      </h3>
                      <p className="text-small text-ink-700 leading-relaxed">
                        Tailored credit facilities designed for rapid execution and flexible liquidity. Every loan program benefits from fixed rate guarantees, zero prepayment penalties, and automated vault debt service.
                      </p>
                    </div>

                    <div className="border border-paper-300 bg-white p-3.5 space-y-2 text-xs">
                      <div className="font-semibold text-ink-900 uppercase tracking-wider text-[11px]">
                        Lending Disclosures
                      </div>
                      <div className="flex justify-between border-b border-paper-100 pb-1">
                        <span className="text-ink-600">Origination Fee:</span>
                        <span className="font-bold text-success">$0.00 / Zero Fee</span>
                      </div>
                      <div className="flex justify-between border-b border-paper-100 pb-1">
                        <span className="text-ink-600">Prepayment Penalties:</span>
                        <span className="font-medium text-ink-900">None ($0 penalty)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-600">Disbursement Speed:</span>
                        <span className="font-semibold text-ink-900">24–48 Business Hours</span>
                      </div>
                    </div>

                    <ol className="space-y-2.5" aria-label="Lending process">
                      {[
                        "Select your preferred loan program and customize amount.",
                        "Instant soft credit check with zero score impact.",
                        "Receive guaranteed rate pre-approval reference.",
                        "Funds disbursed directly into your selected vault.",
                      ].map((s, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-small text-ink-700">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-ink-900 text-[11px] font-semibold text-paper-50 font-mono">
                            {idx + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-4 border-t border-paper-300 text-xs text-ink-500">
                    Heritage Trust Bank N.A. Equal Housing Lender. Subject to standard credit underwriting.
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* LOWER SECTION: Recent Applications & Inflows Audit Trail          */}
        {/* ================================================================= */}
        <section className="space-y-4 pt-4 border-t border-paper-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">
                {activePillar === "savings" ? "Savings Plans Ledger" : "Recent Loan Inquiries & Pre-Approvals"}
              </h2>
              <p className="text-small text-ink-600">
                {activePillar === "savings"
                  ? "Audit record of established savings goals, targets, and cumulative balances."
                  : "Track credit facilities requested, approval statuses, and disbursement coordinates."}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-paper-300 bg-white shadow-xs">
            {activePillar === "savings" ? (
              <table className="w-full text-left text-small">
                <thead className="border-b border-paper-300 bg-paper-100 text-[11px] uppercase tracking-wider text-ink-600 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Plan Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Current Balance</th>
                    <th className="px-5 py-3">Target Goal</th>
                    <th className="px-5 py-3">Maturity Date</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200">
                  {savingsGoals.map((g) => (
                    <tr key={g.id} className="hover:bg-paper-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-ink-900">{g.name}</td>
                      <td className="px-5 py-3.5 text-ink-600">{g.category || "Vault Reserve"}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-ink-900">${g.currentAmount.toLocaleString()}</td>
                      <td className="px-5 py-3.5 font-mono text-ink-700">${g.targetAmount.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-ink-600">{new Date(g.targetDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-success/10 text-success border border-success/30">
                          Active Earning
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-small">
                <thead className="border-b border-paper-300 bg-paper-100 text-[11px] uppercase tracking-wider text-ink-600 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Facility</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Rate</th>
                    <th className="px-5 py-3">Monthly</th>
                    <th className="px-5 py-3">Disbursement Target</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200">
                  {recentLoans.map((l) => (
                    <tr key={l.id} className="hover:bg-paper-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink-900">{l.reference}</td>
                      <td className="px-5 py-3.5 font-medium text-ink-900">{l.loanName}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-ink-900">${l.amount.toLocaleString()}</td>
                      <td className="px-5 py-3.5 font-mono text-vintage-gold">{l.interestRate}% APR</td>
                      <td className="px-5 py-3.5 font-mono text-ink-700">${l.monthlyPayment.toLocaleString()}/mo</td>
                      <td className="px-5 py-3.5 text-xs text-ink-600">{l.targetAccount}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-success/10 text-success border border-success/30">
                          {l.status === "PRE_APPROVED" ? "Pre-Approved" : l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
