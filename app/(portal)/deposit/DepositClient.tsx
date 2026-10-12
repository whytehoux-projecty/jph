"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  Building2,
  Camera,
  CreditCard,
  Wallet,
  ChevronLeft,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Printer,
  QrCode,
  Sparkles,
  RefreshCw,
  MapPin,
  ExternalLink,
  Coins,
  FileCheck,
  Download,
  AlertCircle,
  Eye,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { fmtMoney } from "@/lib/transfer-forms/validators";
import { toast } from "@/lib/toast";
import {
  submitDeposit,
  type BankRoutingDetails,
  type CryptoDepositConfig,
  type DepositLocation,
  type UserDepositPermissions,
} from "@/app/actions/deposits";

export interface AccountOption {
  id: string;
  name: string;
  accountType: string;
  balance: number;
  currency: string;
  accountNumber: string;
}

export interface RecentDepositItem {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  methodId: string | null;
  createdAt: string;
  accountType: string;
  accountNumber: string;
}

interface DepositClientProps {
  userPreferences: {
    language: string;
    currency: string;
    name: string;
  };
  accounts: AccountOption[];
  routingDetails: BankRoutingDetails;
  cryptoConfigs: CryptoDepositConfig[];
  locations: DepositLocation[];
  recentDeposits: RecentDepositItem[];
  permissions?: UserDepositPermissions;
}


type DepositTab = "cash" | "virtual" | "check" | "card" | "crypto";

export default function DepositClient({
  userPreferences,
  accounts,
  routingDetails,
  cryptoConfigs,
  locations,
  recentDeposits: initialRecentDeposits,
  permissions,
}: DepositClientProps) {
  const router = useRouter();

  const isDepositsGloballyEnabled = permissions ? permissions.enabled : true;
  const isMethodAllowed = (method: DepositTab) =>
    isDepositsGloballyEnabled && (permissions ? permissions.methods[method] !== false : true);

  // Available tabs order
  const tabsList: Array<{ id: DepositTab; label: string; icon: any }> = [
    { id: "cash", label: "Direct Cash Deposit", icon: Banknote },
    { id: "virtual", label: "Third Party / Virtual Deposit", icon: Building2 },
    { id: "check", label: "Check / Cheque Deposit", icon: Camera },
    { id: "card", label: "Credit / Debit Card Deposit", icon: CreditCard },
    { id: "crypto", label: "USDC / USDT Deposit", icon: Wallet },
  ];

  // Active Tab defaults to first allowed tab
  const [activeTab, setActiveTab] = React.useState<DepositTab>(() => {
    const firstAllowed = tabsList.find((t) => isMethodAllowed(t.id));
    return firstAllowed ? firstAllowed.id : "cash";
  });


  // Selected Target Account
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>(
    accounts[0]?.id || ""
  );
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // Recent deposits state for live updates
  const [recentDeposits, setRecentDeposits] = React.useState<RecentDepositItem[]>(
    initialRecentDeposits
  );

  // Copy state
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success({ title: "Copied to clipboard", description: `${label}: ${text}` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ---------------------------------------------------------------------------
  // SECTION 1: Direct Cash Deposit State
  // ---------------------------------------------------------------------------
  const [cashAmount, setCashAmount] = React.useState("");
  const [selectedLocationId, setSelectedLocationId] = React.useState(locations[0]?.id || "");
  const [isSubmittingCash, setIsSubmittingCash] = React.useState(false);
  const [cashVoucher, setCashVoucher] = React.useState<{
    voucherId: string;
    amount: string;
    account: string;
    locationName: string;
    locationAddress: string;
    expiresAt: string;
  } | null>(null);

  const handleGenerateCashVoucher = async () => {
    if (!cashAmount || parseFloat(cashAmount) <= 0) {
      toast.error({ title: "Invalid amount", description: "Please enter a valid cash deposit amount." });
      return;
    }
    setIsSubmittingCash(true);
    try {
      const loc = locations.find((l) => l.id === selectedLocationId) || locations[0];
      const res = await submitDeposit({
        accountId: selectedAccountId,
        method: "cash",
        amount: parseFloat(cashAmount),
        metadata: {
          locationId: loc.id,
          locationName: loc.name,
          locationAddress: loc.address,
        },
      });

      if (res.success && res.reference) {
        setCashVoucher({
          voucherId: res.reference,
          amount: cashAmount,
          account: `${selectedAccount?.accountType} ••••${selectedAccount?.accountNumber.slice(-4)}`,
          locationName: loc.name,
          locationAddress: `${loc.address}, ${loc.cityStateZip}`,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString(),
        });

        setRecentDeposits((prev) => [
          {
            id: res.id || Math.random().toString(),
            reference: res.reference!,
            amount: parseFloat(cashAmount),
            currency: "USD",
            status: "PENDING",
            description: `Cash Deposit Voucher · ${loc.name}`,
            methodId: "cash",
            createdAt: new Date().toISOString(),
            accountType: selectedAccount?.accountType || "CHECKING",
            accountNumber: selectedAccount?.accountNumber || "1234",
          },
          ...prev,
        ]);

        toast.success({
          title: "Cash Deposit Voucher Generated",
          description: `Voucher ${res.reference} is ready for branch presentation.`,
        });
      }
    } catch {
      toast.error({ title: "Voucher generation failed", description: "Please try again." });
    } finally {
      setIsSubmittingCash(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SECTION 2: Third Party / Virtual Deposit State
  // ---------------------------------------------------------------------------
  const [incomingSender, setIncomingSender] = React.useState("");
  const [expectedAmount, setExpectedAmount] = React.useState("");
  const [isRecordingVirtual, setIsRecordingVirtual] = React.useState(false);
  const [virtualRecorded, setVirtualRecorded] = React.useState(false);

  const handleRecordExpectedDeposit = async () => {
    if (!expectedAmount || parseFloat(expectedAmount) <= 0) {
      toast.error({ title: "Invalid amount", description: "Please enter expected wire amount." });
      return;
    }
    setIsRecordingVirtual(true);
    try {
      const res = await submitDeposit({
        accountId: selectedAccountId,
        method: "virtual",
        amount: parseFloat(expectedAmount),
        description: `Incoming Virtual ACH/Wire from ${incomingSender || "External Party"}`,
        metadata: {
          senderName: incomingSender || "Third Party Remitter",
          channel: "ACH_WIRE_ROUTING",
        },
      });

      if (res.success && res.reference) {
        setVirtualRecorded(true);
        setRecentDeposits((prev) => [
          {
            id: res.id || Math.random().toString(),
            reference: res.reference!,
            amount: parseFloat(expectedAmount),
            currency: "USD",
            status: "PENDING",
            description: `Incoming Wire · ${incomingSender || "Third Party"}`,
            methodId: "virtual",
            createdAt: new Date().toISOString(),
            accountType: selectedAccount?.accountType || "CHECKING",
            accountNumber: selectedAccount?.accountNumber || "1234",
          },
          ...prev,
        ]);
        toast.success({
          title: "Incoming Remittance Registered",
          description: `Tracking code ${res.reference} initialized. Funds will credit upon wire arrival.`,
        });
      }
    } catch {
      toast.error({ title: "Registration failed", description: "Please try again." });
    } finally {
      setIsRecordingVirtual(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SECTION 3: Check / Cheque Deposit State
  // ---------------------------------------------------------------------------
  const [checkAmount, setCheckAmount] = React.useState("");
  const [checkNumber, setCheckNumber] = React.useState("");
  const [checkIssuer, setCheckIssuer] = React.useState("");
  const [frontImage, setFrontImage] = React.useState<File | null>(null);
  const [backImage, setBackImage] = React.useState<File | null>(null);
  const [isSubmittingCheck, setIsSubmittingCheck] = React.useState(false);
  const [checkReceipt, setCheckReceipt] = React.useState<{
    reference: string;
    amount: string;
    checkNo: string;
    issuer: string;
    account: string;
    date: string;
  } | null>(null);

  const handleLoadSampleCheck = () => {
    const blob1 = new Blob(["sample check front"], { type: "image/jpeg" });
    const blob2 = new Blob(["sample check back endorsed"], { type: "image/jpeg" });
    setFrontImage(new File([blob1], "check-front-official.jpg", { type: "image/jpeg" }));
    setBackImage(new File([blob2], "check-back-endorsed.jpg", { type: "image/jpeg" }));
    setCheckAmount("850.00");
    setCheckNumber("1084");
    setCheckIssuer("Apex Corporate Solutions Inc.");
    toast.success({ title: "Sample Check Loaded", description: "Front, back, and routing populated." });
  };

  const handleSubmitCheckDeposit = async () => {
    if (!checkAmount || parseFloat(checkAmount) <= 0 || !frontImage || !backImage) {
      toast.error({ title: "Missing fields", description: "Please upload both check images and state amount." });
      return;
    }
    setIsSubmittingCheck(true);
    try {
      const res = await submitDeposit({
        accountId: selectedAccountId,
        method: "check",
        amount: parseFloat(checkAmount),
        metadata: {
          checkNumber: checkNumber || "CHK-" + Math.floor(1000 + Math.random() * 9000),
          issuer: checkIssuer || "Commercial Check",
          frontFileName: frontImage.name,
          backFileName: backImage.name,
        },
      });

      if (res.success && res.reference) {
        setCheckReceipt({
          reference: res.reference,
          amount: checkAmount,
          checkNo: checkNumber || "CHK-1084",
          issuer: checkIssuer || "Commercial Issuer",
          account: `${selectedAccount?.accountType} ••••${selectedAccount?.accountNumber.slice(-4)}`,
          date: new Date().toLocaleString(),
        });

        setRecentDeposits((prev) => [
          {
            id: res.id || Math.random().toString(),
            reference: res.reference!,
            amount: parseFloat(checkAmount),
            currency: "USD",
            status: "PENDING",
            description: `Mobile Check Deposit #${checkNumber || "CHK"} · ${checkIssuer || "Issuer"}`,
            methodId: "check",
            createdAt: new Date().toISOString(),
            accountType: selectedAccount?.accountType || "CHECKING",
            accountNumber: selectedAccount?.accountNumber || "1234",
          },
          ...prev,
        ]);

        toast.success({
          title: "Check Submitted for Clearing",
          description: `Reference ${res.reference}. Provisional credit will reflect shortly.`,
        });
      }
    } catch {
      toast.error({ title: "Check deposit failed", description: "Please try again." });
    } finally {
      setIsSubmittingCheck(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SECTION 4: Credit / Debit Card Deposit State
  // ---------------------------------------------------------------------------
  const [cardAmount, setCardAmount] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardName, setCardName] = React.useState(userPreferences.name);
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCvv, setCardCvv] = React.useState("");
  const [cardZip, setCardZip] = React.useState("");
  const [isSubmittingCard, setIsSubmittingCard] = React.useState(false);
  const [cardReceipt, setCardReceipt] = React.useState<{
    reference: string;
    amount: string;
    cardLast4: string;
    account: string;
    date: string;
  } | null>(null);

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(" ") : raw);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleSubmitCardDeposit = async () => {
    if (!cardAmount || parseFloat(cardAmount) <= 0 || !cardNumber || !cardExpiry || !cardCvv) {
      toast.error({ title: "Incomplete card details", description: "Please complete all payment card fields." });
      return;
    }
    setIsSubmittingCard(true);
    try {
      await new Promise((r) => setTimeout(r, 1200)); // 3D secure simulation
      const res = await submitDeposit({
        accountId: selectedAccountId,
        method: "card",
        amount: parseFloat(cardAmount),
        metadata: {
          cardLast4: cardNumber.replace(/\s/g, "").slice(-4),
          cardholderName: cardName,
          channel: "3DS_CARD_GATEWAY",
        },
      });

      if (res.success && res.reference) {
        setCardReceipt({
          reference: res.reference,
          amount: cardAmount,
          cardLast4: cardNumber.replace(/\s/g, "").slice(-4) || "4242",
          account: `${selectedAccount?.accountType} ••••${selectedAccount?.accountNumber.slice(-4)}`,
          date: new Date().toLocaleString(),
        });

        setRecentDeposits((prev) => [
          {
            id: res.id || Math.random().toString(),
            reference: res.reference!,
            amount: parseFloat(cardAmount),
            currency: "USD",
            status: "APPROVED",
            description: `Card Top-Up (••••${cardNumber.replace(/\s/g, "").slice(-4) || "4242"})`,
            methodId: "card",
            createdAt: new Date().toISOString(),
            accountType: selectedAccount?.accountType || "CHECKING",
            accountNumber: selectedAccount?.accountNumber || "1234",
          },
          ...prev,
        ]);

        toast.success({
          title: "Card Top-Up Successful",
          description: `$${cardAmount} credited immediately via 3D Secure Rail.`,
        });
      }
    } catch {
      toast.error({ title: "Card authorization failed", description: "Please verify card credentials." });
    } finally {
      setIsSubmittingCard(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SECTION 5: USDC / USDT Stablecoin Deposit State
  // ---------------------------------------------------------------------------
  const [selectedToken, setSelectedToken] = React.useState<"USDC" | "USDT">("USDC");
  const availableConfigs = cryptoConfigs.filter((c) => c.token === selectedToken);
  const [selectedNetwork, setSelectedNetwork] = React.useState(availableConfigs[0]?.network || "ERC20");

  React.useEffect(() => {
    const cfg = cryptoConfigs.find((c) => c.token === selectedToken);
    if (cfg) setSelectedNetwork(cfg.network);
  }, [selectedToken, cryptoConfigs]);

  const activeCryptoConfig =
    cryptoConfigs.find((c) => c.token === selectedToken && c.network === selectedNetwork) ||
    availableConfigs[0];

  const [txHashInput, setTxHashInput] = React.useState("");
  const [cryptoAmountInput, setCryptoAmountInput] = React.useState("");
  const [isSubmittingCrypto, setIsSubmittingCrypto] = React.useState(false);
  const [cryptoTrackReceipt, setCryptoTrackReceipt] = React.useState<{
    reference: string;
    token: string;
    network: string;
    txHash: string;
    amount: string;
  } | null>(null);

  const handleSubmitCryptoTx = async () => {
    if (!txHashInput.trim() || !cryptoAmountInput || parseFloat(cryptoAmountInput) <= 0) {
      toast.error({ title: "Missing TxID or amount", description: "Please enter transaction hash and sent amount." });
      return;
    }
    setIsSubmittingCrypto(true);
    try {
      const res = await submitDeposit({
        accountId: selectedAccountId,
        method: "crypto",
        amount: parseFloat(cryptoAmountInput),
        currency: "USD",
        description: `${selectedToken} (${activeCryptoConfig?.networkLabel}) Deposit`,
        metadata: {
          token: selectedToken,
          network: activeCryptoConfig?.network,
          txHash: txHashInput.trim(),
          depositAddress: activeCryptoConfig?.address,
        },
      });

      if (res.success && res.reference) {
        setCryptoTrackReceipt({
          reference: res.reference,
          token: selectedToken,
          network: activeCryptoConfig?.networkLabel || "ERC-20",
          txHash: txHashInput.trim(),
          amount: cryptoAmountInput,
        });

        setRecentDeposits((prev) => [
          {
            id: res.id || Math.random().toString(),
            reference: res.reference!,
            amount: parseFloat(cryptoAmountInput),
            currency: "USD",
            status: "PENDING",
            description: `${selectedToken} On-Chain Deposit · ${activeCryptoConfig?.networkLabel}`,
            methodId: "crypto",
            createdAt: new Date().toISOString(),
            accountType: selectedAccount?.accountType || "CHECKING",
            accountNumber: selectedAccount?.accountNumber || "1234",
          },
          ...prev,
        ]);

        toast.success({
          title: "Blockchain Deposit Registered",
          description: `Tracking ${selectedToken} transfer. Crediting automatically upon confirmation.`,
        });
      }
    } catch {
      toast.error({ title: "Registration failed", description: "Please verify transaction hash." });
    } finally {
      setIsSubmittingCrypto(false);
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
        <h1 className="font-display text-h2 font-bold text-ink-900">Deposits</h1>
        <p className="max-w-2xl text-body text-ink-700">
          Fund your Heritage Trust vault accounts through verified physical cash drop-off, virtual ACH/wire routing, mobile check imaging, instant debit cards, or institutional stablecoins.
        </p>
      </header>

      {/* Main Container */}
      <div className="p-6 sm:p-8 space-y-8 bg-white">
        {!isDepositsGloballyEnabled && (
          <div className="p-4 rounded-none border border-amber-300 bg-amber-50 text-amber-950 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Deposit Facilities Restricted</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Inbound deposit services are temporarily disabled for your account profile. For institutional routing clearance or limit enhancements, please contact your private relationship manager.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          {/* Sub-Sections Folder Tab Navigation matching TransferHub */}
          <div
            role="tablist"
            aria-label="Deposit methods"
            className="flex items-end gap-1 overflow-x-auto scrollbar-hide border-b border-paper-300"
          >
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              const isAllowed = isMethodAllowed(tab.id);

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isSelected}
                  className={cn(
                    "shrink-0 px-5 py-2.5 rounded-none text-[13px] transition-all duration-150 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-1 flex items-center gap-2 -mb-[1px] cursor-pointer",
                    isSelected
                      ? "bg-white text-ink-900 border border-paper-300 border-b-white font-semibold"
                      : "text-ink-500 hover:text-ink-900 hover:bg-paper-100 border border-transparent border-b-transparent",
                    !isAllowed && "opacity-75"
                  )}
                  onClick={() => setActiveTab(tab.id as DepositTab)}
                >
                  <Icon className={cn("h-4 w-4", isSelected ? "text-ink-900" : "text-ink-500")} />
                  <span>{tab.label}</span>
                  {!isAllowed && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-paper-200 text-ink-600 px-1.5 py-0.5 rounded uppercase font-semibold">
                      <Lock className="h-2.5 w-2.5" /> Locked
                    </span>
                  )}
                </button>
              );
            })}
          </div>


          {/* Master Content Panel */}
          <div id="deposits-panel" role="tabpanel">
            <AnimatePresence mode="wait">
              {/* ================================================================= */}
              {/* TAB 1: Direct Cash Deposit                                        */}
              {/* ================================================================= */}
              {activeTab === "cash" && (
                <motion.div
                  key="tab-cash"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="grid overflow-hidden rounded-none border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm">
                    {/* Left Column: Form & Voucher Engine */}
                    <div className="p-5 sm:p-8 flex flex-col justify-between">
                      {!cashVoucher ? (
                        <div className="space-y-6">
                          <div>
                            <h2 className="font-display text-lg font-bold text-ink-900">
                              Direct Cash Deposit Voucher
                            </h2>
                            <p className="text-small text-ink-600 mt-0.5">
                              Generate a verified digital cash deposit slip for drop-off at authorized Heritage branch vaults and partner Smart ATMs.
                            </p>
                          </div>

                          {/* Account Picker */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Credit To Vault Account
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
                                      <p className="text-[11px] text-ink-500">Balance</p>
                                      <p className="font-mono text-small font-semibold text-ink-900">
                                        {fmtMoney(acc.balance, acc.currency)}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Amount Input */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                                Cash Deposit Amount (USD)
                              </label>
                              <span className="text-[11px] text-success font-semibold">No Cash Surcharge</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-ink-500 font-mono text-base">$</span>
                              <input
                                type="number"
                                step="10"
                                placeholder="0.00"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                className="w-full pl-8 pr-3.5 py-2.5 text-lg font-mono font-bold rounded-none border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              {["100", "500", "1000", "2500", "5000"].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setCashAmount(preset)}
                                  className="px-2.5 py-1 text-xs font-mono border border-paper-300 bg-paper-50 hover:bg-paper-100 text-ink-700 cursor-pointer"
                                >
                                  +${preset}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Branch Vault / Location Selector */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Select Drop-Off Vault or Smart ATM Location
                            </label>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {locations.map((loc) => {
                                const isSelected = loc.id === selectedLocationId;
                                return (
                                  <button
                                    key={loc.id}
                                    type="button"
                                    onClick={() => setSelectedLocationId(loc.id)}
                                    className={cn(
                                      "w-full p-3 border rounded-none text-left transition-all flex items-start justify-between cursor-pointer outline-none",
                                      isSelected
                                        ? "bg-white border-ink-900 ring-1 ring-ink-900 shadow-xs"
                                        : "bg-paper-50 border-paper-300 hover:bg-paper-100"
                                    )}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={cn(
                                          "p-2 rounded-none mt-0.5",
                                          loc.type === "BRANCH_VAULT"
                                            ? "bg-ink-900 text-paper-50"
                                            : "bg-paper-200 text-ink-700"
                                        )}
                                      >
                                        <MapPin className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <span className="font-semibold text-small text-ink-900 block leading-tight">
                                          {loc.name}
                                        </span>
                                        <span className="text-xs text-ink-600 block mt-0.5">
                                          {loc.address}, {loc.cityStateZip}
                                        </span>
                                        <span className="text-[11px] font-mono text-ink-500 block mt-0.5">
                                          {loc.hours}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-paper-100 border border-paper-300 text-ink-700">
                                      {loc.distance}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button
                              className="w-full h-11 bg-vermilion-600 hover:bg-vermilion-700 text-white rounded-none font-semibold"
                              disabled={isSubmittingCash || !cashAmount || parseFloat(cashAmount) <= 0}
                              onClick={handleGenerateCashVoucher}
                            >
                              {isSubmittingCash ? (
                                <span className="flex items-center gap-2">
                                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating Slip...
                                </span>
                              ) : (
                                "Generate Digital Cash Deposit Voucher →"
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Generated Cash Voucher Display */
                        <div className="space-y-6 py-2 animate-in zoom-in-95">
                          <div className="border border-paper-300 bg-paper-50 p-6 space-y-4">
                            <div className="flex justify-between items-start border-b border-paper-200 pb-4">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-ink-500 block">
                                  Heritage Trust Bank · Official Deposit Voucher
                                </span>
                                <h3 className="font-display text-xl font-bold text-ink-900 mt-1">
                                  Cash Remittance Slip
                                </h3>
                              </div>
                              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-ink-900 text-white">
                                {cashVoucher.voucherId}
                              </span>
                            </div>

                            {/* Stylized Barcode Graphic */}
                            <div className="bg-white p-4 border border-paper-300 text-center space-y-2">
                              <div className="h-14 w-full flex items-center justify-center gap-1.5 px-4">
                                {[3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 3, 2].map(
                                  (w, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-ink-900 h-full"
                                      style={{ width: `${w * 2}px` }}
                                    />
                                  )
                                )}
                              </div>
                              <p className="font-mono text-xs text-ink-600 tracking-widest">
                                *{cashVoucher.voucherId}*
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
                              <div>
                                <span className="text-ink-500 uppercase block">Deposit Amount:</span>
                                <span className="text-base font-bold text-ink-900">
                                  ${parseFloat(cashVoucher.amount).toFixed(2)} USD
                                </span>
                              </div>
                              <div>
                                <span className="text-ink-500 uppercase block">Target Account:</span>
                                <span className="text-small font-semibold text-ink-900">
                                  {cashVoucher.account}
                                </span>
                              </div>
                              <div className="col-span-2 pt-2 border-t border-paper-200">
                                <span className="text-ink-500 uppercase block">Present At Location:</span>
                                <span className="font-semibold text-ink-900 block">{cashVoucher.locationName}</span>
                                <span className="text-ink-600 text-[11px]">{cashVoucher.locationAddress}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-ink-500 uppercase block">Voucher Valid Through:</span>
                                <span className="text-ink-700">{cashVoucher.expiresAt}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="rounded-none flex-1"
                              onClick={() => window.print()}
                            >
                              <Printer className="w-4 h-4 mr-1.5" /> Print Deposit Slip
                            </Button>
                            <Button
                              className="rounded-none flex-1 bg-ink-900 text-paper-50 hover:bg-black"
                              onClick={() => {
                                setCashVoucher(null);
                                setCashAmount("");
                              }}
                            >
                              Create Another Voucher
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: InfoPanel */}
                    <aside
                      aria-label="About Cash Deposits"
                      className="space-y-5 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                    >
                      <div className="space-y-5">
                        <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                          <svg viewBox="0 0 280 130" className="h-auto w-full" role="img" aria-label="Cash Deposit Art">
                            <rect width="280" height="130" fill="#FBF9F4" />
                            {/* Vault door icon */}
                            <circle cx="80" cy="65" r="42" fill="#14181F" />
                            <circle cx="80" cy="65" r="34" fill="none" stroke="#B8893B" strokeWidth="2.5" />
                            <circle cx="80" cy="65" r="12" fill="#F6F1E7" />
                            <path d="M80 35v12M80 83v12M50 65h12M98 65h12" stroke="#B8893B" strokeWidth="3" />
                            {/* Stacks of currency */}
                            <rect x="150" y="45" width="85" height="16" fill="#1F4D3F" rx="2" />
                            <rect x="156" y="65" width="85" height="16" fill="#1F4D3F" rx="2" />
                            <rect x="162" y="85" width="85" height="16" fill="#1F4D3F" rx="2" />
                            <circle cx="192" cy="53" r="4" fill="#F6F1E7" />
                            <circle cx="198" cy="73" r="4" fill="#F6F1E7" />
                            <circle cx="204" cy="93" r="4" fill="#F6F1E7" />
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-display text-base font-semibold text-ink-900">
                            Cash Vault Drop-Off
                          </h3>
                          <p className="text-small text-ink-700">
                            Heritage Trust maintains secure physical cash intake points across commercial financial centers and intelligent 24/7 Smart ATM vaults.
                          </p>
                        </div>

                        <ol className="space-y-2.5" aria-label="How it works">
                          {[
                            "Input cash amount and generate an encrypted voucher slip.",
                            "Visit any designated branch vault teller or Smart ATM.",
                            "Scan the voucher barcode; banknotes are counted and credited instantly.",
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
                          <span>Deposit Availability:</span>
                          <span className="font-semibold text-ink-900">Instant Clearing</span>
                        </div>
                        <div className="flex justify-between">
                          <span>FDIC Coverage:</span>
                          <span className="font-semibold text-ink-900">Insured to $250,000</span>
                        </div>
                      </div>
                    </aside>
                  </div>
                </motion.div>
              )}

              {/* ================================================================= */}
              {/* TAB 2: Third Party / Virtual Deposit                              */}
              {/* ================================================================= */}
              {activeTab === "virtual" && (
                <motion.div
                  key="tab-virtual"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="grid overflow-hidden rounded-none border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm">
                    {/* Left Column: Bank Routing Specs & Wire Coordinates */}
                    <div className="p-5 sm:p-8 flex flex-col justify-between space-y-6">
                      <div className="space-y-6">
                        <div>
                          <h2 className="font-display text-lg font-bold text-ink-900">
                            Third-Party & Virtual ACH / Wire Routing
                          </h2>
                          <p className="text-small text-ink-600 mt-0.5">
                            Share these official banking coordinates with employers, payroll systems, corporate clients, or external financial institutions to receive funds directly into your account.
                          </p>
                        </div>

                        {/* Account Picker */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                            Beneficiary Vault Account
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
                                    <p className="text-[11px] text-ink-500">Balance</p>
                                    <p className="font-mono text-small font-semibold text-ink-900">
                                      {fmtMoney(acc.balance, acc.currency)}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Direct Routing Coordinates Table */}
                        <div className="border border-paper-300 bg-paper-50 divide-y divide-paper-200">
                          <div className="p-3.5 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                                Account Beneficiary Name
                              </span>
                              <span className="font-semibold text-small text-ink-900">
                                {userPreferences.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="small"
                              className="h-8 text-xs font-mono"
                              onClick={() => copyToClipboard(userPreferences.name, "Beneficiary Name")}
                            >
                              {copiedField === "Beneficiary Name" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="ml-1">Copy</span>
                            </Button>
                          </div>

                          <div className="p-3.5 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                                Depository Institution Name
                              </span>
                              <span className="font-semibold text-small text-ink-900">
                                {routingDetails.bankName}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="small"
                              className="h-8 text-xs font-mono"
                              onClick={() => copyToClipboard(routingDetails.bankName, "Bank Name")}
                            >
                              {copiedField === "Bank Name" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="ml-1">Copy</span>
                            </Button>
                          </div>

                          <div className="p-3.5 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                                Domestic Routing (ABA / ACH - 9 digits)
                              </span>
                              <span className="font-mono font-bold text-small text-ink-900">
                                {routingDetails.achRouting}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="small"
                              className="h-8 text-xs font-mono"
                              onClick={() => copyToClipboard(routingDetails.achRouting, "ACH Routing")}
                            >
                              {copiedField === "ACH Routing" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="ml-1">Copy</span>
                            </Button>
                          </div>

                          <div className="p-3.5 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                                Full Account Number
                              </span>
                              <span className="font-mono font-bold text-small text-ink-900">
                                {selectedAccount?.accountNumber}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="small"
                              className="h-8 text-xs font-mono"
                              onClick={() => copyToClipboard(selectedAccount?.accountNumber || "", "Account Number")}
                            >
                              {copiedField === "Account Number" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="ml-1">Copy</span>
                            </Button>
                          </div>

                          <div className="p-3.5 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                                Wire Routing Number (Fedwire)
                              </span>
                              <span className="font-mono font-semibold text-small text-ink-900">
                                {routingDetails.wireRouting}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="small"
                              className="h-8 text-xs font-mono"
                              onClick={() => copyToClipboard(routingDetails.wireRouting, "Wire Routing")}
                            >
                              {copiedField === "Wire Routing" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="ml-1">Copy</span>
                            </Button>
                          </div>

                          <div className="p-3.5 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                                International SWIFT / BIC Code
                              </span>
                              <span className="font-mono font-semibold text-small text-ink-900">
                                {routingDetails.swiftBic}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="small"
                              className="h-8 text-xs font-mono"
                              onClick={() => copyToClipboard(routingDetails.swiftBic, "SWIFT/BIC")}
                            >
                              {copiedField === "SWIFT/BIC" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="ml-1">Copy</span>
                            </Button>
                          </div>
                        </div>

                        {/* Optional: Pre-announce Incoming Deposit */}
                        <div className="border border-paper-300 bg-white p-4 space-y-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-ink-900 block">
                            Pre-Register Expected Incoming Wire / Remittance
                          </span>
                          <p className="text-xs text-ink-600">
                            Pre-registering an expected transfer accelerates automated reconciliation and instant crediting upon bank settlement.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Sender Name / Corporate Remitter"
                              value={incomingSender}
                              onChange={(e) => setIncomingSender(e.target.value)}
                              className="px-3 py-2 text-xs border border-paper-300 bg-paper-50 rounded-none focus:outline-none focus:border-ink-900"
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Expected Amount (USD)"
                              value={expectedAmount}
                              onChange={(e) => setExpectedAmount(e.target.value)}
                              className="px-3 py-2 text-xs font-mono border border-paper-300 bg-paper-50 rounded-none focus:outline-none focus:border-ink-900"
                            />
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button
                              size="small"
                              className="rounded-none bg-ink-900 text-paper-50"
                              disabled={isRecordingVirtual || !expectedAmount || parseFloat(expectedAmount) <= 0}
                              onClick={handleRecordExpectedDeposit}
                            >
                              {isRecordingVirtual ? "Registering..." : "Pre-Register Remittance"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          variant="outline"
                          className="w-full h-11 rounded-none border-paper-300 font-semibold"
                          onClick={() => window.print()}
                        >
                          <Printer className="w-4 h-4 mr-1.5" /> Download Direct Deposit Authorization Slip (PDF)
                        </Button>
                      </div>
                    </div>

                    {/* Right Column: InfoPanel */}
                    <aside
                      aria-label="About Virtual Deposits"
                      className="space-y-5 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                    >
                      <div className="space-y-5">
                        <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                          <svg viewBox="0 0 280 130" className="h-auto w-full" role="img" aria-label="Virtual Routing Art">
                            <rect width="280" height="130" fill="#FBF9F4" />
                            {/* Central bank node */}
                            <path d="M40 70 80 40l40 30Z" fill="#14181F" />
                            <rect x="50" y="70" width="60" height="30" fill="#2E353B" />
                            <path d="M58 70v30M70 70v30M88 70v30M100 70v30" stroke="#F6F1E7" strokeWidth="2.5" />
                            {/* Electronic clearing lines */}
                            <path d="M120 75h55" stroke="#D8432B" strokeWidth="2.5" strokeDasharray="2 4" />
                            <path d="M170 68l7 7-7 7" stroke="#D8432B" strokeWidth="2.5" fill="none" />
                            {/* Vault receiver node */}
                            <rect x="180" y="44" width="70" height="60" fill="#1F4D3F" rx="3" />
                            <circle cx="215" cy="74" r="16" fill="none" stroke="#F6F1E7" strokeWidth="2" />
                            <path d="M215 64v20M205 74h20" stroke="#F6F1E7" strokeWidth="2" />
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-display text-base font-semibold text-ink-900">
                            Virtual ACH & Fedwire Rails
                          </h3>
                          <p className="text-small text-ink-700">
                            Your account is assigned direct Fedwire, ACH, and SWIFT transit coordinates for seamless electronic fund reception from anywhere in the world.
                          </p>
                        </div>

                        <ol className="space-y-2.5" aria-label="How it works">
                          {[
                            "Provide your account ABA routing and account number to the remitter.",
                            "For payroll, submit our direct deposit authorization slip.",
                            "Domestic ACH clears within 1-2 business days; Fedwire is credited same-day.",
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
                          <span>Early Direct Deposit:</span>
                          <span className="font-semibold text-ink-900">Up to 2 Days Early</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inbound Transfer Fee:</span>
                          <span className="font-semibold text-success">$0.00 (Zero Fee)</span>
                        </div>
                      </div>
                    </aside>
                  </div>
                </motion.div>
              )}

              {/* ================================================================= */}
              {/* TAB 3: Check / Cheque Deposit                                     */}
              {/* ================================================================= */}
              {activeTab === "check" && (
                <motion.div
                  key="tab-check"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="grid overflow-hidden rounded-none border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm">
                    {/* Left Column: Check Capture & Submission */}
                    <div className="p-5 sm:p-8 flex flex-col justify-between">
                      {!checkReceipt ? (
                        <div className="space-y-6">
                          <div className="flex justify-between items-start pb-2 border-b border-paper-200">
                            <div>
                              <h2 className="font-display text-lg font-bold text-ink-900">
                                Mobile Check Capture & Deposit
                              </h2>
                              <p className="text-small text-ink-600 mt-0.5">
                                Endorse the reverse of your physical check, capture high-contrast images of both sides, and submit for digital optical clearing.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={handleLoadSampleCheck}
                              className="rounded-none text-xs text-ink-700 hover:text-ink-900"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1 text-vintage-gold" />
                              Load Demo Check
                            </Button>
                          </div>

                          {/* Account Picker */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Deposit Check Into
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
                                      <p className="text-[11px] text-ink-500">Balance</p>
                                      <p className="font-mono text-small font-semibold text-ink-900">
                                        {fmtMoney(acc.balance, acc.currency)}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Check Amount & Routing Metadata */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-1 space-y-1.5">
                              <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                                Check Amount (USD)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-ink-500 font-mono text-small">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={checkAmount}
                                  onChange={(e) => setCheckAmount(e.target.value)}
                                  className="w-full pl-7 pr-3 py-2 text-small font-mono font-bold rounded-none border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-1 space-y-1.5">
                              <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                                Check Number
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 1084"
                                value={checkNumber}
                                onChange={(e) => setCheckNumber(e.target.value)}
                                className="w-full px-3 py-2 text-small font-mono rounded-none border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                              />
                            </div>

                            <div className="sm:col-span-1 space-y-1.5">
                              <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                                Check Issuer / Payer
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Apex Corporation"
                                value={checkIssuer}
                                onChange={(e) => setCheckIssuer(e.target.value)}
                                className="w-full px-3 py-2 text-small rounded-none border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                              />
                            </div>
                          </div>

                          {/* Dual Image Capture Boxes */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Front Image Box */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                                1. Front of Check
                              </span>
                              <div className="relative border-2 border-dashed border-paper-300 bg-paper-50 p-6 flex flex-col items-center justify-center text-center h-36 hover:border-ink-900 transition-colors cursor-pointer">
                                {frontImage ? (
                                  <div className="space-y-1">
                                    <CheckCircle2 className="w-6 h-6 text-success mx-auto" />
                                    <span className="text-xs font-semibold text-ink-900 block truncate max-w-[180px]">
                                      {frontImage.name}
                                    </span>
                                    <span className="text-[10px] text-ink-500 font-mono">Image Loaded</span>
                                  </div>
                                ) : (
                                  <>
                                    <Camera className="w-6 h-6 text-ink-500 mb-1" />
                                    <span className="text-xs font-semibold text-ink-900">Upload Front Side</span>
                                    <span className="text-[11px] text-ink-500">Capture flat on dark surface</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
                                />
                              </div>
                            </div>

                            {/* Back Image Box */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700 block">
                                2. Reverse / Endorsement
                              </span>
                              <div className="relative border-2 border-dashed border-paper-300 bg-paper-50 p-6 flex flex-col items-center justify-center text-center h-36 hover:border-ink-900 transition-colors cursor-pointer">
                                {backImage ? (
                                  <div className="space-y-1">
                                    <CheckCircle2 className="w-6 h-6 text-success mx-auto" />
                                    <span className="text-xs font-semibold text-ink-900 block truncate max-w-[180px]">
                                      {backImage.name}
                                    </span>
                                    <span className="text-[10px] text-ink-500 font-mono">Endorsement Verified</span>
                                  </div>
                                ) : (
                                  <>
                                    <FileCheck className="w-6 h-6 text-ink-500 mb-1" />
                                    <span className="text-xs font-semibold text-ink-900">Upload Reverse Side</span>
                                    <span className="text-[11px] text-ink-500">Must include signature & notice</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => setBackImage(e.target.files?.[0] || null)}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-paper-100 border border-paper-300 text-xs text-ink-700">
                            <strong>Required Endorsement:</strong> Sign your name and write{" "}
                            <span className="font-mono font-semibold text-ink-900">
                              &ldquo;For Mobile Deposit Only at Heritage Trust Bank&rdquo;
                            </span>{" "}
                            directly beneath your signature.
                          </div>

                          <div className="pt-2">
                            <Button
                              className="w-full h-11 bg-vermilion-600 hover:bg-vermilion-700 text-white rounded-none font-semibold"
                              disabled={
                                isSubmittingCheck ||
                                !checkAmount ||
                                parseFloat(checkAmount) <= 0 ||
                                !frontImage ||
                                !backImage
                              }
                              onClick={handleSubmitCheckDeposit}
                            >
                              {isSubmittingCheck ? (
                                <span className="flex items-center gap-2">
                                  <RefreshCw className="h-4 w-4 animate-spin" /> Transmitting Check Data...
                                </span>
                              ) : (
                                "Authorize & Submit Check Deposit →"
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Check Receipt Display */
                        <div className="space-y-6 py-2 animate-in zoom-in-95">
                          <div className="text-center space-y-2">
                            <div className="w-14 h-14 bg-success-bg border border-success/30 rounded-none mx-auto flex items-center justify-center text-success mb-3">
                              <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h2 className="font-display text-xl font-bold text-ink-900">
                              Check Deposit Transmitted!
                            </h2>
                            <p className="text-small text-ink-600 max-w-sm mx-auto">
                              Your check imaging data has been authenticated. Provisional clearing has been applied to your ledger.
                            </p>
                          </div>

                          <div className="border border-paper-300 bg-paper-50 p-5 space-y-3 font-mono text-xs">
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Audit Reference:</span>
                              <span className="font-bold text-ink-900">{checkReceipt.reference}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Check Number:</span>
                              <span className="font-semibold text-ink-900">#{checkReceipt.checkNo}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Check Issuer:</span>
                              <span className="text-ink-900">{checkReceipt.issuer}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Deposit Amount:</span>
                              <span className="font-bold text-ink-900 text-small">
                                ${parseFloat(checkReceipt.amount).toFixed(2)} USD
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ink-500 uppercase">Target Vault:</span>
                              <span className="text-ink-900">{checkReceipt.account}</span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="rounded-none flex-1"
                              onClick={() => window.print()}
                            >
                              <Printer className="w-4 h-4 mr-1.5" /> Print Check Receipt
                            </Button>
                            <Button
                              className="rounded-none flex-1 bg-ink-900 text-paper-50 hover:bg-black"
                              onClick={() => {
                                setCheckReceipt(null);
                                setCheckAmount("");
                                setFrontImage(null);
                                setBackImage(null);
                              }}
                            >
                              Deposit Another Check
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: InfoPanel */}
                    <aside
                      aria-label="About Check Deposits"
                      className="space-y-5 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                    >
                      <div className="space-y-5">
                        <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                          <svg viewBox="0 0 280 130" className="h-auto w-full" role="img" aria-label="Check Deposit Art">
                            <rect width="280" height="130" fill="#FBF9F4" />
                            {/* Check voucher template */}
                            <rect x="25" y="30" width="160" height="80" fill="#14181F" rx="2" />
                            <rect x="35" y="42" width="50" height="6" fill="#B8893B" rx="1" />
                            <rect x="35" y="58" width="100" height="4" fill="#5B646C" />
                            <rect x="35" y="72" width="70" height="4" fill="#5B646C" />
                            <rect x="140" y="54" width="35" height="16" fill="#F6F1E7" rx="1" />
                            {/* Camera scanner focus */}
                            <circle cx="215" cy="70" r="34" fill="#1F4D3F" />
                            <circle cx="215" cy="70" r="22" fill="#2E353B" />
                            <circle cx="215" cy="70" r="10" fill="#F6F1E7" />
                            <circle cx="218" cy="67" r="3" fill="#D8432B" />
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-display text-base font-semibold text-ink-900">
                            Check 21 Optical Clearing
                          </h3>
                          <p className="text-small text-ink-700">
                            Our Check 21 compliant imaging engine authenticates MICR ink routing and magnetic ink characters immediately upon image capture.
                          </p>
                        </div>

                        <ol className="space-y-2.5" aria-label="How it works">
                          {[
                            "Capture the front of the check and endorsed reverse.",
                            "Review extracted check amount and verify payer details.",
                            "Submit for settlement; up to $5,000 available same-day.",
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
                          <span>Daily Check Limit:</span>
                          <span className="font-semibold text-ink-900">$25,000.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Funds Availability:</span>
                          <span className="font-semibold text-ink-900">Next Business Morning</span>
                        </div>
                      </div>
                    </aside>
                  </div>
                </motion.div>
              )}

              {/* ================================================================= */}
              {/* TAB 4: Credit / Debit Card Deposit                                */}
              {/* ================================================================= */}
              {activeTab === "card" && (
                <motion.div
                  key="tab-card"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="grid overflow-hidden rounded-none border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm">
                    {/* Left Column: Card Top-up Form */}
                    <div className="p-5 sm:p-8 flex flex-col justify-between">
                      {!cardReceipt ? (
                        <div className="space-y-6">
                          <div>
                            <h2 className="font-display text-lg font-bold text-ink-900">
                              Credit / Debit Card Instant Top-Up
                            </h2>
                            <p className="text-small text-ink-600 mt-0.5">
                              Fund your vault account immediately using any Visa, Mastercard, or American Express debit or credit card.
                            </p>
                          </div>

                          {/* Account Picker */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Credit Vault Account
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
                                      <p className="text-[11px] text-ink-500">Balance</p>
                                      <p className="font-mono text-small font-semibold text-ink-900">
                                        {fmtMoney(acc.balance, acc.currency)}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Amount Input */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                                Top-Up Amount (USD)
                              </label>
                              <span className="text-[11px] text-success font-semibold">Immediate Availability</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-ink-500 font-mono text-base">$</span>
                              <input
                                type="number"
                                step="10"
                                placeholder="0.00"
                                value={cardAmount}
                                onChange={(e) => setCardAmount(e.target.value)}
                                className="w-full pl-8 pr-3.5 py-2.5 text-lg font-mono font-bold rounded-none border border-paper-300 bg-white focus:outline-none focus:border-ink-900"
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              {["100", "250", "500", "1000", "2500"].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setCardAmount(preset)}
                                  className="px-2.5 py-1 text-xs font-mono border border-paper-300 bg-paper-50 hover:bg-paper-100 text-ink-700 cursor-pointer"
                                >
                                  +${preset}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Card Information Fields */}
                          <div className="border border-paper-300 bg-paper-50 p-4 sm:p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-paper-200 pb-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-ink-900">
                                Payment Card Details
                              </span>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-ink-500 uppercase">
                                <Lock className="w-3 h-3 text-vintage-gold" />
                                <span>256-Bit SSL Encrypted</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-semibold uppercase text-ink-700 block">
                                Cardholder Full Name
                              </label>
                              <input
                                type="text"
                                placeholder="Name as on card"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className="w-full px-3 py-2 text-small bg-white rounded-none border border-paper-300 focus:outline-none focus:border-ink-900"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-semibold uppercase text-ink-700 block">
                                Card Number
                              </label>
                              <input
                                type="text"
                                placeholder="4000 1234 5678 9010"
                                value={cardNumber}
                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                className="w-full px-3 py-2 text-small font-mono bg-white rounded-none border border-paper-300 focus:outline-none focus:border-ink-900"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase text-ink-700 block">
                                  Expiry
                                </label>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => handleExpiryChange(e.target.value)}
                                  className="w-full px-3 py-2 text-small font-mono bg-white rounded-none border border-paper-300 focus:outline-none focus:border-ink-900"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase text-ink-700 block">
                                  CVV / CVC
                                </label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  placeholder="•••"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                                  className="w-full px-3 py-2 text-small font-mono bg-white rounded-none border border-paper-300 focus:outline-none focus:border-ink-900"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase text-ink-700 block">
                                  Billing Zip
                                </label>
                                <input
                                  type="text"
                                  placeholder="10005"
                                  value={cardZip}
                                  onChange={(e) => setCardZip(e.target.value)}
                                  className="w-full px-3 py-2 text-small font-mono bg-white rounded-none border border-paper-300 focus:outline-none focus:border-ink-900"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button
                              className="w-full h-11 bg-vermilion-600 hover:bg-vermilion-700 text-white rounded-none font-semibold"
                              disabled={
                                isSubmittingCard ||
                                !cardAmount ||
                                parseFloat(cardAmount) <= 0 ||
                                !cardNumber ||
                                !cardExpiry ||
                                !cardCvv
                              }
                              onClick={handleSubmitCardDeposit}
                            >
                              {isSubmittingCard ? (
                                <span className="flex items-center gap-2">
                                  <RefreshCw className="h-4 w-4 animate-spin" /> Authorizing 3D Secure Rail...
                                </span>
                              ) : (
                                `Authorize Instant Card Top-Up ($${parseFloat(cardAmount || "0").toFixed(2)}) →`
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Card Deposit Receipt */
                        <div className="space-y-6 py-2 animate-in zoom-in-95">
                          <div className="text-center space-y-2">
                            <div className="w-14 h-14 bg-success-bg border border-success/30 rounded-none mx-auto flex items-center justify-center text-success mb-3">
                              <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h2 className="font-display text-xl font-bold text-ink-900">
                              Card Top-Up Credited!
                            </h2>
                            <p className="text-small text-ink-600 max-w-sm mx-auto">
                              Your funds have cleared through the card clearing rail and are instantly available for use.
                            </p>
                          </div>

                          <div className="border border-paper-300 bg-paper-50 p-5 space-y-3 font-mono text-xs">
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Payment Reference:</span>
                              <span className="font-bold text-ink-900">{cardReceipt.reference}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Debited Card:</span>
                              <span className="font-semibold text-ink-900">••••{cardReceipt.cardLast4}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Credited Vault:</span>
                              <span className="text-ink-900">{cardReceipt.account}</span>
                            </div>
                            <div className="flex justify-between border-b border-paper-200 pb-2">
                              <span className="text-ink-500 uppercase">Amount Credited:</span>
                              <span className="font-bold text-ink-900 text-small">
                                ${parseFloat(cardReceipt.amount).toFixed(2)} USD
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ink-500 uppercase">Settlement Speed:</span>
                              <span className="text-success font-semibold">Immediate Real-Time</span>
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
                              onClick={() => {
                                setCardReceipt(null);
                                setCardAmount("");
                                setCardNumber("");
                              }}
                            >
                              Make Another Top-Up
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: InfoPanel */}
                    <aside
                      aria-label="About Card Deposits"
                      className="space-y-5 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                    >
                      <div className="space-y-5">
                        <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                          <svg viewBox="0 0 280 130" className="h-auto w-full" role="img" aria-label="Card Deposit Art">
                            <rect width="280" height="130" fill="#FBF9F4" />
                            {/* Payment card graphic */}
                            <rect x="35" y="28" width="130" height="82" fill="#14181F" rx="4" />
                            <rect x="35" y="44" width="130" height="14" fill="#2E353B" />
                            <rect x="48" y="72" width="28" height="18" fill="#B8893B" rx="2" />
                            <circle cx="138" cy="88" r="10" fill="#D8432B" opacity="0.9" />
                            <circle cx="150" cy="88" r="10" fill="#B8893B" opacity="0.9" />
                            {/* Speedy credit flash */}
                            <circle cx="215" cy="69" r="30" fill="#1F4D3F" />
                            <path d="M218 52l-10 18h12l-6 18" stroke="#F6F1E7" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-display text-base font-semibold text-ink-900">
                            Instant Card Rail
                          </h3>
                          <p className="text-small text-ink-700">
                            Verified through 3D Secure 2.0 network authentication, card deposits credit into your primary vault account with zero delay.
                          </p>
                        </div>

                        <ol className="space-y-2.5" aria-label="How it works">
                          {[
                            "Enter your card information and desired top-up amount.",
                            "Authorize the secure 3D verification challenge.",
                            "Funds are locked into your Heritage vault instantly.",
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
                          <span>Card Networks:</span>
                          <span className="font-semibold text-ink-900">Visa, MC, AMEX</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Clearing Speed:</span>
                          <span className="font-semibold text-success">Instant 0-Second</span>
                        </div>
                      </div>
                    </aside>
                  </div>
                </motion.div>
              )}

              {/* ================================================================= */}
              {/* TAB 5: USDC / USDT Stablecoin Deposit                             */}
              {/* ================================================================= */}
              {activeTab === "crypto" && (
                <motion.div
                  key="tab-crypto"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="grid overflow-hidden rounded-none border border-paper-300 border-t-0 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] shadow-sm">
                    {/* Left Column: Stablecoin Address & Network Gateway */}
                    <div className="p-5 sm:p-8 flex flex-col justify-between space-y-6">
                      <div className="space-y-6">
                        <div>
                          <h2 className="font-display text-lg font-bold text-ink-900">
                            USDC & USDT Digital Asset Ingestion
                          </h2>
                          <p className="text-small text-ink-600 mt-0.5">
                            Deposit institutional dollar stablecoins directly into your fiat vault. Tokens are automatically minted into USD on a 1:1 basis.
                          </p>
                        </div>

                        {/* Account Picker */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                            Credit To Vault Account
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
                                    <p className="text-[11px] text-ink-500">Balance</p>
                                    <p className="font-mono text-small font-semibold text-ink-900">
                                      {fmtMoney(acc.balance, acc.currency)}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Stablecoin Selector (USDC vs USDT) */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                            1. Select Token Asset
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedToken("USDC")}
                              className={cn(
                                "p-3.5 border rounded-none text-left flex items-center gap-3 transition-all cursor-pointer",
                                selectedToken === "USDC"
                                  ? "bg-white border-ink-900 ring-1 ring-ink-900 shadow-xs"
                                  : "bg-paper-50 border-paper-300 hover:bg-paper-100"
                              )}
                            >
                              <div className="w-8 h-8 rounded-full bg-[#2775CA]/10 text-[#2775CA] flex items-center justify-center font-bold text-xs">
                                $
                              </div>
                              <div>
                                <span className="font-bold text-small text-ink-900 block leading-tight">
                                  USDC (USD Coin)
                                </span>
                                <span className="text-[11px] text-ink-500">Regulated 1:1 Backed</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedToken("USDT")}
                              className={cn(
                                "p-3.5 border rounded-none text-left flex items-center gap-3 transition-all cursor-pointer",
                                selectedToken === "USDT"
                                  ? "bg-white border-ink-900 ring-1 ring-ink-900 shadow-xs"
                                  : "bg-paper-50 border-paper-300 hover:bg-paper-100"
                              )}
                            >
                              <div className="w-8 h-8 rounded-full bg-[#26A17B]/10 text-[#26A17B] flex items-center justify-center font-bold text-xs">
                                ₮
                              </div>
                              <div>
                                <span className="font-bold text-small text-ink-900 block leading-tight">
                                  USDT (Tether USD)
                                </span>
                                <span className="text-[11px] text-ink-500">Global Liquidity Rail</span>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Network Selector */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                            2. Select Blockchain Network
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableConfigs.map((cfg) => {
                              const isSelected = cfg.network === selectedNetwork;
                              return (
                                <button
                                  key={cfg.network}
                                  type="button"
                                  onClick={() => setSelectedNetwork(cfg.network)}
                                  className={cn(
                                    "px-3.5 py-2 text-xs font-mono border rounded-none cursor-pointer transition-all",
                                    isSelected
                                      ? "bg-ink-900 text-white border-ink-900 font-bold"
                                      : "bg-paper-50 border-paper-300 text-ink-700 hover:bg-paper-100"
                                  )}
                                >
                                  {cfg.networkLabel}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Deposit Address Box with QR Visualization */}
                        {activeCryptoConfig && (
                          <div className="border border-paper-300 bg-paper-50 p-4 sm:p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row items-center gap-5">
                              {/* QR Code Graphic Box */}
                              <div className="w-28 h-28 bg-white border border-paper-300 p-2 shrink-0 flex items-center justify-center">
                                <QrCode className="w-full h-full text-ink-900" />
                              </div>

                              <div className="space-y-2 w-full min-w-0">
                                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 block">
                                  Your Dedicated {selectedToken} Deposit Address ({activeCryptoConfig.networkLabel})
                                </span>
                                <div className="p-2.5 bg-white border border-paper-300 font-mono text-xs text-ink-900 break-all select-all">
                                  {activeCryptoConfig.address}
                                </div>
                                <Button
                                  variant="outline"
                                  size="small"
                                  className="rounded-none text-xs font-mono h-8"
                                  onClick={() =>
                                    copyToClipboard(activeCryptoConfig.address, `${selectedToken} Address`)
                                  }
                                >
                                  {copiedField === `${selectedToken} Address` ? (
                                    <Check className="w-3.5 h-3.5 mr-1 text-success" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 mr-1" />
                                  )}
                                  Copy Deposit Address
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-paper-200 text-xs font-mono">
                              <div>
                                <span className="text-ink-500 uppercase block">Min Deposit:</span>
                                <span className="font-semibold text-ink-900">
                                  {activeCryptoConfig.minimumDeposit} {selectedToken}
                                </span>
                              </div>
                              <div>
                                <span className="text-ink-500 uppercase block">Confirmations:</span>
                                <span className="font-semibold text-ink-900">
                                  {activeCryptoConfig.confirmationsRequired} Blocks
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Transaction Hash Submitter */}
                        <div className="border border-paper-300 bg-white p-4 space-y-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-ink-900 block">
                            Have You Sent Your Transfer? Track Transaction Hash (TxID)
                          </span>
                          <p className="text-xs text-ink-600">
                            Paste your on-chain transaction hash to expedite mempool monitoring and automated ledger credit.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Amount Sent (e.g. 500.00)"
                              value={cryptoAmountInput}
                              onChange={(e) => setCryptoAmountInput(e.target.value)}
                              className="px-3 py-2 text-xs font-mono border border-paper-300 bg-paper-50 rounded-none focus:outline-none focus:border-ink-900"
                            />
                            <input
                              type="text"
                              placeholder="0x... or Solana TxID"
                              value={txHashInput}
                              onChange={(e) => setTxHashInput(e.target.value)}
                              className="sm:col-span-2 px-3 py-2 text-xs font-mono border border-paper-300 bg-paper-50 rounded-none focus:outline-none focus:border-ink-900"
                            />
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button
                              size="small"
                              className="rounded-none bg-ink-900 text-paper-50"
                              disabled={isSubmittingCrypto || !txHashInput.trim() || !cryptoAmountInput}
                              onClick={handleSubmitCryptoTx}
                            >
                              {isSubmittingCrypto ? "Tracking TxID..." : "Submit TxID for Accelerated Credit"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: InfoPanel */}
                    <aside
                      aria-label="About Crypto Deposits"
                      className="space-y-5 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                    >
                      <div className="space-y-5">
                        <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                          <svg viewBox="0 0 280 130" className="h-auto w-full" role="img" aria-label="Stablecoin Art">
                            <rect width="280" height="130" fill="#FBF9F4" />
                            {/* Blockchain blocks */}
                            <rect x="30" y="45" width="46" height="46" fill="#14181F" rx="3" />
                            <circle cx="53" cy="68" r="10" fill="#B8893B" />
                            <path d="M76 68h24" stroke="#D8432B" strokeWidth="2.5" strokeDasharray="1 4" />
                            <rect x="100" y="45" width="46" height="46" fill="#1F4D3F" rx="3" />
                            <circle cx="123" cy="68" r="10" fill="#F6F1E7" />
                            <path d="M146 68h24" stroke="#D8432B" strokeWidth="2.5" strokeDasharray="1 4" />
                            {/* Dollar conversion vault */}
                            <rect x="170" y="35" width="80" height="66" fill="#14181F" rx="3" />
                            <circle cx="210" cy="68" r="18" fill="#B8893B" />
                            <path d="M210 56v24M204 62h12M204 74h12" stroke="#14181F" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-display text-base font-semibold text-ink-900">
                            1:1 Institutional Minting
                          </h3>
                          <p className="text-small text-ink-700">
                            Inbound USDC and USDT are held in segregated reserve custody and mapped 1:1 into your United States Dollar ledger balance.
                          </p>
                        </div>

                        <ol className="space-y-2.5" aria-label="How it works">
                          {[
                            "Choose your desired token (USDC or USDT) and network.",
                            "Send assets to your dedicated deposit contract address.",
                            "Funds are verified on-chain and auto-credited upon block confirmations.",
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
                          <span>Exchange Ratio:</span>
                          <span className="font-semibold text-ink-900">1.00 USDC/USDT = $1.00 USD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deposit Commission:</span>
                          <span className="font-semibold text-success">0.00% Zero Fee</span>
                        </div>
                      </div>
                    </aside>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* Recent Deposit Transactions Audit Trail (Matching TransferHub)         */}
        {/* ===================================================================== */}
        <section aria-labelledby="recent-deposits" className="rounded-none border border-paper-300 bg-paper-50">
          <div className="flex items-center justify-between border-b border-paper-200 px-5 py-3">
            <h2 id="recent-deposits" className="font-display text-base font-semibold text-ink-900">
              Recent Deposit Transactions & Inflow Audit
            </h2>
            <span className="text-xs text-ink-500">Live ledger monitoring</span>
          </div>

          {recentDeposits.length > 0 ? (
            <ul className="divide-y divide-paper-200" aria-live="polite">
              {recentDeposits.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-small hover:bg-paper-100/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">
                      {item.description || "Account Inflow"} ·{" "}
                      <span className="text-ink-600 text-xs">
                        {item.accountType} ••••{item.accountNumber.slice(-4)}
                      </span>
                    </p>
                    <p className="text-xs text-ink-500 font-mono">
                      Ref: {item.reference} ·{" "}
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono tabular-nums text-success font-bold text-small">
                      +{fmtMoney(item.amount, item.currency || "USD")}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        item.status === "APPROVED" || item.status === "COMPLETED"
                          ? "bg-success-bg text-success"
                          : "bg-warning-bg text-warning"
                      )}
                    >
                      {item.status === "PENDING" && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                      )}
                      {item.status === "PENDING" ? "Pending clearing" : "Credited"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-small text-ink-500 space-y-1">
              <p>No recent deposit requests recorded on this profile.</p>
              <p className="text-xs">Your cash slips, incoming wires, check deposits, and card top-ups will be logged here.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
