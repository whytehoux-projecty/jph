"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  Building2,
  QrCode,
  Lock,
  ShieldCheck,
  Clock,
  Printer,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  Send,
  Truck,
  MapPin,
  ExternalLink,
  DollarSign,
  ArrowRight,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";
import { fmtMoney } from "@/lib/transfer-forms/validators";
import { submitWithdrawal, type WithdrawalResult } from "@/app/actions/deposits";

export interface AccountOption {
  id: string;
  name: string;
  accountType: string;
  balance: number;
  currency: string;
  accountNumber: string;
}

interface WithdrawalSectionProps {
  accounts: AccountOption[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onWithdrawalCreated?: (result: WithdrawalResult) => void;
}

type WithdrawalTab = "atm_paycode" | "linked_ach" | "agency_voucher" | "pre_staged_counter" | "cashiers_check";

export function WithdrawalSection({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onWithdrawalCreated,
}: WithdrawalSectionProps) {
  const [activeTab, setActiveTab] = React.useState<WithdrawalTab>("atm_paycode");

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // Common copy handler
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const copyValue = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedText(label);
    toast.success({ title: "Copied to clipboard", description: `${label}: ${val}` });
    setTimeout(() => setCopiedText(null), 2000);
  };

  // ---------------------------------------------------------------------------
  // TAB 1: CARDLESS ATM PAYCODE
  // ---------------------------------------------------------------------------
  const [atmAmount, setAtmAmount] = React.useState("100");
  const [atmPin, setAtmPin] = React.useState("");
  const [isGeneratingPaycode, setIsGeneratingPaycode] = React.useState(false);
  const [generatedPaycodeResult, setGeneratedPaycodeResult] = React.useState<WithdrawalResult | null>(null);
  const quickAtmAmounts = ["20", "40", "60", "100", "200", "500"];

  const handleGenerateAtmPaycode = async () => {
    const num = parseFloat(atmAmount);
    if (isNaN(num) || num <= 0) {
      toast.error({ title: "Invalid amount", description: "Please enter a valid withdrawal amount." });
      return;
    }
    if (num > (selectedAccount?.balance || 0)) {
      toast.error({ title: "Insufficient Balance", description: "Requested withdrawal exceeds available vault balance." });
      return;
    }
    if (!atmPin || atmPin.length !== 4 || !/^\d{4}$/.test(atmPin)) {
      toast.error({ title: "PIN Required", description: "Please specify a temporary 4-digit Cash-Out PIN." });
      return;
    }

    setIsGeneratingPaycode(true);
    try {
      const res = await submitWithdrawal({
        accountId: selectedAccountId,
        method: "atm_paycode",
        amount: num,
        pin: atmPin,
        notes: "Cardless ATM cash withdrawal request generated via web portal.",
      });

      if (res.success) {
        setGeneratedPaycodeResult(res);
        if (onWithdrawalCreated) onWithdrawalCreated(res);
        toast.success({
          title: "Paycode Issued",
          description: `Your $${num.toFixed(2)} Cardless ATM Paycode has been generated and locked with your PIN.`,
        });
      } else {
        toast.error({ title: "Withdrawal Failed", description: res.error || "Unable to issue paycode." });
      }
    } catch (err: any) {
      toast.error({ title: "System Error", description: err?.message || "An unexpected error occurred." });
    } finally {
      setIsGeneratingPaycode(false);
    }
  };

  // ---------------------------------------------------------------------------
  // TAB 2: LINKED TRADITIONAL BANK ACCOUNT (ACH FOR OVER-THE-COUNTER CASH)
  // ---------------------------------------------------------------------------
  const [achBankName, setAchBankName] = React.useState("JPMorgan Chase Bank, N.A.");
  const [achRoutingNumber, setAchRoutingNumber] = React.useState("021000021");
  const [achAccountNumber, setAchAccountNumber] = React.useState("");
  const [achAmount, setAchAmount] = React.useState("");
  const [isSubmittingAch, setIsSubmittingAch] = React.useState(false);
  const [achSuccessRef, setAchSuccessRef] = React.useState<string | null>(null);

  const handleExecuteAchOutbound = async () => {
    const num = parseFloat(achAmount);
    if (isNaN(num) || num <= 0) {
      toast.error({ title: "Invalid amount", description: "Please enter a valid outbound settlement amount." });
      return;
    }
    if (num > (selectedAccount?.balance || 0)) {
      toast.error({ title: "Insufficient Balance", description: "Requested settlement exceeds available vault balance." });
      return;
    }
    if (!achAccountNumber || achAccountNumber.length < 4) {
      toast.error({ title: "Account Number Required", description: "Enter target brick-and-mortar account number." });
      return;
    }

    setIsSubmittingAch(true);
    try {
      const res = await submitWithdrawal({
        accountId: selectedAccountId,
        method: "linked_ach",
        amount: num,
        targetBankDetails: {
          bankName: achBankName,
          routingNumber: achRoutingNumber,
          accountNumber: achAccountNumber,
          accountType: "CHECKING",
        },
        notes: "ACH Transfer to paired brick-and-mortar institution for over-the-counter physical branch withdrawal.",
      });

      if (res.success) {
        setAchSuccessRef(res.reference || "ACH-SETTLED");
        if (onWithdrawalCreated) onWithdrawalCreated(res);
        toast.success({
          title: "ACH Outbound Dispatched",
          description: `$${num.toLocaleString()} cleared to ${achBankName}. Available for in-branch counter pickup.`,
        });
      } else {
        toast.error({ title: "Clearing Failed", description: res.error || "Unable to initiate ACH clearing." });
      }
    } catch (err: any) {
      toast.error({ title: "System Error", description: err?.message || "An unexpected error occurred." });
    } finally {
      setIsSubmittingAch(false);
    }
  };

  // ---------------------------------------------------------------------------
  // TAB 3: RETAIL AGENCY CASH-OUT VOUCHER
  // ---------------------------------------------------------------------------
  const [agencyAmount, setAgencyAmount] = React.useState("150");
  const [agencyRecipient, setAgencyRecipient] = React.useState("Self (Account Holder)");
  const [agencyPin, setAgencyPin] = React.useState("");
  const [isGeneratingAgency, setIsGeneratingAgency] = React.useState(false);
  const [agencyVoucherResult, setAgencyVoucherResult] = React.useState<WithdrawalResult | null>(null);

  const handleGenerateAgencyVoucher = async () => {
    const num = parseFloat(agencyAmount);
    if (isNaN(num) || num <= 0) {
      toast.error({ title: "Invalid amount", description: "Please enter a valid voucher amount." });
      return;
    }
    if (num > (selectedAccount?.balance || 0)) {
      toast.error({ title: "Insufficient Balance", description: "Requested voucher exceeds available vault balance." });
      return;
    }
    if (!agencyPin || agencyPin.length !== 4) {
      toast.error({ title: "PIN Required", description: "Set a 4-digit verification PIN for retail cashier redemption." });
      return;
    }

    setIsGeneratingAgency(true);
    try {
      const res = await submitWithdrawal({
        accountId: selectedAccountId,
        method: "agency_voucher",
        amount: num,
        pin: agencyPin,
        recipientName: agencyRecipient,
        notes: "Retail agency cash-out voucher for supermarket / money center cashier counter collection.",
      });

      if (res.success) {
        setAgencyVoucherResult(res);
        if (onWithdrawalCreated) onWithdrawalCreated(res);
        toast.success({
          title: "Voucher Issued",
          description: `Retail cash-out barcode ready for ${agencyRecipient}.`,
        });
      } else {
        toast.error({ title: "Voucher Failed", description: res.error || "Unable to generate agency voucher." });
      }
    } catch (err: any) {
      toast.error({ title: "System Error", description: err?.message || "An unexpected error occurred." });
    } finally {
      setIsGeneratingAgency(false);
    }
  };

  // ---------------------------------------------------------------------------
  // TAB 4: PRE-STAGED BRANCH TELLER CASH ORDER
  // ---------------------------------------------------------------------------
  const [tellerAmount, setTellerAmount] = React.useState("5000");
  const [tellerDenominations, setTellerDenominations] = React.useState("Mix of $100 and $50 crisp notes");
  const [tellerLocation, setTellerLocation] = React.useState("Downtown Main Vault (48 Wall St)");
  const [isSubmittingTeller, setIsSubmittingTeller] = React.useState(false);
  const [tellerSuccessRef, setTellerSuccessRef] = React.useState<string | null>(null);

  const handleExecuteTellerOrder = async () => {
    const num = parseFloat(tellerAmount);
    if (isNaN(num) || num < 500) {
      toast.error({ title: "Minimum Amount", description: "Pre-staged branch cash orders require a minimum of $500." });
      return;
    }
    if (num > (selectedAccount?.balance || 0)) {
      toast.error({ title: "Insufficient Balance", description: "Requested cash bundle exceeds available vault balance." });
      return;
    }

    setIsSubmittingTeller(true);
    try {
      const res = await submitWithdrawal({
        accountId: selectedAccountId,
        method: "pre_staged_counter",
        amount: num,
        denominations: tellerDenominations,
        notes: `Pre-staged branch cash counter reservation at ${tellerLocation}. Denominations: ${tellerDenominations}.`,
      });

      if (res.success) {
        setTellerSuccessRef(res.reference || "TELLER-RESERVED");
        if (onWithdrawalCreated) onWithdrawalCreated(res);
        toast.success({
          title: "Cash Bundle Reserved",
          description: `Pre-staged vault order registered for ${tellerLocation}.`,
        });
      } else {
        toast.error({ title: "Order Failed", description: res.error || "Unable to stage teller reservation." });
      }
    } catch (err: any) {
      toast.error({ title: "System Error", description: err?.message || "An unexpected error occurred." });
    } finally {
      setIsSubmittingTeller(false);
    }
  };

  // ---------------------------------------------------------------------------
  // TAB 5: CERTIFIED CASHIER'S CHEQUE DELIVERY BY COURIER
  // ---------------------------------------------------------------------------
  const [checkPayee, setCheckPayee] = React.useState("");
  const [checkAmount, setCheckAmount] = React.useState("2500");
  const [checkAddress, setCheckAddress] = React.useState("120 Broadway, Suite 1400, New York, NY 10271");
  const [isSubmittingCheck, setIsSubmittingCheck] = React.useState(false);
  const [checkSuccessRef, setCheckSuccessRef] = React.useState<string | null>(null);

  const handleExecuteCheckOrder = async () => {
    const num = parseFloat(checkAmount);
    if (isNaN(num) || num <= 0) {
      toast.error({ title: "Invalid amount", description: "Please enter a valid check amount." });
      return;
    }
    if (num > (selectedAccount?.balance || 0)) {
      toast.error({ title: "Insufficient Balance", description: "Requested check amount exceeds available balance." });
      return;
    }
    if (!checkPayee.trim()) {
      toast.error({ title: "Payee Name Required", description: "Specify the legal entity or individual name on the check." });
      return;
    }

    setIsSubmittingCheck(true);
    try {
      const res = await submitWithdrawal({
        accountId: selectedAccountId,
        method: "cashiers_check",
        amount: num,
        recipientName: checkPayee.trim(),
        deliveryAddress: checkAddress,
        notes: `Official Cashier's Check / Bank Draft dispatched via Priority Courier to ${checkAddress}.`,
      });

      if (res.success) {
        setCheckSuccessRef(res.reference || "CHK-DISPATCHED");
        if (onWithdrawalCreated) onWithdrawalCreated(res);
        toast.success({
          title: "Cashier's Check Ordered",
          description: `Official certified draft printed for ${checkPayee}. Dispatched via Priority Courier.`,
        });
      } else {
        toast.error({ title: "Order Failed", description: res.error || "Unable to issue cashier draft." });
      }
    } catch (err: any) {
      toast.error({ title: "System Error", description: err?.message || "An unexpected error occurred." });
    } finally {
      setIsSubmittingCheck(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner explaining Withdrawal vs Transfer vs Payment */}
      <div className="p-4 sm:p-5 border border-paper-300 bg-paper-50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-paper-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-ink-900 text-white rounded-none">
              <Banknote className="w-4 h-4" />
            </span>
            <h2 className="font-display text-base font-bold text-ink-900">
              Cash Withdrawal Facilities & Paycodes
            </h2>
          </div>
        </div>

        <p className="text-small text-ink-700 leading-relaxed">
          Unlike an electronic <strong>Transfer</strong> (which moves book balances to another user) or a <strong>Bill Payment</strong> (which settles corporate utility liabilities), a <strong>Cash Withdrawal</strong> converts your digital ledger balance into physical paper currency, retail cash vouchers, or certified cashier drafts without requiring physical plastic cards.
        </p>

        {/* Global Account Selector Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-paper-300">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 block">
              Debit Source Account
            </label>
            <span className="font-semibold text-ink-900 text-small">
              {selectedAccount?.name} ({selectedAccount?.accountType}) · ••••{selectedAccount?.accountNumber.slice(-4)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-500">Available Vault:</span>
            <span className="font-mono font-bold text-base text-ink-900">
              {fmtMoney(selectedAccount?.balance || 0, selectedAccount?.currency || "USD")}
            </span>
          </div>
        </div>
      </div>

      {/* Module Sub-tabs for 5 Withdrawal Rails */}
      <div
        role="tablist"
        aria-label="Withdrawal methods"
        className="flex items-end gap-1 overflow-x-auto scrollbar-hide border-b border-paper-300"
      >
        {[
          { id: "atm_paycode" as const, label: "Cardless ATM Paycode", icon: QrCode },
          { id: "linked_ach" as const, label: "Linked Traditional Bank (ACH)", icon: Building2 },
          { id: "agency_voucher" as const, label: "Retail Agency Voucher", icon: Store },
          { id: "pre_staged_counter" as const, label: "Express Pick-Up", icon: Banknote },
          { id: "cashiers_check" as const, label: "Certified Bank draft", icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              className={cn(
                "shrink-0 px-4 py-2.5 rounded-none text-[13px] transition-all duration-150 font-medium whitespace-nowrap flex items-center gap-2 -mb-[1px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ink-900",
                isSelected
                  ? "bg-white text-ink-900 border border-paper-300 border-b-white font-semibold"
                  : "text-ink-500 hover:text-ink-900 hover:bg-paper-100 border border-transparent border-b-transparent"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className={cn("h-4 w-4", isSelected ? "text-ink-900" : "text-ink-500")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container for Active Tab Content */}
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* TAB 1: CARDLESS ATM WITHDRAWAL (PAYCODES)                                 */}
        {/* ========================================================================= */}
        {activeTab === "atm_paycode" && (
          <motion.div
            key="tab-atm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="grid overflow-hidden border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm"
          >
            <div className="p-5 sm:p-8 space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">
                  Cardless ATM Cash-Out (Paycode)
                </h3>
                <p className="text-small text-ink-600 mt-0.5">
                  Retrieve cash from over 55,000+ partner ATMs worldwide without inserting a physical plastic debit card.
                </p>
              </div>

              {!generatedPaycodeResult ? (
                <div className="space-y-6">
                  {/* Step 1: Select Amount */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                      1. Select Withdrawal Cash Amount (USD)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {quickAtmAmounts.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setAtmAmount(q)}
                          className={cn(
                            "py-2.5 px-3 border text-center font-mono font-semibold text-small transition-all cursor-pointer",
                            atmAmount === q
                              ? "bg-ink-900 border-ink-900 text-white"
                              : "bg-paper-50 border-paper-300 text-ink-900 hover:bg-paper-100"
                          )}
                        >
                          ${q}
                        </button>
                      ))}
                    </div>

                    <div className="relative pt-2">
                      <span className="absolute left-3 top-4.5 font-mono text-ink-500 font-bold">$</span>
                      <input
                        type="number"
                        step="10"
                        min="10"
                        max="1000"
                        value={atmAmount}
                        onChange={(e) => setAtmAmount(e.target.value)}
                        placeholder="Or enter custom amount ($10 – $1,000)"
                        className="w-full pl-8 pr-3 py-2 text-sm font-mono font-semibold border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                      />
                    </div>
                  </div>

                  {/* Step 2: Set Temporary 4-Digit Cash-Out PIN */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                        2. Create Temporary 4-Digit Cash-Out PIN
                      </label>
                      <span className="text-[11px] text-ink-500 font-mono">Confidential Security Token</span>
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      value={atmPin}
                      onChange={(e) => setAtmPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 4-digit numeric PIN (e.g. 8492)"
                      className="w-full max-w-xs px-3.5 py-2 text-center text-lg font-mono font-bold tracking-widest border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                    />
                    <p className="text-[11px] text-ink-600">
                      You will type this temporary 4-digit PIN directly on the ATM keypad to authenticate and dispense the cash.
                    </p>
                  </div>

                  {/* Step 3: Authorization Button */}
                  <Button
                    onClick={handleGenerateAtmPaycode}
                    disabled={isGeneratingPaycode || !atmAmount || atmPin.length !== 4}
                    className="w-full bg-vermilion-600 text-white hover:bg-vermilion-700 rounded-none h-11"
                  >
                    {isGeneratingPaycode ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Generating Encrypted Paycode...
                      </span>
                    ) : (
                      `Generate Cardless Paycode ($${parseFloat(atmAmount || "0").toFixed(2)})`
                    )}
                  </Button>
                </div>
              ) : (
                /* Generated Paycode Voucher Display */
                <div className="space-y-6 animate-in fade-in zoom-in-95">
                  <div className="p-5 border-2 border-dashed border-ink-900 bg-paper-50 space-y-4">
                    <div className="flex items-center justify-between border-b border-paper-200 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-ink-500 block">
                          Cardless ATM Cash-Out Voucher
                        </span>
                        <h4 className="font-display text-base font-bold text-ink-900">
                          Ready for ATM Dispensation
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1">
                        <Clock className="w-3.5 h-3.5" /> Valid for 2 Hours
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                      <div className="bg-white p-4 border border-paper-300 space-y-1">
                        <span className="text-[11px] text-ink-500 uppercase font-mono block">Multi-Digit Paycode</span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xl sm:text-2xl font-black text-ink-900 tracking-wider">
                            {generatedPaycodeResult.paycode}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyValue(generatedPaycodeResult.paycode || "", "Paycode")}
                            className="p-1 text-ink-500 hover:text-ink-900 cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[11px] text-ink-600">Type on ATM Screen</span>
                      </div>

                      <div className="bg-white p-4 border border-paper-300 space-y-1">
                        <span className="text-[11px] text-ink-500 uppercase font-mono block">Temporary PIN</span>
                        <span className="font-mono text-xl sm:text-2xl font-black text-vermilion-700 tracking-widest block">
                          {generatedPaycodeResult.pin}
                        </span>
                        <span className="text-[11px] text-ink-600">Enter on ATM Keypad</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-ink-700 bg-paper-100 p-3 border border-paper-200 font-mono">
                      <div className="flex justify-between">
                        <span>Dispense Principal:</span>
                        <span className="font-bold text-ink-900">${generatedPaycodeResult.amount?.toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heritage Rail Fee:</span>
                        <span className="text-emerald-700 font-semibold">$0.00 (Waived)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Internal Reference:</span>
                        <span className="text-ink-900">{generatedPaycodeResult.reference}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="rounded-none flex-1 text-xs"
                        onClick={() => window.print()}
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> Print ATM Ticket
                      </Button>
                      <Button
                        className="rounded-none flex-1 bg-ink-900 text-white hover:bg-black text-xs"
                        onClick={() => {
                          setGeneratedPaycodeResult(null);
                          setAtmPin("");
                        }}
                      >
                        Generate Another Paycode
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Guide: How Cardless ATM Works */}
            <aside className="border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 space-y-5">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                  ATM Operating Protocol
                </span>
                <h4 className="font-display text-base font-bold text-ink-900">
                  How to Collect Your Cash at any ATM
                </h4>
              </div>

              <ol className="space-y-3" aria-label="ATM Withdrawal Steps">
                {[
                  "Walk up to any supported physical ATM (Allpoint, MoneyPass, or Partner Bank ATM).",
                  "Press any button on the ATM screen, or select 'Cardless Withdrawal' / 'Cash Out'.",
                  "Enter the multi-digit Paycode generated on your screen.",
                  "Enter your secret 4-digit temporary PIN on the physical keypad.",
                  "The machine verifies the encrypted token and dispenses your cash instantly.",
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-small text-ink-700">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-ink-900 text-[11px] font-semibold text-paper-50">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <div className="border-t border-paper-300 pt-4 text-xs text-ink-600 space-y-1">
                <div className="flex justify-between">
                  <span>Daily ATM Limit:</span>
                  <span className="font-semibold text-ink-900">$1,000.00 / day</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Availability:</span>
                  <span className="font-semibold text-ink-900">55,000+ Surcharge-Free ATMs</span>
                </div>
              </div>
            </aside>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LINKED TRADITIONAL BANK ACCOUNTS (ACH FOR BRANCH CASH COUNTER)     */}
        {/* ========================================================================= */}
        {activeTab === "linked_ach" && (
          <motion.div
            key="tab-ach"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="grid overflow-hidden border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm"
          >
            <div className="p-5 sm:p-8 space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">
                  Linked Brick-and-Mortar Bank Account (ACH Outbound)
                </h3>
                <p className="text-small text-ink-600 mt-0.5">
                  Execute an online transfer to your paired traditional brick-and-mortar account to execute high-value over-the-counter cash withdrawals exceeding ATM daily caps.
                </p>
              </div>

              {!achSuccessRef ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                        Paired Financial Institution
                      </label>
                      <select
                        value={achBankName}
                        onChange={(e) => setAchBankName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-paper-50 border border-paper-300 focus:outline-none focus:border-ink-900"
                      >
                        <option value="JPMorgan Chase Bank, N.A.">JPMorgan Chase Bank, N.A.</option>
                        <option value="Bank of America, N.A.">Bank of America, N.A.</option>
                        <option value="Wells Fargo Bank, N.A.">Wells Fargo Bank, N.A.</option>
                        <option value="Citibank, N.A.">Citibank, N.A.</option>
                        <option value="Barclays Bank UK">Barclays Bank UK</option>
                        <option value="Royal Bank of Canada (RBC)">Royal Bank of Canada (RBC)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                        ABA Routing Number
                      </label>
                      <input
                        type="text"
                        value={achRoutingNumber}
                        onChange={(e) => setAchRoutingNumber(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-mono bg-paper-50 border border-paper-300 focus:outline-none focus:border-ink-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      External Checking Account Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1029384756"
                      value={achAccountNumber}
                      onChange={(e) => setAchAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono bg-paper-50 border border-paper-300 focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      Withdrawal Amount (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-mono text-ink-500 font-bold">$</span>
                      <input
                        type="number"
                        step="100"
                        placeholder="e.g. 5,000.00"
                        value={achAmount}
                        onChange={(e) => setAchAmount(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-base font-mono font-bold bg-white border border-paper-300 focus:outline-none focus:border-ink-900"
                      />
                    </div>
                    <span className="text-[11px] text-ink-500 mt-1 block">
                      No maximum ceiling. Ideal for heavy counter cash needs ($5,000 – $100,000+).
                    </span>
                  </div>

                  <Button
                    onClick={handleExecuteAchOutbound}
                    disabled={isSubmittingAch || !achAmount || !achAccountNumber}
                    className="w-full bg-ink-900 text-white hover:bg-black rounded-none h-11 mt-2"
                  >
                    {isSubmittingAch ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching ACH Clearing...
                      </span>
                    ) : (
                      `Authorize Outbound Clearing ($${parseFloat(achAmount || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })})`
                    )}
                  </Button>
                </div>
              ) : (
                <div className="p-5 border border-success/30 bg-success-bg/20 space-y-4">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-6 h-6" />
                    <h4 className="font-display text-base font-bold">ACH Settlement Dispatched</h4>
                  </div>
                  <p className="text-small text-ink-700">
                    Funds have been placed into the outgoing clearing rail to <strong>{achBankName}</strong>. You may visit any physical branch of {achBankName} to withdraw this cash over the teller counter.
                  </p>
                  <div className="font-mono text-xs bg-white p-3 border border-paper-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-ink-500">Tracking Reference:</span>
                      <span className="font-bold text-ink-900">{achSuccessRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-500">Destination Account:</span>
                      <span className="font-bold text-ink-900">••••{achAccountNumber.slice(-4)}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-none w-full"
                    onClick={() => {
                      setAchSuccessRef(null);
                      setAchAmount("");
                      setAchAccountNumber("");
                    }}
                  >
                    Initiate Another ACH Transfer
                  </Button>
                </div>
              )}
            </div>

            {/* Right Guide: The Dual-Account Strategy */}
            <aside className="border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 space-y-5">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                  The Paired Account Strategy
                </span>
                <h4 className="font-display text-base font-bold text-ink-900">
                  Overcoming ATM Daily Ceilings
                </h4>
              </div>

              <p className="text-small text-ink-700">
                While ATM machines impose strict daily dispensing caps (typically $500 to $1,000), linking an external brick-and-mortar checking account allows you to move substantial funds seamlessly:
              </p>

              <ul className="space-y-2 text-xs text-ink-700">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Execute ACH transfer from Heritage Vault to your brick-and-mortar account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Walk into the physical branch with your government photo ID.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Withdraw paper cash directly over the counter with zero ATM limitations.</span>
                </li>
              </ul>
            </aside>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RETAIL AGENCY CASH-OUT VOUCHER (SUPERMARKETS & MONEY CENTERS)      */}
        {/* ========================================================================= */}
        {activeTab === "agency_voucher" && (
          <motion.div
            key="tab-agency"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="grid overflow-hidden border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm"
          >
            <div className="p-5 sm:p-8 space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">
                  Retail Agency Cash-Out Voucher
                </h3>
                <p className="text-small text-ink-600 mt-0.5">
                  Generate a barcode cash-out ticket redeemable at partner retail checkout registers and money centers (Walmart, CVS, Walgreens, Post Office, PayPoint).
                </p>
              </div>

              {!agencyVoucherResult ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      Cash Amount to Collect (USD)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={agencyAmount}
                      onChange={(e) => setAgencyAmount(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full px-3 py-2 text-base font-mono font-bold bg-white border border-paper-300 focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      Designated Cash Collector
                    </label>
                    <input
                      type="text"
                      value={agencyRecipient}
                      onChange={(e) => setAgencyRecipient(e.target.value)}
                      placeholder="Self (Account Holder) or Full Legal Name of Proxy"
                      className="w-full px-3 py-2 text-sm bg-white border border-paper-300 focus:outline-none focus:border-ink-900"
                    />
                    <span className="text-[11px] text-ink-500 mt-1 block">
                      The collector must show government photo identification matching this legal name at the register.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      4-Digit Collection PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={agencyPin}
                      onChange={(e) => setAgencyPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 5192"
                      className="w-full max-w-xs px-3 py-2 text-center font-mono font-bold text-base border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateAgencyVoucher}
                    disabled={isGeneratingAgency || !agencyAmount || agencyPin.length !== 4}
                    className="w-full bg-vermilion-600 text-white hover:bg-vermilion-700 rounded-none h-11"
                  >
                    {isGeneratingAgency ? "Generating Barcode Voucher..." : "Issue Retail Cash-Out Voucher"}
                  </Button>
                </div>
              ) : (
                <div className="p-5 border-2 border-dashed border-ink-900 bg-paper-50 space-y-4">
                  <div className="flex items-center justify-between border-b border-paper-200 pb-2">
                    <span className="text-xs font-mono font-bold uppercase text-ink-900">
                      Agency Cash Voucher #{agencyVoucherResult.paycode}
                    </span>
                    <span className="text-xs text-success font-semibold">Active & Ready</span>
                  </div>

                  {/* Simulated SVG Barcode Art */}
                  <div className="bg-white p-4 border border-paper-300 text-center space-y-2">
                    <div className="h-14 w-full flex items-center justify-center gap-1">
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 2, 1, 3, 2, 1, 3].map((w, i) => (
                        <div key={i} className="bg-ink-900 h-full" style={{ width: `${w * 3}px` }} />
                      ))}
                    </div>
                    <span className="font-mono text-sm tracking-widest text-ink-900 block font-bold">
                      {agencyVoucherResult.paycode}
                    </span>
                  </div>

                  <div className="text-xs font-mono bg-paper-100 p-3 border border-paper-200 space-y-1">
                    <div className="flex justify-between">
                      <span>Collector Name:</span>
                      <span className="font-bold text-ink-900">{agencyRecipient}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cash to Receive:</span>
                      <span className="font-bold text-emerald-800">${parseFloat(agencyAmount).toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redemption PIN:</span>
                      <span className="font-bold text-vermilion-700">{agencyPin}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-none flex-1 text-xs" onClick={() => window.print()}>
                      <Printer className="w-3.5 h-3.5 mr-1" /> Print Voucher
                    </Button>
                    <Button
                      className="rounded-none flex-1 bg-ink-900 text-white text-xs"
                      onClick={() => setAgencyVoucherResult(null)}
                    >
                      Issue Another Voucher
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <aside className="border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                Retail Cashier Network
              </span>
              <h4 className="font-display text-base font-bold text-ink-900">
                Pick Up Cash While Shopping
              </h4>
              <p className="text-small text-ink-700">
                Partnered with national supermarkets, pharmacies, and postal agencies. Simply show this digital barcode to the cashier at checkout or the customer service desk to receive physical cash.
              </p>
              <div className="text-xs space-y-1 text-ink-600">
                <p>• Accepted at Walmart MoneyCenter</p>
                <p>• Accepted at CVS & Walgreens Register</p>
                <p>• Accepted at Post Office Cash Counters</p>
              </div>
            </aside>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PRE-STAGED BRANCH TELLER CASH ORDER                                */}
        {/* ========================================================================= */}
        {activeTab === "pre_staged_counter" && (
          <motion.div
            key="tab-teller"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="grid overflow-hidden border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm"
          >
            <div className="p-5 sm:p-8 space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">
                  Express Pick-Up
                </h3>
                <p className="text-small text-ink-600 mt-0.5">
                  Reserve high-value cash sums ($1,000 – $50,000) and specify preferred currency note denominations for express teller pickup.
                </p>
              </div>

              {!tellerSuccessRef ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      Pick-up Branch Vault
                    </label>
                    <select
                      value={tellerLocation}
                      onChange={(e) => setTellerLocation(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-paper-50 border border-paper-300 focus:outline-none focus:border-ink-900"
                    >
                      <option value="Downtown Main Vault (48 Wall St)">Downtown Main Vault (48 Wall St, New York)</option>
                      <option value="Midtown Commercial Hub (550 5th Ave)">Midtown Commercial Hub (550 5th Ave, New York)</option>
                      <option value="Hudson Yards Private Client Suite">Hudson Yards Private Client Suite (20 Hudson Yards)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      Total Cash Sum (USD) *
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="500"
                      value={tellerAmount}
                      onChange={(e) => setTellerAmount(e.target.value)}
                      className="w-full px-3 py-2 text-base font-mono font-bold bg-white border border-paper-300 focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      Requested Note Denominations
                    </label>
                    <select
                      value={tellerDenominations}
                      onChange={(e) => setTellerDenominations(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-paper-50 border border-paper-300 focus:outline-none focus:border-ink-900"
                    >
                      <option value="Crisp new $100 bills exclusively">Crisp new $100 bills exclusively (Serialized bands)</option>
                      <option value="Mix of $100 and $50 crisp notes">Mix of $100 and $50 crisp notes</option>
                      <option value="Mix of $50 and $20 notes">Mix of $50 and $20 notes (Everyday liquidity)</option>
                      <option value="International Foreign Currencies (EUR / GBP)">International Foreign Currencies (EUR / GBP)</option>
                    </select>
                  </div>

                  <Button
                    onClick={handleExecuteTellerOrder}
                    disabled={isSubmittingTeller || !tellerAmount}
                    className="w-full bg-ink-900 text-white hover:bg-black rounded-none h-11"
                  >
                    {isSubmittingTeller ? "Pre-Staging Vault Order..." : `Reserve Cash Bundle ($${parseFloat(tellerAmount || "0").toLocaleString()})`}
                  </Button>
                </div>
              ) : (
                <div className="p-5 border border-success/30 bg-success-bg/20 space-y-4">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-6 h-6" />
                    <h4 className="font-display text-base font-bold">Teller Order Pre-Staged</h4>
                  </div>
                  <p className="text-small text-ink-700">
                    Your cash bundle of <strong>${parseFloat(tellerAmount).toLocaleString()} USD</strong> has been reserved at <strong>{tellerLocation}</strong>. Present your express order slip and photo ID to bypass the queue.
                  </p>
                  <div className="font-mono text-xs bg-white p-3 border border-paper-300">
                    Order Reference: <strong>{tellerSuccessRef}</strong>
                  </div>
                  <Button variant="outline" className="w-full rounded-none" onClick={() => setTellerSuccessRef(null)}>
                    Reserve Another Order
                  </Button>
                </div>
              )}
            </div>

            <aside className="border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                White-Glove Vault Service
              </span>
              <h4 className="font-display text-base font-bold text-ink-900">
                Express Teller Pick-Up
              </h4>
              <p className="text-small text-ink-700">
                Avoid branch cash-shortages and long counting lines. Pre-staged cash bundles are counted, strapped, and sealed by vault personnel prior to your arrival.
              </p>
            </aside>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CERTIFIED CASHIER'S CHEQUE DELIVERY BY COURIER                     */}
        {/* ========================================================================= */}
        {activeTab === "cashiers_check" && (
          <motion.div
            key="tab-check"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="grid overflow-hidden border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm"
          >
            <div className="p-5 sm:p-8 space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">
                  Certified Bank draft
                </h3>
                <p className="text-small text-ink-600 mt-0.5">
                  Order a certified bank draft guaranteed by Heritage Trust, dispatched directly to your physical address via tracked Priority Courier (FedEx / DHL).
                </p>
              </div>

              {!checkSuccessRef ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      Check Payable To (Payee Name) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. First National Title & Escrow LLC"
                      value={checkPayee}
                      onChange={(e) => setCheckPayee(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-paper-300 focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      Check Amount (USD) *
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={checkAmount}
                      onChange={(e) => setCheckAmount(e.target.value)}
                      className="w-full px-3 py-2 text-base font-mono font-bold bg-white border border-paper-300 focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 block mb-1">
                      Priority Courier Delivery Address *
                    </label>
                    <input
                      type="text"
                      value={checkAddress}
                      onChange={(e) => setCheckAddress(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-paper-300 focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <Button
                    onClick={handleExecuteCheckOrder}
                    disabled={isSubmittingCheck || !checkAmount || !checkPayee}
                    className="w-full bg-ink-900 text-white hover:bg-black rounded-none h-11"
                  >
                    {isSubmittingCheck ? "Processing Bank Draft..." : `Dispatch Certified Draft ($${parseFloat(checkAmount || "0").toLocaleString()})`}
                  </Button>
                </div>
              ) : (
                <div className="p-5 border border-success/30 bg-success-bg/20 space-y-4">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-6 h-6" />
                    <h4 className="font-display text-base font-bold">Cashier's Check Dispatched</h4>
                  </div>
                  <p className="text-small text-ink-700">
                    Your guaranteed cashier's draft of <strong>${parseFloat(checkAmount).toLocaleString()} USD</strong> made payable to <strong>{checkPayee}</strong> has been debited and queued for overnight courier dispatch to <strong>{checkAddress}</strong>.
                  </p>
                  <div className="font-mono text-xs bg-white p-3 border border-paper-300">
                    Draft Tracking Reference: <strong>{checkSuccessRef}</strong>
                  </div>
                  <Button variant="outline" className="w-full rounded-none" onClick={() => setCheckSuccessRef(null)}>
                    Order Another Draft
                  </Button>
                </div>
              )}
            </div>

            <aside className="border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                Certified Bank Drafts
              </span>
              <h4 className="font-display text-base font-bold text-ink-900">
                Escrow & Real Estate Closings
              </h4>
              <p className="text-small text-ink-700">
                Official cashier checks are guaranteed by the bank's general depository balance, satisfying strict requirements for home closings, vehicle title acquisitions, and institutional escrows.
              </p>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
