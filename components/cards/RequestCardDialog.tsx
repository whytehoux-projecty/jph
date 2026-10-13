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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Sparkles,
  Zap,
  Truck,
  Building2,
  Crown,
} from "lucide-react";
import { requestCard } from "@/app/actions/cards";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface RequestCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Array<{ id: string; name: string; accountNumber: string; balance: number; accountType: string }>;
  onSuccess?: () => void;
}

export function RequestCardDialog({
  isOpen,
  onClose,
  accounts = [],
  onSuccess,
}: RequestCardDialogProps) {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [cardType, setCardType] = React.useState<"DEBIT" | "CREDIT">("DEBIT");
  const [cardTier, setCardTier] = React.useState<string>("STANDARD");
  const [accountId, setAccountId] = React.useState<string>("");
  const [requestedLimit, setRequestedLimit] = React.useState<string>("10000");
  const [cardholderName, setCardholderName] = React.useState("");
  const [billingAddress, setBillingAddress] = React.useState("");
  const [deliveryMethod, setDeliveryMethod] = React.useState("STANDARD_MAIL");
  const [loading, setLoading] = React.useState(false);
  const [submittedResult, setSubmittedResult] = React.useState<any>(null);

  React.useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const handleReset = () => {
    setStep(1);
    setCardType("DEBIT");
    setCardTier("STANDARD");
    setRequestedLimit("10000");
    setCardholderName("");
    setBillingAddress("");
    setDeliveryMethod("STANDARD_MAIL");
    setLoading(false);
    setSubmittedResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleProceedToDetails = () => {
    setStep(2);
  };

  const handleProceedToReview = () => {
    if (!cardholderName.trim()) {
      toast.error({ title: "Name Required", description: "Please enter your name as it should appear on the card." });
      return;
    }
    if (cardType === "DEBIT" && !accountId) {
      toast.error({ title: "Vault Required", description: "Please select an account to link your debit card to." });
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await requestCard({
        cardType,
        accountId: cardType === "DEBIT" ? accountId : undefined,
        cardTier,
        cardholderName,
        billingAddress: billingAddress || "Primary Address on File",
        requestedLimit: cardType === "CREDIT" ? parseFloat(requestedLimit) || 10000 : undefined,
      });

      setSubmittedResult(res);
      setStep(4);
      toast.success({
        title: "Application Received",
        description: res.message,
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error({
        title: "Request Error",
        description: err.message || "Failed to submit card application.",
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
            <CreditCard className="w-3.5 h-3.5 text-vintage-gold" />
            Heritage Trust · Card Issuance Protocol
          </div>
          <DialogTitle className="text-2xl font-display font-bold text-ink-900">
            Apply for Heritage Trust Card
          </DialogTitle>
          <DialogDescription className="text-ink-700 text-xs sm:text-sm mt-0.5">
            Select your card type, configure spending tiers, and submit for underwriting review.
          </DialogDescription>

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
          {/* STEP 1: CARD TYPE SELECTION */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                  Step 1: Choose Card Facility
                </h3>
                <p className="text-xs text-ink-600">
                  Select between a direct depository debit card or an institutional revolving credit facility.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DEBIT CARD OPTION */}
                <div
                  onClick={() => setCardType("DEBIT")}
                  className={cn(
                    "p-5 border text-left cursor-pointer transition-all duration-150 select-none space-y-3",
                    cardType === "DEBIT"
                      ? "border-ink-900 bg-paper-50 ring-2 ring-ink-900 shadow-xs"
                      : "border-paper-300 bg-white hover:border-ink-700"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="p-2.5 bg-pine-700 text-white rounded-none">
                      <CreditCard className="w-5 h-5" />
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      Instant Ledger Debit
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-ink-900">
                      Heritage Debit Card
                    </h4>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                      Linked directly to your primary liquid vault with 0.00% APR and instant ledger settlement.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-paper-200 text-xs space-y-1.5 text-ink-700">
                    <div className="flex justify-between">
                      <span className="text-ink-500">Daily ATM Cap:</span>
                      <strong className="font-mono text-ink-900">$2,500 / day</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-500">POS Daily Purchase:</span>
                      <strong className="font-mono text-ink-900">$10,000 / day</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-500">Foreign Exchange:</span>
                      <strong className="text-emerald-700">Zero FX Markup</strong>
                    </div>
                  </div>
                </div>

                {/* CREDIT CARD OPTION */}
                <div
                  onClick={() => setCardType("CREDIT")}
                  className={cn(
                    "p-5 border text-left cursor-pointer transition-all duration-150 select-none space-y-3",
                    cardType === "CREDIT"
                      ? "border-ink-900 bg-paper-50 ring-2 ring-ink-900 shadow-xs"
                      : "border-paper-300 bg-white hover:border-ink-700"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="p-2.5 bg-ink-900 text-white rounded-none">
                      <Crown className="w-5 h-5 text-vintage-gold" />
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      Revolving Credit Line
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-ink-900">
                      Heritage Platinum Credit Card
                    </h4>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                      Unsecured institutional credit facility with premium travel protections and rewards cashback.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-paper-200 text-xs space-y-1.5 text-ink-700">
                    <div className="flex justify-between">
                      <span className="text-ink-500">Credit Line Range:</span>
                      <strong className="font-mono text-ink-900">$5,000 – $25,000</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-500">Variable APR:</span>
                      <strong className="font-mono text-ink-900">21.99% variable</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-500">Rewards Program:</span>
                      <strong className="text-vintage-gold">1.5% – 3% Cashback</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURATION */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                  Step 2: Cardholder & Limit Configuration
                </h3>
                <p className="text-xs text-ink-600">
                  Specify cardholder embossing and linkage parameters.
                </p>
              </div>

              <div className="space-y-4">
                {/* Linked Account (Debit only) */}
                {cardType === "DEBIT" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                      Debit Funding Vault *
                    </label>
                    <Select value={accountId} onValueChange={setAccountId}>
                      <SelectTrigger className="rounded-none border-paper-300">
                        <SelectValue placeholder="Select an active account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name || acc.accountType} (••••{acc.accountNumber.slice(-4)}) — Available: ${acc.balance.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Requested Limit (Credit only) */}
                {cardType === "CREDIT" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                      Requested Revolving Credit Limit *
                    </label>
                    <Select value={requestedLimit} onValueChange={setRequestedLimit}>
                      <SelectTrigger className="rounded-none border-paper-300">
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5000">$5,000 USD (Starter Credit Line)</SelectItem>
                        <SelectItem value="10000">$10,000 USD (Standard Executive)</SelectItem>
                        <SelectItem value="15000">$15,000 USD (Premier Reserve)</SelectItem>
                        <SelectItem value="25000">$25,000 USD (Institutional High-Limit)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Card Tier Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                    Card Edition & Tier
                  </label>
                  <Select value={cardTier} onValueChange={setCardTier}>
                    <SelectTrigger className="rounded-none border-paper-300">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard Edition (Classic Pine / Navy)</SelectItem>
                      <SelectItem value="GOLD_RESERVE">Gold Reserve Edition (Champagne Gold)</SelectItem>
                      <SelectItem value="ONYX_PLATINUM">Onyx Platinum Edition (Black Brushed Steel)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                    Cardholder Name (Embossed on Card) *
                  </label>
                  <Input
                    placeholder="Full Legal Name as shown on ID"
                    className="rounded-none border-paper-300 text-sm uppercase font-mono"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  />
                </div>

                {/* Dispatch Method */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                    Physical Delivery Option
                  </label>
                  <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    <SelectTrigger className="rounded-none border-paper-300">
                      <SelectValue placeholder="Delivery method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD_MAIL">Standard Secure Postal (Free · 5-7 business days)</SelectItem>
                      <SelectItem value="EXPRESS_COURIER">Express Courier Dispatch (Complimentary for Platinum · 1-2 business days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & SUBMIT */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-900">
                  Step 3: Review Application Parameters
                </h3>
                <p className="text-xs text-ink-600">
                  Confirm your application details before underwriting submission.
                </p>
              </div>

              <div className="p-5 border border-paper-300 bg-white space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs pb-3 border-b border-paper-200">
                  <div>
                    <span className="text-ink-500 block">Facility:</span>
                    <strong className="text-ink-900 text-sm">{cardType} CARD</strong>
                  </div>
                  <div>
                    <span className="text-ink-500 block">Card Tier:</span>
                    <strong className="text-ink-900 text-sm">{cardTier.replace("_", " ")}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500 block">Cardholder Name:</span>
                    <strong className="text-ink-900 font-mono text-sm">{cardholderName}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500 block">
                      {cardType === "DEBIT" ? "Linked Vault:" : "Requested Limit:"}
                    </span>
                    <strong className="text-ink-900 font-mono text-sm">
                      {cardType === "DEBIT" ? `••••${accountId.slice(-4)}` : `$${parseFloat(requestedLimit).toLocaleString()} USD`}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 text-xs text-ink-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Includes Zero Liability fraud protection and real-time transaction alerts.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-ink-900 shrink-0" />
                    <span>Virtual card credentials become available immediately upon administrative approval.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4 animate-fade-in-up">
              <div className="mx-auto w-14 h-14 bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-ink-900">
                  Card Application Submitted
                </h3>
                <p className="text-xs text-ink-600 mt-1">
                  Reference: #{submittedResult?.request?.id?.slice(-6).toUpperCase() || "HERITAGE"}
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-paper-100 border border-paper-300 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-paper-200 pb-2">
                  <span className="text-ink-500">Status:</span>
                  <span className="font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 border border-amber-200">
                    UNDER ADMIN REVIEW
                  </span>
                </div>
                <div className="flex justify-between border-b border-paper-200 pb-2">
                  <span className="text-ink-500">Cardholder:</span>
                  <span className="font-bold text-ink-900">{cardholderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Review SLA:</span>
                  <span className="text-ink-700 font-semibold">1-2 Business Hours</span>
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
              <Button onClick={handleProceedToDetails} icon={<ArrowRight className="w-4 h-4" />}>
                Configure Cardholder Details
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting Application...
                  </>
                ) : (
                  "Submit Card Application"
                )}
              </Button>
            </>
          )}

          {step === 4 && (
            <Button className="w-full" onClick={handleClose}>
              Return to Cards Center
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
