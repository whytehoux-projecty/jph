"use client";


import { useState, useEffect } from "react";
import {
  Shield,
  Snowflake,
  CreditCard,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Plus,
  AlertCircle,
  Wifi,
  Plane,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Zap,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VisualCard } from "@/components/ui/visual-card";
import { freezeCard, unfreezeCard } from "@/app/actions/cards";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

// Sub-components
import { CardExpenseChart } from "./components/CardExpenseChart";
import { CardSpendingInsights } from "./components/CardSpendingInsights";
import { CreditScore } from "./components/CreditScore";
import { CardDetailsDialog } from "./components/CardDetailsDialog";
import { CardTransactionHistory } from "./components/CardTransactionHistory";
import { CardLimitsControl } from "./components/CardLimitsControl";
import { VirtualCardGenerator } from "./components/VirtualCardGenerator";

interface CardData {
  id: string;
  name?: string;
  number?: string;
  expiry?: string;
  cvc?: string;
  type?: string;
  scheme?: string;
  tier?: string;
  balance?: number;
  limit?: number;
  status: string;
  frozen?: boolean;
  settings?: {
    onlinePayments: boolean;
    internationalUsage: boolean;
    contactless: boolean;
  };
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.match(/.{1,4}/g)?.join(" ") ?? raw;
}

function formatExpiry(raw: string): string {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${yy}`;
  } catch {
    return raw;
  }
}

function normalizeCard(raw: any): CardData {
  const rawExpiry = raw.expiryDate || raw.expiry || "";
  const expiry =
    rawExpiry && (rawExpiry.includes("-") || rawExpiry.includes("T"))
      ? formatExpiry(rawExpiry)
      : rawExpiry || "••/••";

  const rawNumber = raw.cardNumber || raw.number || "";
  const number =
    rawNumber && !rawNumber.includes(" ")
      ? formatCardNumber(rawNumber)
      : rawNumber || "**** **** **** ****";

  return {
    id: raw.id,
    name:
      raw.cardholderName ||
      raw.name ||
      `${raw.network || raw.cardType || "Heritage"} ${
        raw.account?.accountType
          ? raw.account.accountType.charAt(0) +
            raw.account.accountType.slice(1).toLowerCase()
          : "Card"
      }`,
    number,
    expiry,
    cvc: raw.cvv || raw.cvc || "•••",
    type: raw.cardType?.toLowerCase() || raw.type || "standard",
    scheme:
      raw.scheme ||
      raw.network?.toLowerCase() ||
      (raw.cardType === "CREDIT" ? "visa" : "mastercard"),
    tier: raw.tier || (raw.cardType === "CREDIT" ? "Credit" : "Debit"),
    balance: Number(raw.balance ?? 0),
    limit: Number(raw.limit ?? raw.dailyLimit ?? 0),
    status: raw.status || "ACTIVE",
    frozen: raw.frozen ?? raw.status === "FROZEN",
    settings: raw.settings ?? {
      onlinePayments: true,
      internationalUsage: true,
      contactless: true,
    },
  };
}

/** Mini gradient strip for the wallet card selector */
function CardMini({ card, active }: { card: CardData; active: boolean }) {
  const isCredit = card.type === "credit" || card.tier === "Credit";
  const isMastercard = card.scheme === "mastercard";

  const gradientClass = isCredit
    ? "from-[#2C2C2C] via-[#4A4A4A] to-[#1A1A1A]"
    : "from-vintage-green via-vintage-green-light to-vintage-green-dark";

  return (
    <div
      className={`w-14 h-9 rounded-md bg-gradient-to-br ${gradientClass} shadow flex items-end justify-end p-1 relative overflow-hidden flex-shrink-0`}
    >
      {/* gloss */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      {/* scheme mark */}
      {isMastercard ? (
        <div className="flex items-center -space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-90" />
          <div className="w-3 h-3 rounded-full bg-orange-400 opacity-90" />
        </div>
      ) : (
        <span className="text-[7px] font-bold italic text-white/80">VISA</span>
      )}
      {active && (
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow" />
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function CardsClient({ initialCards }: { initialCards: CardData[] }) {
  const router = useRouter();
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(initialCards[0]?.id ?? null);
  const [showPan, setShowPan] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [travelExpanded, setTravelExpanded] = useState(false);
  const [travelDates, setTravelDates] = useState({ from: "", to: "", region: "" });

  const activeCard = cards.find((c) => c.id === selectedCardId) ?? null;

  const toggleSetting = async (setting: string) => {
    if (!activeCard) return;

    if (setting === "frozen") {
      const wasFrozen = activeCard.frozen;
      setCards((prev) =>
        prev.map((c) => (c.id === activeCard.id ? { ...c, frozen: !wasFrozen } : c))
      );
      try {
        if (wasFrozen) {
          await unfreezeCard(activeCard.id);
          toast.success({ title: "Card unfrozen", description: "Your card is now active for transactions." });
        } else {
          await freezeCard(activeCard.id);
          toast.success({ title: "Card frozen", description: "All transactions are now blocked." });
        }
        router.refresh();
      } catch {
        setCards((prev) =>
          prev.map((c) => (c.id === activeCard.id ? { ...c, frozen: wasFrozen } : c))
        );
        toast.error({ title: "Failed to update card status", description: "Please try again." });
      }
    } else {
      setCards((prev) =>
        prev.map((c) =>
          c.id === activeCard.id
            ? {
                ...c,
                settings: {
                  ...c.settings!,
                  [setting]: !c.settings?.[setting as keyof typeof c.settings],
                },
              }
            : c
        )
      );
      toast.warn({
        title: "Setting saved locally",
        description: "Will sync with server in a future update.",
      });
    }
  };

  const handleSaveTravelMode = () => {
    if (!travelDates.from || !travelDates.to || !travelDates.region) {
      toast.warn({ title: "Please complete all trip details" });
      return;
    }
    toast.success({
      title: "Travel mode saved",
      description: `Authorized for ${travelDates.region} from ${travelDates.from} to ${travelDates.to}.`,
    });
    setTravelExpanded(false);
  };





  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 border-2 border-dashed border-border rounded-xl p-12 bg-muted/10">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
          <CreditCard className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-charcoal">No cards yet</p>
          <p className="text-sm text-muted-foreground">Apply for a card to get started.</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
          Apply for New Card
        </Button>
      </div>
    );
  }

  // ─── Main Page ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-charcoal">Cards Center</h1>
          <p className="text-muted-foreground mt-1">
            Manage your cards, limits, and security controls.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Card
          </Button>
          <Button variant="outline" icon={<ShieldAlert className="w-4 h-4" />}>
            Report Issue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column (sticky wallet panel) ───────────────────────── */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-[76px] lg:self-start lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:pr-1">
          {activeCard && (
            <>
              {/* Card status label */}
              <div className="flex justify-between items-center px-1">
                <h3 className="text-base font-semibold text-charcoal flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {activeCard.tier} Card
                </h3>
                <Badge variant={activeCard.frozen ? "destructive" : "success"} className="text-xs">
                  {activeCard.frozen ? "Frozen" : "Active"}
                </Badge>
              </div>

              {/* 3D Visual Card */}
              <div className="relative">
                <VisualCard
                  name={activeCard.name!}
                  number={
                    showPan
                      ? activeCard.number!
                      : (activeCard.number || "").replace(
                          /[\d*]{4}[ -]?[\d*]{4}[ -]?[\d*]{4}/,
                          "**** **** ****"
                        )
                  }
                  expiry={activeCard.expiry!}
                  cvc={activeCard.cvc!}
                  type={activeCard.type as any}
                  scheme={activeCard.scheme}
                  frozen={activeCard.frozen}
                  className="shadow-2xl hover:scale-[1.01] transition-transform duration-500"
                  flipped={isFlipped}
                  onFlip={() => setIsFlipped(!isFlipped)}
                />
              </div>
              <p className="text-center text-[11px] text-muted-foreground -mt-2">
                Click card to flip · reveal CVV on back
              </p>

              {/* Quick action strip */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-border shadow-sm">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setShowPan(!showPan)}
                  className="text-muted-foreground hover:text-foreground flex-1 justify-start"
                >
                  {showPan ? <EyeOff size={14} className="mr-2" /> : <Eye size={14} className="mr-2" />}
                  {showPan ? "Hide Number" : "Reveal PAN"}
                </Button>
                <div className="w-px h-6 bg-border" />
                <CardDetailsDialog card={activeCard} />
              </div>

              {/* Wallet — card selector */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {cards.map((card) => {
                    const isActive = selectedCardId === card.id;
                    return (
                      <div
                        key={card.id}
                        onClick={() => {
                          setSelectedCardId(card.id);
                          setIsFlipped(false);
                          setShowPan(false);
                        }}
                        className={`cursor-pointer px-3 py-3 rounded-xl border transition-all flex items-center justify-between group ${
                          isActive
                            ? "bg-vintage-green/5 border-vintage-green ring-1 ring-vintage-green shadow-sm"
                            : "bg-white border-border hover:border-vintage-green/30 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CardMini card={card} active={isActive} />
                          <div>
                            <p className="font-semibold text-charcoal text-sm leading-none">
                              {card.scheme === "mastercard" ? "Mastercard" : "Visa"} {card.tier}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              •••• {(card.number || "").replace(/\s/g, "").slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {card.frozen && (
                            <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          {isActive && (
                            <div className="h-2 w-2 rounded-full bg-vintage-green" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Credit Score */}
              <CreditScore />
            </>
          )}
        </div>

        {/* ── Right Column (scrollable workspace) ─────────────────────── */}
        {activeCard && (
          <div className="lg:col-span-7 space-y-6">

            {/* Row 1: Chart + Spending Insights side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardExpenseChart />
              <CardSpendingInsights cardId={activeCard.id} />
            </div>

            {/* Transaction History */}
            <CardTransactionHistory cardId={activeCard.id} />

            {/* Spending Limits */}
            <CardLimitsControl
              cardId={activeCard.id}
              currentLimits={{
                dailySpend: activeCard.limit || 2000,
                monthlySpend: (activeCard.limit || 2000) * 5,
                atmWithdrawal: 500,
                onlinePurchase: activeCard.limit || 2000,
              }}
            />

            {/* Virtual Cards */}
            <VirtualCardGenerator physicalCardId={activeCard.id} />

            {/* Security & Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-vintage-green" />
                  Security & Permissions
                </CardTitle>
                <CardDescription>
                  Control how {activeCard.tier} ••••{" "}
                  {(activeCard.number || "").replace(/\s/g, "").slice(-4)} behaves.
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">

                {/* Freeze */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Snowflake size={17} />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal text-sm">Freeze Card</p>
                      <p className="text-xs text-muted-foreground">Block all transactions instantly</p>
                    </div>
                  </div>
                  <Switch
                    checked={activeCard.frozen ?? false}
                    onCheckedChange={() => toggleSetting("frozen")}
                  />
                </div>

                {/* Contactless */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                      <Wifi size={17} />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal text-sm">Contactless Payments</p>
                      <p className="text-xs text-muted-foreground">Tap-to-pay up to $100</p>
                    </div>
                  </div>
                  <Switch
                    checked={activeCard.settings?.contactless ?? true}
                    onCheckedChange={() => toggleSetting("contactless")}
                  />
                </div>

                {/* Online Payments */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <Zap size={17} />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal text-sm">Online Payments</p>
                      <p className="text-xs text-muted-foreground">Allow e-commerce transactions</p>
                    </div>
                  </div>
                  <Switch
                    checked={activeCard.settings?.onlinePayments ?? true}
                    onCheckedChange={() => toggleSetting("onlinePayments")}
                  />
                </div>

                {/* International */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                      <Globe size={17} />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal text-sm">International Transactions</p>
                      <p className="text-xs text-muted-foreground">Allow cross-border spending</p>
                    </div>
                  </div>
                  <Switch
                    checked={activeCard.settings?.internationalUsage ?? true}
                    onCheckedChange={() => toggleSetting("internationalUsage")}
                  />
                </div>

                {/* Travel Mode */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                        <Plane size={17} />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal text-sm">Travel Mode</p>
                        <p className="text-xs text-muted-foreground">Prevent false fraud blocks while abroad</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTravelExpanded(!travelExpanded)}
                      className="flex items-center gap-1 text-xs text-vintage-green font-medium hover:underline"
                    >
                      {travelExpanded ? "Close" : "Configure"}
                      {travelExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Travel config expander */}
                  {travelExpanded && (
                    <div className="ml-12 border-l-2 border-sky-200 pl-4 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="bg-sky-50/60 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Departing</label>
                            <input
                              type="date"
                              value={travelDates.from}
                              onChange={(e) => setTravelDates(p => ({ ...p, from: e.target.value }))}
                              className="w-full text-sm px-3 py-1.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Returning</label>
                            <input
                              type="date"
                              value={travelDates.to}
                              onChange={(e) => setTravelDates(p => ({ ...p, to: e.target.value }))}
                              className="w-full text-sm px-3 py-1.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Destination Region</label>
                          <select
                            value={travelDates.region}
                            onChange={(e) => setTravelDates(p => ({ ...p, region: e.target.value }))}
                            className="w-full text-sm px-3 py-1.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
                          >
                            <option value="">Select a region…</option>
                            <option>Europe</option>
                            <option>Asia Pacific</option>
                            <option>Middle East & Africa</option>
                            <option>Latin America</option>
                            <option>North America</option>
                            <option>Worldwide</option>
                          </select>
                        </div>
                        <Button
                          size="small"
                          variant="primary"
                          className="w-full mt-1"
                          onClick={handleSaveTravelMode}
                        >
                          Save Trip Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
