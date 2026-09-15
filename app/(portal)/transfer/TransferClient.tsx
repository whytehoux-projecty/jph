"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftRight,
  History,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import { submitTransfer } from "@/app/actions/transfer";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency,
  formatDate,
  languageToLocale,
  translate,
} from "@/lib/utils";
import {
  TransferMethodSelector,
  type UiTransferTypeId,
  transferTypeOptions,
} from "@/components/transfer/TransferMethodSelector";
import { EnhancedAccountSelector } from "@/components/transfer/EnhancedAccountSelector";
import { BeneficiarySelector } from "@/components/transfer/BeneficiarySelector";
import { FeeCalculator } from "@/components/transfer/FeeCalculator";
import {
  ScheduleTransfer,
  type TransferSchedule,
} from "@/components/transfer/ScheduleTransfer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  swiftCode?: string;
  nickname?: string;
  isInternal?: boolean;
}

interface TransferFormData {
  fromAccountId: string;
  toAccountNumber: string;
  amount: string;
  description: string;
  routingNumber?: string;
  bankName?: string;
  swiftCode?: string;
  recipientName?: string;
  transferType: "INTERNAL" | "WIRE";
  schedule: TransferSchedule;
}

interface TransferReceiptSummary {
  id?: string;
  createdAt?: string;
  fromAccountMasked: string;
  toLabel: string;
  amount: number;
  currency: string;
  methodLabel: string;
  scheduleLabel: string;
  reference: string;
}

function TransferContent({ initialAccounts, userPreferences: initialPreferences }: { initialAccounts: Account[]; userPreferences: any; }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accounts = initialAccounts;
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<Beneficiary | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedTypeId, setSelectedTypeId] =
    useState<UiTransferTypeId>("internal");
  const [hasSelectedMethod, setHasSelectedMethod] = useState(false);
  const [isPinStep, setIsPinStep] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState<TransferReceiptSummary | null>(null);
  const [showMethodComparison, setShowMethodComparison] = useState(false);

  const userPreferences = initialPreferences;

  const buildReceiptShareText = (r: TransferReceiptSummary) => {
    const parts: string[] = [];
    parts.push("Transfer receipt");
    if (r.id) {
      parts.push("Confirmation ID: " + r.id);
    }
    parts.push("From: " + r.fromAccountMasked);
    parts.push("To: " + r.toLabel);
    parts.push(
      "Amount: " +
        formatCurrency(
          r.amount,
          r.currency || userPreferences.currency,
          locale,
        ),
    );
    parts.push("Method: " + r.methodLabel);
    parts.push("Schedule: " + (r.scheduleLabel || "Send now"));
    if (r.reference) {
      parts.push("Reference: " + r.reference);
    }
    if (r.createdAt) {
      parts.push(
        "Submitted at: " + new Date(r.createdAt).toLocaleString(locale),
      );
    }
    return parts.join("\n");
  };

  const [formData, setFormData] = useState<TransferFormData>({
    fromAccountId: "",
    toAccountNumber: searchParams.get("accountNumber") || "",
    amount: "",
    description: "",
    recipientName: searchParams.get("recipientName") || "",
    transferType: "INTERNAL",
    schedule: {
      type: "now",
      startDate: null,
      frequency: "monthly",
      endType: "never",
      endAfterOccurrences: null,
      endOnDate: null,
    },
  });



  const selectedAccount =
    accounts.find((acc) => acc.id === formData.fromAccountId) || null;

  const DAILY_LIMIT = 50000;
  const usedToday = 0;
  const parsedAmount = formData.amount ? parseFloat(formData.amount) || 0 : 0;
  const totalAfter = usedToday + parsedAmount;
  const exceedsDailyLimit = parsedAmount > 0 && totalAfter > DAILY_LIMIT;
  const remainingAfter = Math.max(DAILY_LIMIT - totalAfter, 0);
  const limitUsageRatio = Math.min(totalAfter / DAILY_LIMIT, 1);
  const locale = languageToLocale(userPreferences.language);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateForReview = () => {
    const errors: Record<string, string> = {};

    if (!hasSelectedMethod) {
      errors.transferType = "Choose a payment type to continue.";
    }

    if (!formData.fromAccountId) {
      errors.fromAccountId = "Please select a source account.";
    }

    if (!formData.amount || parsedAmount <= 0) {
      errors.amount = "Enter an amount greater than zero.";
    } else if (selectedAccount && parsedAmount > selectedAccount.balance) {
      errors.amount = "Amount exceeds available balance for this account.";
    }

    if (!formData.toAccountNumber) {
      errors.toAccountNumber = "Enter the recipient account number.";
    }

    if (!formData.description) {
      errors.description = "Add a short reference for this transfer.";
    }

    if (formData.transferType === "WIRE") {
      if (!formData.recipientName) {
        errors.recipientName = "Enter the recipient name.";
      }
      if (!formData.swiftCode) {
        errors.swiftCode = "Enter the SWIFT / BIC code.";
      }
      if (!formData.bankName) {
        errors.bankName = "Enter the recipient bank name.";
      }
    }

    if (exceedsDailyLimit) {
      errors.amount = "This transfer exceeds your daily limit.";
    }
    if (formData.schedule.type !== "now") {
      if (!formData.schedule.startDate) {
        errors.schedule = "Select a date for this transfer.";
      } else {
        const today = new Date().toISOString().slice(0, 10);
        if (formData.schedule.startDate < today) {
          errors.schedule = "Choose a date today or later.";
        }
      }
      if (
        formData.schedule.type === "recurring" &&
        formData.schedule.endType === "after" &&
        formData.schedule.endAfterOccurrences !== null &&
        formData.schedule.endAfterOccurrences <= 0
      ) {
        errors.schedule = "Enter how many transfers should occur.";
      }
    }

    return errors;
  };

  const buildSchedulePayload = () => {
    const s = formData.schedule;
    if (!s || s.type === "now") {
      return { type: "now" };
    }
    if (s.type === "once") {
      return {
        type: "once",
        date: s.startDate,
      };
    }
    return {
      type: "recurring",
      date: s.startDate,
      frequency: s.frequency,
      endType: s.endType,
      endAfterOccurrences:
        s.endType === "after" ? s.endAfterOccurrences : undefined,
      endOnDate: s.endType === "on" ? s.endOnDate : undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isReviewMode) {
      const errors = validateForReview();
      setFieldErrors(errors);

      if (Object.keys(errors).length === 0) {
        setIsReviewMode(true);
        setIsPinStep(false);
        setPinCode("");
        setPinError(null);
      }
      return;
    }

    if (isReviewMode && !isPinStep) {
      // Open PIN step
      setPinError(null);
      setPinCode("");
      setIsPinStep(true);
      setResendCooldown(30);
      return;
    }

    if (isPinStep) {
      if (!pinCode || pinCode.trim().length < 4) {
        setPinError("Enter your 4-6 digit Transaction PIN.");
        return;
      }
      setPinError(null);
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      let txResult: any | null = null;

      // Create FormData for the submitTransfer action
      const submitData = new FormData();
      submitData.append('transactionType', formData.transferType === "INTERNAL" ? 'LOCAL_TRANSFER' : 'INT_WIRE');
      submitData.append('amount', formData.amount);
      submitData.append('fromAccountId', formData.fromAccountId);
      submitData.append('description', formData.description);
      submitData.append('pinCode', pinCode);

      if (formData.transferType === "INTERNAL") {
        submitData.append('toAccountNumber', formData.toAccountNumber);
        submitData.append('bankName', formData.bankName || '');
      } else {
        submitData.append('swiftCode', formData.swiftCode || '');
        submitData.append('iban', formData.toAccountNumber);
        submitData.append('recipientName', formData.recipientName || '');
        submitData.append('bankName', formData.bankName || '');
      }

      txResult = await submitTransfer(submitData);

      const receiptSummary = buildReceiptSummary(
        txResult,
        formData.transferType === "WIRE",
      );
      setReceipt(receiptSummary);
      setShowReceipt(true);
      setMessage(null);

      // Reset form
      setFormData((prev) => ({
        ...prev,
        toAccountNumber: "",
        amount: "",
        description: "",
        recipientName: "",
        swiftCode: "",
        routingNumber: "",
        bankName: "",
      }));

      setSelectedBeneficiary(null);
      setIsReviewMode(false);
      setIsPinStep(false);
      setPinCode("");
      setPinError(null);
      setResendCooldown(0);



      // Refresh recent transactions
      router.refresh();
    } catch (error: any) {
      if (isPinStep && error.response?.status === 400) {
        setPinError(
          error.response?.data?.message ||
            "Invalid or expired code. Try again or resend.",
        );
      } else {
        setMessage({
          type: "error",
          text:
            error.response?.data?.message ||
            "Transfer failed. Check details and try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (name === "fromAccountId") {
      setIsReviewMode(false);
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleFieldBlur = (name: string) => {
    const errors = validateForReview();
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (errors[name]) {
        next[name] = errors[name];
      } else {
        delete next[name];
      }
      return next;
    });
  };

  const handleTransferTypeCardSelect = (typeId: UiTransferTypeId) => {
    setSelectedTypeId(typeId);
    const backendType = typeId === "internal" ? "INTERNAL" : "WIRE";
    handleSelectChange("transferType", backendType);
    setHasSelectedMethod(true);
    setIsReviewMode(false);
  };

  const handleBeneficiaryChosen = (beneficiary: {
    id: string;
    name: string;
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
    nickname?: string;
    isInternal?: boolean;
  }) => {
    const normalized: Beneficiary = {
      id: beneficiary.id,
      name: beneficiary.name,
      accountNumber: beneficiary.accountNumber,
      bankName: beneficiary.bankName,
      swiftCode: beneficiary.swiftCode,
      nickname: beneficiary.nickname,
      isInternal: beneficiary.isInternal,
    };
    setSelectedBeneficiary(normalized);
    setFormData((prev) => ({
      ...prev,
      toAccountNumber: normalized.accountNumber,
      recipientName: normalized.name,
      bankName: normalized.bankName,
      transferType: normalized.isInternal ? "INTERNAL" : prev.transferType,
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.toAccountNumber;
      delete next.recipientName;
      delete next.bankName;
      return next;
    });
    setIsReviewMode(false);
  };

  const getScheduleSummary = () => {
    const schedule = formData.schedule;
    if (schedule.type === "now") {
      return "Send now";
    }
    if (!schedule.startDate) {
      return "Schedule not set";
    }
    const start = formatDate(schedule.startDate, "short", locale);
    if (schedule.type === "once") {
      return "On " + start;
    }
    let text = "From " + start + ", " + schedule.frequency;
    if (schedule.endType === "after" && schedule.endAfterOccurrences) {
      text += ", " + schedule.endAfterOccurrences + " transfers";
    } else if (schedule.endType === "on" && schedule.endOnDate) {
      const end = formatDate(schedule.endOnDate, "short", locale);
      text += ", until " + end;
    } else if (schedule.endType === "never") {
      text += ", no end date";
    }
    return text;
  };

  const getMethodLabel = () => {
    if (!hasSelectedMethod) {
      return "Not selected";
    }
    if (selectedTypeId === "internal") return "Internal transfer";
    if (selectedTypeId === "ach") return "ACH transfer";
    if (selectedTypeId === "wire_domestic") return "Domestic wire";
    if (selectedTypeId === "wire_international") return "International wire";
    if (selectedTypeId === "zelle") return "Zelle payment";
    if (selectedTypeId === "rtp") return "Real-time payment";
    return "Transfer";
  };

  const buildReceiptSummary = (
    tx: any | null,
    wire: boolean,
  ): TransferReceiptSummary => {
    const fromMasked = selectedAccount
      ? `${selectedAccount.accountType} ••••${selectedAccount.accountNumber.slice(-4)}`
      : formData.fromAccountId || "Not selected";

    const toLabel =
      formData.recipientName ||
      selectedBeneficiary?.name ||
      (formData.toAccountNumber
        ? "Account ending " + formData.toAccountNumber.slice(-4)
        : "Not specified");

    const id =
      tx?.reference ||
      tx?.transactionId ||
      tx?.id ||
      (wire ? tx?.wireId : tx?.transferId);

    const createdAt =
      tx?.createdAt || tx?.timestamp || new Date().toISOString();

    return {
      id,
      createdAt,
      fromAccountMasked: fromMasked,
      toLabel,
      amount: parsedAmount,
      currency: selectedAccount?.currency || userPreferences.currency,
      methodLabel: getMethodLabel(),
      scheduleLabel: getScheduleSummary(),
      reference: formData.description || "",
    };
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="col-span-2 h-[500px] rounded-xl" />
          <Skeleton className="col-span-1 h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-charcoal">
              Money Transfer
            </h1>
            <p className="text-muted-foreground mt-1">
              Send money securely to internal or external accounts.
            </p>
          </div>
          <Button variant="outline" icon={<History className="w-4 h-4" />}>
            History
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Transfer Form */}
          <Card className="md:col-span-2 border-none shadow-vintage-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <VintageIcon icon={ArrowLeftRight} variant="gold" size="sm" />
                Transfer Details
              </CardTitle>
              <CardDescription>Enter the recipient and amount.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                  <div
                    className={`p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.text}
                  </div>
                )}

                {isReviewMode && (
                  <div className="p-4 rounded-lg border border-vintage-green/30 bg-emerald-50/60 text-sm space-y-3 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-charcoal">
                        Review transfer
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsReviewMode(false)}
                        className="text-xs text-vintage-green hover:underline">
                        Edit details
                      </button>
                    </div>
                    <div className="space-y-1 text-gray-700">
                      <div className="flex justify-between">
                        <span>From</span>
                        <span>
                          {selectedAccount
                            ? `${selectedAccount.accountType} ••••${selectedAccount.accountNumber.slice(-4)}`
                            : "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>To</span>
                        <span>
                          {formData.recipientName ||
                            selectedBeneficiary?.name ||
                            (formData.toAccountNumber
                              ? "Account ending " +
                                formData.toAccountNumber.slice(-4)
                              : "Not specified")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount</span>
                        <span>
                          {formData.amount
                            ? formatCurrency(
                                parsedAmount,
                                selectedAccount?.currency ||
                                  userPreferences.currency,
                                locale,
                              )
                            : formatCurrency(
                                0,
                                selectedAccount?.currency ||
                                  userPreferences.currency,
                                locale,
                              )}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Method</span>
                        <span>{getMethodLabel()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Schedule</span>
                        <span>{getScheduleSummary()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Reference</span>
                        <span className="text-right">
                          {formData.description || "Not provided"}
                        </span>
                      </div>
                      {isPinStep && (
                        <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between"><span className="text-xs font-medium text-charcoal">Enter Transaction PIN</span></div>
                          <Input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            className="h-9 tracking-[0.3em] text-center font-mono text-base"
                            value={pinCode}
                            onChange={(e) => {
                              setPinCode(e.target.value.replace(/\D/g, ""));
                              setPinError(null);
                            }}
                            placeholder="••••••"
                            aria-label="Transaction PIN"
                          />
                          {pinError && (
                            <p className="text-xs text-red-600">{pinError}</p>
                          )}
                          {!pinError && (
                            <p className="text-[11px] text-muted-foreground">
                              We sent a one-time code to your registered contact
                              method.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="transferType">
                      {translate(
                        userPreferences.language,
                        "transfer.paymentTypeLabel",
                      ) || "Payment Type"}
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowMethodComparison(true)}
                      className="text-[11px] font-medium text-vintage-green hover:underline">
                      {translate(
                        userPreferences.language,
                        "transfer.compareTrigger",
                      ) || "Compare methods"}
                    </button>
                  </div>
                  {fieldErrors.transferType ? (
                    <p className="text-xs text-red-600">
                      {fieldErrors.transferType}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {translate(
                        userPreferences.language,
                        "transfer.paymentTypeHelper",
                      ) ||
                        "Choose how you would like this transfer to be sent."}
                    </p>
                  )}
                  <TransferMethodSelector
                    selectedTypeId={selectedTypeId}
                    onSelect={handleTransferTypeCardSelect}
                  />
                </div>

                {hasSelectedMethod && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <EnhancedAccountSelector
                        value={formData.fromAccountId}
                        onChange={(id) =>
                          handleSelectChange("fromAccountId", id)
                        }
                        label="From Account"
                      />
                      {selectedAccount && (
                        <p className="text-xs text-muted-foreground">
                          Available balance:{" "}
                          {formatCurrency(
                            selectedAccount.balance,
                            selectedAccount.currency,
                          )}
                        </p>
                      )}
                      {fieldErrors.fromAccountId && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.fromAccountId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          className="pl-7"
                          value={formData.amount}
                          onChange={(e) =>
                            handleFieldChange("amount", e.target.value)
                          }
                          onBlur={() => handleFieldBlur("amount")}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {fieldErrors.amount && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.amount}
                        </p>
                      )}
                      {!fieldErrors.amount && (
                        <p className="text-xs text-muted-foreground">
                          Remaining daily limit after this transfer:{" "}
                          {formatCurrency(remainingAfter, "USD")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {parsedAmount > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Fees and total cost
                    </Label>
                    <FeeCalculator
                      methodId={selectedTypeId}
                      amount={parsedAmount}
                      currency={selectedAccount?.currency || "USD"}
                      targetCurrency={
                        selectedTypeId === "wire_international"
                          ? "USD"
                          : selectedAccount?.currency || "USD"
                      }
                      variant="full"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <ScheduleTransfer
                    value={formData.schedule}
                    onChange={(next) => {
                      setFormData((prev) => ({ ...prev, schedule: next }));
                      setIsReviewMode(false);
                      setFieldErrors((prev) => {
                        const nextErrors = { ...prev };
                        delete nextErrors.schedule;
                        return nextErrors;
                      });
                    }}
                  />
                  {fieldErrors.schedule && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.schedule}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    {translate(
                      userPreferences.language,
                      "transfer.recipientsLabel",
                    )}
                  </Label>
                  <BeneficiarySelector
                    selectedBeneficiary={selectedBeneficiary}
                    onSelect={handleBeneficiaryChosen}
                    transferMethod={selectedTypeId}
                  />
                  <p className="text-xs text-muted-foreground">
                    {translate(
                      userPreferences.language,
                      "transfer.recipientsHelper",
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toAccountNumber">
                    {translate(
                      userPreferences.language,
                      "transfer.toAccountLabel",
                    )}
                  </Label>
                  <Input
                    id="toAccountNumber"
                    placeholder={translate(
                      userPreferences.language,
                      "transfer.toAccountPlaceholder",
                    )}
                    value={formData.toAccountNumber}
                    onChange={(e) =>
                      handleFieldChange("toAccountNumber", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("toAccountNumber")}
                    required
                  />
                  {fieldErrors.toAccountNumber ? (
                    <p className="text-xs text-red-600">
                      {fieldErrors.toAccountNumber}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {translate(
                        userPreferences.language,
                        "transfer.toAccountHelper",
                      )}
                    </p>
                  )}
                </div>

                {formData.transferType === "WIRE" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-l-2 border-vintage-green/20 pl-4 animate-in fade-in slide-in-from-left-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="recipientName">
                        {translate(
                          userPreferences.language,
                          "transfer.recipientNameLabel",
                        )}
                      </Label>
                      <Input
                        id="recipientName"
                        placeholder={translate(
                          userPreferences.language,
                          "transfer.recipientNamePlaceholder",
                        )}
                        value={formData.recipientName}
                        onChange={(e) =>
                          handleFieldChange("recipientName", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("recipientName")}
                        required
                      />
                      {fieldErrors.recipientName ? (
                        <p className="text-xs text-red-600">
                          {fieldErrors.recipientName}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {translate(
                            userPreferences.language,
                            "transfer.recipientNameHelper",
                          )}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="swiftCode">
                        {translate(
                          userPreferences.language,
                          "transfer.swiftLabel",
                        )}
                      </Label>
                      <Input
                        id="swiftCode"
                        placeholder={translate(
                          userPreferences.language,
                          "transfer.swiftPlaceholder",
                        )}
                        value={formData.swiftCode}
                        onChange={(e) =>
                          handleFieldChange("swiftCode", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("swiftCode")}
                        required
                      />
                      {fieldErrors.swiftCode ? (
                        <p className="text-xs text-red-600">
                          {fieldErrors.swiftCode}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {translate(
                            userPreferences.language,
                            "transfer.swiftHelper",
                          )}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">
                        {translate(
                          userPreferences.language,
                          "transfer.bankNameLabel",
                        )}
                      </Label>
                      <Input
                        id="bankName"
                        placeholder={translate(
                          userPreferences.language,
                          "transfer.bankNamePlaceholder",
                        )}
                        value={formData.bankName}
                        onChange={(e) =>
                          handleFieldChange("bankName", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("bankName")}
                        required
                      />
                      {fieldErrors.bankName ? (
                        <p className="text-xs text-red-600">
                          {fieldErrors.bankName}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {translate(
                            userPreferences.language,
                            "transfer.bankNameHelper",
                          )}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber">
                        {translate(
                          userPreferences.language,
                          "transfer.routingLabel",
                        )}
                      </Label>
                      <Input
                        id="routingNumber"
                        placeholder={translate(
                          userPreferences.language,
                          "transfer.routingPlaceholder",
                        )}
                        value={formData.routingNumber}
                        onChange={(e) =>
                          handleFieldChange("routingNumber", e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        {translate(
                          userPreferences.language,
                          "transfer.routingHelper",
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {translate(
                      userPreferences.language,
                      "transfer.descriptionLabel",
                    )}
                  </Label>
                  <Input
                    id="description"
                    placeholder={translate(
                      userPreferences.language,
                      "transfer.descriptionPlaceholder",
                    )}
                    value={formData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("description")}
                    required
                  />
                  {fieldErrors.description ? (
                    <p className="text-xs text-red-600">
                      {fieldErrors.description}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {translate(
                        userPreferences.language,
                        "transfer.descriptionHelper",
                      )}
                    </p>
                  )}
                </div>

                {isPinStep && (
                  <Card className="border-amber-300 bg-amber-50/70 my-4 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-amber-950">
                        <ShieldCheck className="h-5 w-5 text-amber-600" />
                        Verification Required
                      </CardTitle>
                      <CardDescription className="text-amber-800 text-xs">
                        Enter the 6-digit code sent to your registered contact method.
                        <span className="block mt-1 text-[11px] text-amber-700/80 italic">
                          Demo mode: enter any 6-digit number to proceed.
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={pinCode}
                        onChange={(e) => {
                          setPinCode(e.target.value.replace(/\D/g, ""));
                          setPinError(null);
                        }}
                        className="text-center text-2xl tracking-[0.5em] font-mono h-14 bg-white border-amber-200 focus:border-amber-500"
                        autoFocus
                      />
                      {pinError && (
                        <p className="text-xs text-red-600 font-medium">{pinError}</p>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="small"
                        disabled={resendCooldown > 0 || isSubmitting}
                        onClick={() => {
                          setResendCooldown(30);
                          setPinCode("");
                          setPinError(null);
                        }}
                        className="w-full text-xs text-amber-900 hover:text-amber-950 hover:bg-amber-100/60"
                      >
                        {resendCooldown > 0
                          ? `Resend code in ${resendCooldown}s`
                          : "Resend verification code"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    loading={isSubmitting}>
                    {isSubmitting
                      ? translate(
                          userPreferences.language,
                          "transfer.processing",
                        ) || "Processing..."
                      : !isReviewMode
                        ? translate(
                            userPreferences.language,
                            "transfer.nextReview",
                          ) || "Next: Review details"
                        : !isPinStep
                          ? translate(
                              userPreferences.language,
                              "transfer.nextVerify",
                            ) || "Next: Verify code"
                          : `Confirm ${
                              formData.amount
                                ? formatCurrency(
                                    parsedAmount,
                                    selectedAccount?.currency ||
                                      userPreferences.currency,
                                    locale,
                                  )
                                : "transfer"
                            }`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-soft-gold/10 to-transparent border-soft-gold/20">
              <CardHeader>
                <CardTitle className="text-lg">
                  {translate(userPreferences.language, "transfer.limitsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {translate(
                      userPreferences.language,
                      "transfer.dailyLimitLabel",
                    ) || "Daily Limit"}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(
                      DAILY_LIMIT,
                      userPreferences.currency,
                      locale,
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {translate(
                      userPreferences.language,
                      "transfer.usedTodayLabel",
                    ) || "Used Today"}
                  </span>
                  <span className="font-semibold text-vintage-green">
                    {formatCurrency(
                      totalAfter,
                      userPreferences.currency,
                      locale,
                    )}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                  <div
                    className="bg-vintage-green h-1.5 rounded-full"
                    style={{ width: `${limitUsageRatio * 100}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {translate(
                    userPreferences.language,
                    "transfer.remainingLimitPrefix",
                  ) || "Remaining daily limit after this transfer:"}{" "}
                  {formatCurrency(
                    remainingAfter,
                    userPreferences.currency,
                    locale,
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {translate(userPreferences.language, "transfer.feesTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {parsedAmount > 0 ? (
                  <FeeCalculator
                    methodId={selectedTypeId}
                    amount={parsedAmount}
                    currency={selectedAccount?.currency || "USD"}
                    targetCurrency={
                      selectedTypeId === "wire_international"
                        ? "USD"
                        : selectedAccount?.currency || "USD"
                    }
                    variant="compact"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {translate(
                      userPreferences.language,
                      "transfer.feesEmpty",
                    ) ||
                      "Select an amount and payment type to see estimated fees."}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <VintageIcon icon={ShieldCheck} size="sm" variant="green" />
                  {translate(
                    userPreferences.language,
                    "transfer.securityInfoTitle",
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  {translate(
                    userPreferences.language,
                    "transfer.securityLine1",
                  )}
                </p>
                <p>
                  {translate(
                    userPreferences.language,
                    "transfer.securityLine2",
                  )}
                </p>
                <p>
                  {translate(
                    userPreferences.language,
                    "transfer.securityLine3",
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog
        open={showMethodComparison}
        onOpenChange={setShowMethodComparison}>
        <DialogContent className="max-w-2xl animate-fade-in-up">
          <DialogHeader>
            <DialogTitle>
              {translate(userPreferences.language, "transfer.compareTitle") ||
                "Compare transfer methods"}
            </DialogTitle>
            <DialogDescription>
              {translate(
                userPreferences.language,
                "transfer.compareDescription",
              ) ||
                "Review speed, fees, and delivery timing before choosing how to send this transfer."}
            </DialogDescription>
          </DialogHeader>
          <div className="hidden md:block">
            <div className="grid grid-cols-4 gap-4 text-[11px] font-medium text-muted-foreground border-b border-slate-200 pb-2">
              <span>
                {translate(
                  userPreferences.language,
                  "transfer.compareMethod",
                ) || "Method"}
              </span>
              <span>
                {translate(userPreferences.language, "transfer.compareSpeed") ||
                  "Speed"}
              </span>
              <span>
                {translate(userPreferences.language, "transfer.compareFees") ||
                  "Fees"}
              </span>
              <span>
                {translate(
                  userPreferences.language,
                  "transfer.compareDelivery",
                ) || "Delivery estimate"}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              {transferTypeOptions.map((type) => {
                const isSelected = type.id === selectedTypeId;
                const isDisabled = type.available === false;
                return (
                  <button
                    key={type.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      handleTransferTypeCardSelect(type.id);
                      setShowMethodComparison(false);
                    }}
                    className={`w-full grid grid-cols-4 gap-4 items-center rounded-md px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? "bg-soft-gold/10 border border-soft-gold/40"
                        : "hover:bg-slate-50"
                    } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-charcoal">
                        {type.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                    <span>{type.processingTime}</span>
                    <span>{type.fee}</span>
                    <span>{type.deliveryEstimate}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="md:hidden space-y-3 text-xs">
            {transferTypeOptions.map((type) => {
              const isSelected = type.id === selectedTypeId;
              const isDisabled = type.available === false;
              return (
                <button
                  key={type.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    handleTransferTypeCardSelect(type.id);
                    setShowMethodComparison(false);
                  }}
                  className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? "border-soft-gold/60 bg-soft-gold/10"
                      : "border-slate-200 hover:bg-slate-50"
                  } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-charcoal">
                      {type.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {type.processingTime}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {translate(
                        userPreferences.language,
                        "transfer.compareFeesPrefix",
                      ) || "Fees:"}{" "}
                      {type.fee}
                    </span>
                    <span>{type.deliveryEstimate}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {translate(
              userPreferences.language,
              "transfer.compareCutoffNote",
            ) ||
              "Same-day domestic wires depend on bank cutoff times and business days."}
          </p>
          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMethodComparison(false)}>
              {translate(userPreferences.language, "common.close") || "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md animate-fade-in-up">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-vintage-green" />
              {translate(userPreferences.language, "receipt.title") ||
                "Transfer submitted"}
            </DialogTitle>
            <DialogDescription>
              {translate(userPreferences.language, "receipt.description") ||
                "Here is a summary of your transfer. You can keep this for your records."}
            </DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {translate(userPreferences.language, "receipt.from") ||
                      "From"}
                  </span>
                  <span className="font-medium text-charcoal">
                    {receipt.fromAccountMasked}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {translate(userPreferences.language, "receipt.to") || "To"}
                  </span>
                  <span className="font-medium text-charcoal">
                    {receipt.toLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {translate(userPreferences.language, "receipt.amount") ||
                      "Amount"}
                  </span>
                  <span className="font-semibold text-charcoal">
                    {formatCurrency(
                      receipt.amount,
                      receipt.currency || userPreferences.currency,
                      locale,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {translate(userPreferences.language, "receipt.method") ||
                      "Method"}
                  </span>
                  <span>{receipt.methodLabel}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {translate(userPreferences.language, "receipt.schedule") ||
                      "Schedule"}
                  </span>
                  <span className="text-right">
                    {receipt.scheduleLabel ||
                      translate(
                        userPreferences.language,
                        "receipt.scheduleNow",
                      ) ||
                      "Send now"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {translate(userPreferences.language, "receipt.reference") ||
                      "Reference"}
                  </span>
                  <span className="text-right">
                    {receipt.reference ||
                      translate(
                        userPreferences.language,
                        "receipt.referenceNotProvided",
                      ) ||
                      "Not provided"}
                  </span>
                </div>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-2 text-[11px] text-muted-foreground space-y-1">
                {receipt.id && (
                  <div className="flex justify-between">
                    <span>
                      {translate(
                        userPreferences.language,
                        "receipt.confirmationId",
                      ) || "Confirmation ID"}
                    </span>
                    <span className="font-mono text-xs">{receipt.id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>
                    {translate(
                      userPreferences.language,
                      "receipt.submittedAt",
                    ) || "Submitted at"}
                  </span>
                  <span>
                    {new Date(receipt.createdAt || "").toLocaleString(locale)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!receipt) return;
                const text = buildReceiptShareText(receipt);
                if (navigator.share) {
                  navigator
                    .share({
                      title:
                        translate(
                          userPreferences.language,
                          "receipt.documentTitle",
                        ) || "Transfer receipt",
                      text,
                    })
                    .catch(() => {});
                } else if (
                  navigator.clipboard &&
                  navigator.clipboard.writeText
                ) {
                  navigator.clipboard.writeText(text).catch(() => {});
                }
              }}>
              {translate(userPreferences.language, "receipt.share") || "Share"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!receipt) return;
                const text = buildReceiptShareText(receipt);
                const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${
                  translate(
                    userPreferences.language,
                    "receipt.documentTitle",
                  ) || "Transfer receipt"
                }</title>
<style>
  body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px; }
  h1 { font-size: 20px; margin-bottom: 12px; }
  p { margin: 4px 0; font-size: 14px; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
</style>
</head>
<body>
<h1>${
                  translate(
                    userPreferences.language,
                    "receipt.documentHeading",
                  ) || "Transfer receipt"
                }</h1>
<pre>${text}</pre>
</body>
</html>`;
                const w = window.open("", "_blank");
                if (!w) return;
                w.document.write(html);
                w.document.close();
                w.focus();
                w.print();
              }}>
              {translate(userPreferences.language, "receipt.downloadPdf") ||
                "Download PDF"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReceipt(false)}>
              {translate(userPreferences.language, "common.close") || "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function TransferClient({ initialAccounts = [], userPreferences = { language: "en", currency: "USD" } }: { initialAccounts?: any[]; userPreferences?: any; }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      }>
      <TransferContent initialAccounts={initialAccounts} userPreferences={userPreferences} />
    </Suspense>
  );
}
