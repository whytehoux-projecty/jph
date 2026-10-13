"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { SelectorCard } from "@/components/ui/SelectorCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Landmark,
  PiggyBank,
  Wallet,
  TrendingUp,
  Globe2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Lock,
  Layers,
  Sparkles,
  ArrowRightLeft,
  Info,
} from "lucide-react";
import {
  VAULT_TYPES,
  type VaultType,
  normalizeVaultType,
  determinePrimaryStatus,
} from "@/lib/vault-rules";
import {
  openNewVault,
  linkExternalVault,
  requestAccountSwap,
  type OpenNewVaultInput,
  type LinkExternalVaultInput,
  type RequestAccountSwapInput,
} from "@/app/actions/accounts";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<VaultType, any> = {
  SAVINGS: PiggyBank,
  CURRENT: Landmark,
  DCA: Wallet,
  INVESTMENT: TrendingUp,
  OFFSHORE: Globe2,
};

// =============================================================================
// 1. OPEN NEW INTERNAL VAULT DIALOG
// =============================================================================

interface OpenAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts?: Array<{ id: string; accountType: string; accountNumber: string; balance: number }>;
  onSuccess?: () => void;
}

export function OpenAccountDialog({
  isOpen,
  onClose,
  existingAccounts = [],
  onSuccess,
}: OpenAccountDialogProps) {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = React.useState<VaultType | null>(null);
  const [currency, setCurrency] = React.useState("USD");
  const [initialDeposit, setInitialDeposit] = React.useState<string>("0");
  const [fundingAccountId, setFundingAccountId] = React.useState<string>("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [createdResult, setCreatedResult] = React.useState<any>(null);

  const heldNormalized = React.useMemo(() => {
    return existingAccounts.map((a) => normalizeVaultType(a.accountType));
  }, [existingAccounts]);

  const activeDef = selectedType ? VAULT_TYPES[selectedType] : null;

  // Calculate Primary status based on single source of truth rules
  const willBePrimary = React.useMemo(() => {
    if (!selectedType) return false;
    return determinePrimaryStatus(existingAccounts.length, selectedType);
  }, [existingAccounts.length, selectedType]);

  const handleReset = () => {
    setStep(1);
    setSelectedType(null);
    setCurrency("USD");
    setInitialDeposit("0");
    setFundingAccountId("");
    setNotes("");
    setLoading(false);
    setCreatedResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleProceedToConfig = () => {
    if (!selectedType) return;
    if (heldNormalized.includes(selectedType)) {
      toast.error({
        title: "Vault Type Already Active",
        description: `You already hold a ${VAULT_TYPES[selectedType].label}. You cannot hold more than one vault of the same type.`,
      });
      return;
    }
    setStep(2);
  };

  const handleProceedToReview = () => {
    const depositNum = parseFloat(initialDeposit) || 0;
    if (depositNum < 0) {
      toast.error({ title: "Invalid Amount", description: "Deposit amount cannot be negative." });
      return;
    }
    if (depositNum > 0 && !fundingAccountId && existingAccounts.length > 0) {
      toast.error({ title: "Source Account Required", description: "Please select a funding account for initial deposit." });
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      const res = await openNewVault({
        vaultType: selectedType,
        currency,
        initialDeposit: parseFloat(initialDeposit) || 0,
        fundingAccountId: fundingAccountId || undefined,
        notes,
      });

      setCreatedResult(res);
      setStep(4);
      toast.success({
        title: "Vault Provisioned",
        description: res.message || `${VAULT_TYPES[selectedType].label} is ready.`,
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error({
        title: "Application Rejected",
        description: err.message || "Failed to open vault. Please verify your details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl sm:rounded-none p-0 overflow-hidden border border-paper-300">
        {/* Header */}
        <div className="bg-paper-100 p-6 border-b border-paper-300">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
            <Layers className="w-3.5 h-3.5 text-vintage-gold" />
            Heritage Trust · Internal Vault Provisioning
          </div>
          <DialogTitle className="text-2xl font-display font-bold text-ink-900">
            Open New Account Vault
          </DialogTitle>
          <DialogDescription className="text-ink-700 text-xs sm:text-sm mt-0.5">
            Select an account vault to provision. Maximum 1 account per type policy is strictly enforced.
          </DialogDescription>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 flex-1 transition-all duration-200",
                  step === s ? "bg-ink-900" : step > s ? "bg-emerald-600" : "bg-paper-300"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
          {/* STEP 1: SELECT VAULT TYPE */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                  Step 1: Select Vault Type
                </h3>
                <p className="text-xs text-ink-600">
                  Choose a vault type. Any vault type you already hold is disabled in accordance with the single-account-per-type limit.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.keys(VAULT_TYPES) as VaultType[]).map((type) => {
                  const def = VAULT_TYPES[type];
                  const Icon = TYPE_ICONS[type];
                  const isHeld = heldNormalized.includes(type);
                  const isSelected = selectedType === type;

                  return (
                    <div
                      key={type}
                      onClick={() => !isHeld && setSelectedType(type)}
                      className={cn(
                        "relative p-4 border text-left transition-all duration-150 select-none",
                        isHeld
                          ? "border-paper-300 bg-paper-100 opacity-60 cursor-not-allowed"
                          : isSelected
                            ? "border-ink-900 bg-paper-50 ring-2 ring-ink-900 cursor-pointer shadow-xs"
                            : "border-paper-300 bg-white hover:border-ink-700 cursor-pointer"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "p-2 rounded-none",
                              isSelected ? "bg-ink-900 text-white" : "bg-paper-200 text-ink-800"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-semibold text-ink-900 text-sm">{def.label}</h4>
                            <span className="text-[11px] font-mono text-emerald-700 font-bold block">
                              {def.interestRate}
                            </span>
                          </div>
                        </div>

                        {isHeld ? (
                          <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5">
                            Already Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase text-ink-500 bg-paper-100 px-1.5 py-0.5 border border-paper-200">
                            {def.category === "core" ? "Core" : "Sub"}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-ink-600 mt-2.5 leading-relaxed line-clamp-2">
                        {def.shortDesc}
                      </p>

                      {isHeld && (
                        <p className="text-[11px] text-amber-800 mt-2 font-medium bg-amber-50/80 p-1.5 border border-amber-200/60">
                          Vault already active. Remove or swap to change.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Plain-Language Explainer Card for Selected Vault */}
              {activeDef && (
                <div className="p-4 sm:p-5 border border-paper-300 bg-paper-50 space-y-3 animate-fade-in-up">
                  <div className="flex items-center gap-2 border-b border-paper-200 pb-2">
                    <Info className="w-4 h-4 text-ink-700" />
                    <h4 className="font-display text-sm font-bold text-ink-900">
                      About {activeDef.label} (Overview & Policy)
                    </h4>
                  </div>

                  <p className="text-xs text-ink-700 leading-relaxed">
                    {activeDef.explainer.purpose}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className="p-2.5 bg-white border border-paper-200">
                      <strong className="text-ink-900 block mb-0.5">Yield & Growth:</strong>
                      <span className="text-ink-700">{activeDef.explainer.interest}</span>
                    </div>
                    <div className="p-2.5 bg-white border border-paper-200">
                      <strong className="text-ink-900 block mb-0.5">Fees & Charges:</strong>
                      <span className="text-ink-700">{activeDef.explainer.fees}</span>
                    </div>
                    <div className="p-2.5 bg-white border border-paper-200">
                      <strong className="text-ink-900 block mb-0.5">Withdrawal Access:</strong>
                      <span className="text-ink-700">{activeDef.explainer.withdrawals}</span>
                    </div>
                    <div className="p-2.5 bg-white border border-paper-200">
                      <strong className="text-ink-900 block mb-0.5">US vs Global Scope:</strong>
                      <span className="text-ink-700">{activeDef.explainer.globalContext}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CONFIGURATION & FUNDING */}
          {step === 2 && activeDef && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                  Step 2: Configuration & Staged Funding
                </h3>
                <p className="text-xs text-ink-600">
                  Configure currency options and optional initial opening deposit.
                </p>
              </div>

              {/* Status Badge Box */}
              <div className="p-4 border border-paper-300 bg-paper-50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase text-ink-500 block">
                    Assigned Vault Hierarchy
                  </span>
                  <span className="font-display font-bold text-base text-ink-900">
                    {willBePrimary ? "Primary Vault" : "Secondary Vault"}
                  </span>
                </div>
                <Badge variant={willBePrimary ? "success" : "secondary"} className="text-xs">
                  {willBePrimary ? "Primary Designation" : "Secondary Staging"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                    Base Currency
                  </label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="rounded-none border-paper-300">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - United States Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro Sovereign</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                    Initial Deposit (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-ink-500">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      className="pl-7 rounded-none border-paper-300 font-mono"
                      value={initialDeposit}
                      onChange={(e) => setInitialDeposit(e.target.value)}
                    />
                  </div>
                  <span className="text-[11px] text-ink-500 block">Minimum opening deposit: $0.00</span>
                </div>
              </div>

              {parseFloat(initialDeposit) > 0 && existingAccounts.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                    Source Funding Account *
                  </label>
                  <Select value={fundingAccountId} onValueChange={setFundingAccountId}>
                    <SelectTrigger className="rounded-none border-paper-300">
                      <SelectValue placeholder="Select an existing account to fund from" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.accountType} (••••{acc.accountNumber.slice(-4)}) — Available: ${acc.balance.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                  Vault Label / Internal Reference (Optional)
                </label>
                <Input
                  placeholder="e.g. Tax Staging, Operating Reserve, Global Travel"
                  className="rounded-none border-paper-300 text-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & TERMS */}
          {step === 3 && activeDef && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                  Step 3: Review & Terms Authorization
                </h3>
                <p className="text-xs text-ink-600">
                  Please review the parameters of your new vault before finalizing.
                </p>
              </div>

              <div className="p-5 border border-paper-300 bg-white space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs pb-3 border-b border-paper-200">
                  <div>
                    <span className="text-ink-500 block">Vault Type:</span>
                    <strong className="text-ink-900 text-sm">{activeDef.label}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500 block">Designation:</span>
                    <strong className="text-ink-900 text-sm">
                      {willBePrimary ? "Primary Vault" : "Secondary Vault"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-ink-500 block">Base Currency:</span>
                    <strong className="text-ink-900 font-mono">{currency}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500 block">Initial Opening Deposit:</span>
                    <strong className="text-ink-900 font-mono">
                      ${parseFloat(initialDeposit || "0").toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 space-y-2 text-xs text-ink-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Single source of truth: 1-per-type limit applies strictly to this vault.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-ink-900 shrink-0" />
                    <span>Secured under institutional banking standards and federal deposit protections.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION RECEIPT */}
          {step === 4 && createdResult && (
            <div className="text-center py-6 space-y-4 animate-fade-in-up">
              <div className="mx-auto w-14 h-14 bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-ink-900">
                  Vault Successfully Provisioned
                </h3>
                <p className="text-xs text-ink-600 mt-1">
                  Your new {activeDef?.label} is now active and ready for ledger movements.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-paper-100 border border-paper-300 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-paper-200 pb-2">
                  <span className="text-ink-500">Account Number:</span>
                  <span className="font-mono font-bold text-ink-900">
                    {createdResult.account?.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between border-b border-paper-200 pb-2">
                  <span className="text-ink-500">Designation:</span>
                  <span className="font-bold text-ink-900">
                    {createdResult.account?.isPrimary ? "Primary Vault" : "Secondary Vault"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Opening Balance:</span>
                  <span className="font-mono font-bold text-ink-900">
                    ${Number(createdResult.account?.balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-paper-100 p-4 border-t border-paper-300 flex items-center justify-between">
          {step === 1 && (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                disabled={!selectedType || heldNormalized.includes(selectedType)}
                onClick={handleProceedToConfig}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Configuration
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={handleProceedToReview} icon={<ArrowRight className="w-4 h-4" />}>
                Review Terms
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Button variant="ghost" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4" />} disabled={loading}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Provisioning Vault...
                  </>
                ) : (
                  "Authorize & Open Vault"
                )}
              </Button>
            </>
          )}

          {step === 4 && (
            <Button className="w-full" onClick={handleClose}>
              Return to Vaults Command Center
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// 2. LINK EXTERNAL ACCOUNT VAULT DIALOG
// =============================================================================

interface LinkExternalAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts?: Array<{ id: string; accountType: string; accountNumber: string }>;
  onSuccess?: () => void;
}

export function LinkExternalAccountDialog({
  isOpen,
  onClose,
  existingAccounts = [],
  onSuccess,
}: LinkExternalAccountDialogProps) {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = React.useState<VaultType | null>(null);
  const [institutionName, setInstitutionName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [routingOrSwift, setRoutingOrSwift] = React.useState("");
  const [accountHolderName, setAccountHolderName] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [loading, setLoading] = React.useState(false);
  const [linkResult, setLinkResult] = React.useState<any>(null);

  const heldNormalized = React.useMemo(() => {
    return existingAccounts.map((a) => normalizeVaultType(a.accountType));
  }, [existingAccounts]);

  const activeDef = selectedType ? VAULT_TYPES[selectedType] : null;

  const handleReset = () => {
    setStep(1);
    setSelectedType(null);
    setInstitutionName("");
    setAccountNumber("");
    setRoutingOrSwift("");
    setAccountHolderName("");
    setCurrency("USD");
    setLoading(false);
    setLinkResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleProceedToDetails = () => {
    if (!selectedType) return;
    if (heldNormalized.includes(selectedType)) {
      toast.error({
        title: "Vault Type Already Active",
        description: `You already have an active ${VAULT_TYPES[selectedType].label}. Remove or replace it to link another.`,
      });
      return;
    }
    setStep(2);
  };

  const handleProceedToReview = () => {
    if (!institutionName.trim()) {
      toast.error({ title: "Institution Name Required", description: "Please enter your external bank name." });
      return;
    }
    if (!accountNumber.trim()) {
      toast.error({ title: "Account Number Required", description: "Please enter your external account number." });
      return;
    }
    if (!routingOrSwift.trim()) {
      toast.error({ title: "Routing/SWIFT Required", description: "Please enter a routing or SWIFT identifier." });
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      const res = await linkExternalVault({
        vaultType: selectedType,
        institutionName,
        accountNumber,
        routingOrSwift,
        accountHolderName,
        currency,
      });

      setLinkResult(res);
      setStep(4);
      toast.success({
        title: "External Vault Linked",
        description: res.message,
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error({
        title: "Linking Blocked",
        description: err.message || "Failed to link external vault.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl sm:rounded-none p-0 overflow-hidden border border-paper-300">
        {/* Header - Visibly distinct style with dark header strip */}
        <div className="bg-ink-900 text-white p-6 border-b border-paper-300">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-vintage-gold mb-1">
            <ExternalLink className="w-3.5 h-3.5" />
            Heritage Trust · External Account Bridge
          </div>
          <DialogTitle className="text-2xl font-display font-bold text-white">
            Link External Bank Vault
          </DialogTitle>
          <DialogDescription className="text-paper-200 text-xs sm:text-sm mt-0.5">
            Connect an external depository or custody account as a Secondary Vault. One account per type rule strictly applies.
          </DialogDescription>

          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 flex-1 transition-all duration-200",
                  step === s ? "bg-vintage-gold" : step > s ? "bg-emerald-400" : "bg-white/20"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
          {/* STEP 1: SELECT VAULT TYPE */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                <strong>Policy Reminder:</strong> Any linked external account is permanently designated as a <strong>Secondary Vault</strong>. You cannot link an external vault of a type you already hold.
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                  Step 1: Select Vault Type to Link
                </h3>
                <p className="text-xs text-ink-600">
                  Select the financial rail classification of the external institution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.keys(VAULT_TYPES) as VaultType[]).map((type) => {
                  const def = VAULT_TYPES[type];
                  const Icon = TYPE_ICONS[type];
                  const isHeld = heldNormalized.includes(type);
                  const isSelected = selectedType === type;

                  return (
                    <div
                      key={type}
                      onClick={() => !isHeld && setSelectedType(type)}
                      className={cn(
                        "relative p-4 border text-left transition-all duration-150 select-none",
                        isHeld
                          ? "border-paper-300 bg-paper-100 opacity-60 cursor-not-allowed"
                          : isSelected
                            ? "border-ink-900 bg-paper-50 ring-2 ring-ink-900 cursor-pointer shadow-xs"
                            : "border-paper-300 bg-white hover:border-ink-700 cursor-pointer"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "p-2 rounded-none",
                              isSelected ? "bg-ink-900 text-white" : "bg-paper-200 text-ink-800"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-semibold text-ink-900 text-sm">{def.label}</h4>
                            <span className="text-[11px] font-mono text-ink-500">
                              Linked External Rail
                            </span>
                          </div>
                        </div>

                        {isHeld && (
                          <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-ink-600 mt-2.5 leading-relaxed">
                        {def.shortDesc}
                      </p>

                      {isHeld && (
                        <p className="text-[11px] text-amber-800 mt-2 font-medium bg-amber-50/80 p-1.5 border border-amber-200/60">
                          You already have a {def.label}. Remove or replace it to link another.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: EXTERNAL DETAILS */}
          {step === 2 && activeDef && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                  Step 2: External Depository Institution Details
                </h3>
                <p className="text-xs text-ink-600">
                  Enter clearing credentials for the external institution.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                    Financial Institution Name *
                  </label>
                  <Input
                    placeholder="e.g. JPMorgan Chase, Wells Fargo, Barclays, UBS"
                    className="rounded-none border-paper-300 text-sm"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                      Account Number / IBAN *
                    </label>
                    <Input
                      placeholder="e.g. 9876543210 or GB82..."
                      className="rounded-none border-paper-300 text-sm font-mono"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                      Routing Number (ABA) or SWIFT/BIC *
                    </label>
                    <Input
                      placeholder="e.g. 021000021 or CHASUS33"
                      className="rounded-none border-paper-300 text-sm font-mono"
                      value={routingOrSwift}
                      onChange={(e) => setRoutingOrSwift(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                    Account Holder Legal Name (as on file with institution)
                  </label>
                  <Input
                    placeholder="Legal name"
                    className="rounded-none border-paper-300 text-sm"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & AUTHORIZE */}
          {step === 3 && activeDef && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                  Step 3: Review External Connection Terms
                </h3>
                <p className="text-xs text-ink-600">
                  Confirm the external vault details and authorization terms.
                </p>
              </div>

              <div className="p-5 border border-paper-300 bg-white space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs pb-3 border-b border-paper-200">
                  <div>
                    <span className="text-ink-500 block">Institution:</span>
                    <strong className="text-ink-900 text-sm">{institutionName}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500 block">Vault Type:</span>
                    <strong className="text-ink-900 text-sm">{activeDef.label}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500 block">Routing/SWIFT:</span>
                    <strong className="text-ink-900 font-mono">{routingOrSwift}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500 block">Designation:</span>
                    <strong className="text-ink-900 font-semibold">Secondary Vault (Fixed)</strong>
                  </div>
                </div>

                <div className="pt-2 text-xs text-ink-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>I confirm that I am the authorized beneficial owner of this external account.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && linkResult && (
            <div className="text-center py-6 space-y-4 animate-fade-in-up">
              <div className="mx-auto w-14 h-14 bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-ink-900">
                  External Vault Bridge Established
                </h3>
                <p className="text-xs text-ink-600 mt-1">
                  Your external {institutionName} account is now linked as a Secondary Vault.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-paper-100 border border-paper-300 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-paper-200 pb-2">
                  <span className="text-ink-500">Institution:</span>
                  <span className="font-bold text-ink-900">{institutionName}</span>
                </div>
                <div className="flex justify-between border-b border-paper-200 pb-2">
                  <span className="text-ink-500">Status:</span>
                  <span className="font-mono text-emerald-700 font-bold">Active Secondary</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Reference:</span>
                  <span className="font-mono text-ink-900">
                    {linkResult.account?.accountNumber}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-paper-100 p-4 border-t border-paper-300 flex items-center justify-between">
          {step === 1 && (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                disabled={!selectedType || heldNormalized.includes(selectedType)}
                onClick={handleProceedToDetails}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Bank Credentials
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={handleProceedToReview} icon={<ArrowRight className="w-4 h-4" />}>
                Review Connection
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Button variant="ghost" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4" />} disabled={loading}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Linking Depository...
                  </>
                ) : (
                  "Confirm & Connect Vault"
                )}
              </Button>
            </>
          )}

          {step === 4 && (
            <Button className="w-full" onClick={handleClose}>
              Return to Vaults Command Center
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// 3. ACCOUNT SWAP / REPLACEMENT REQUEST DIALOG
// =============================================================================

interface AccountSwapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts: Array<{ id: string; accountType: string; accountNumber: string; institutionName?: string }>;
  preselectedAccountId?: string;
  onSuccess?: () => void;
}

export function AccountSwapDialog({
  isOpen,
  onClose,
  existingAccounts,
  preselectedAccountId,
  onSuccess,
}: AccountSwapDialogProps) {
  const [targetAccountId, setTargetAccountId] = React.useState<string>(preselectedAccountId || "");
  const [institutionName, setInstitutionName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [routingOrSwift, setRoutingOrSwift] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2>(1);
  const [submittedResult, setSubmittedResult] = React.useState<any>(null);

  React.useEffect(() => {
    if (preselectedAccountId) {
      setTargetAccountId(preselectedAccountId);
    } else if (existingAccounts[0]) {
      setTargetAccountId(existingAccounts[0].id);
    }
  }, [preselectedAccountId, existingAccounts]);

  const targetAccount = existingAccounts.find((a) => a.id === targetAccountId);

  const handleSubmit = async () => {
    if (!targetAccount) return;
    if (!institutionName.trim() || !accountNumber.trim()) {
      toast.error({ title: "Incomplete Details", description: "Please enter institution and account number." });
      return;
    }
    setLoading(true);
    try {
      const res = await requestAccountSwap({
        existingAccountId: targetAccount.id,
        targetAccountType: normalizeVaultType(targetAccount.accountType),
        institutionName,
        accountNumber,
        routingOrSwift,
        reason,
      });

      setSubmittedResult(res);
      setStep(2);
      toast.success({
        title: "Swap Request Recorded",
        description: res.message,
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error({
        title: "Request Error",
        description: err.message || "Failed to submit swap request.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setInstitutionName("");
    setAccountNumber("");
    setRoutingOrSwift("");
    setReason("");
    setSubmittedResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl sm:rounded-none p-0 overflow-hidden border border-paper-300">
        <div className="bg-paper-100 p-6 border-b border-paper-300">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-600 mb-1">
            <ArrowRightLeft className="w-3.5 h-3.5 text-vintage-gold" />
            Heritage Trust · Account Replacement Protocol
          </div>
          <DialogTitle className="text-2xl font-display font-bold text-ink-900">
            Request Vault Swap / Replacement
          </DialogTitle>
          <DialogDescription className="text-ink-700 text-xs sm:text-sm mt-0.5">
            Safely swap an active account for a new one without violating the 1-account-per-type limit mid-transition.
          </DialogDescription>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                  Select Existing Vault to Replace *
                </label>
                <Select value={targetAccountId} onValueChange={setTargetAccountId}>
                  <SelectTrigger className="rounded-none border-paper-300">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountType} (••••{acc.accountNumber.slice(-4)}) {acc.institutionName ? `— ${acc.institutionName}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                  New Depository Institution Name *
                </label>
                <Input
                  placeholder="e.g. JPMorgan Chase, Barclays, Fidelity"
                  className="rounded-none border-paper-300 text-sm"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                    New Account Number *
                  </label>
                  <Input
                    placeholder="Account Number"
                    className="rounded-none border-paper-300 text-sm font-mono"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                    Routing Number or SWIFT/BIC
                  </label>
                  <Input
                    placeholder="Routing / SWIFT"
                    className="rounded-none border-paper-300 text-sm font-mono"
                    value={routingOrSwift}
                    onChange={(e) => setRoutingOrSwift(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                  Reason for Replacement (Optional)
                </label>
                <Input
                  placeholder="e.g. Changed primary checking bank, relocated internationally"
                  className="rounded-none border-paper-300 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="p-3 bg-paper-100 border border-paper-300 text-xs text-ink-700 space-y-1">
                <strong className="text-ink-900 block">Administrative Approval Gate:</strong>
                <span>
                  To prevent ledger discrepancies, this replacement request will be reviewed by Heritage Trust administration. Your existing vault remains active until the swap is verified.
                </span>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="text-center py-6 space-y-4 animate-fade-in-up">
              <div className="mx-auto w-14 h-14 bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-ink-900">
                  Swap Request Submitted
                </h3>
                <p className="text-xs text-ink-600 mt-1">
                  Reference: #{submittedResult?.requestId?.slice(-6).toUpperCase()}
                </p>
              </div>

              <p className="text-xs text-ink-700 max-w-md mx-auto leading-relaxed">
                An administrator will review your replacement request. Once approved, the new {institutionName} account will replace your existing vault seamlessly.
              </p>
            </div>
          )}
        </div>

        <div className="bg-paper-100 p-4 border-t border-paper-300 flex items-center justify-between">
          {step === 1 ? (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !targetAccountId}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Swap Request"
                )}
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
