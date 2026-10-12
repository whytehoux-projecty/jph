"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Gift,
  Shield,
  Compass,
  Sparkles,
  Plane,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Printer,
  Coins,
  DollarSign,
  Check,
  Calendar,
  User,
  Mail,
  Phone,
  Lock,
  Building,
  Wallet,
  CreditCard,
  Award,
  FileText,
  Plus,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { fmtMoney } from "@/lib/transfer-forms/validators";
import { toast } from "@/lib/toast";
import {
  submitPointRedemption,
  requestAdvisorySession,
  requestConciergeBooking,
  type UserRewardsData,
  type BenefitActivityItem,
} from "@/app/actions/benefits";

export interface AccountOption {
  id: string;
  name: string;
  accountType: string;
  balance: number;
  currency: string;
  accountNumber: string;
}

interface BenefitsClientProps {
  userPreferences: {
    language: string;
    currency: string;
    name: string;
    email: string;
    tier: string;
  };
  accounts: AccountOption[];
  initialRewardsData: UserRewardsData;
  initialActivities: BenefitActivityItem[];
}

type MainPillar = "rewards" | "benefits";
type RewardsSubTab = "redeem" | "multipliers" | "partners";
type BenefitsSubTab = "privileges" | "advisory" | "concierge";

export default function BenefitsClient({
  userPreferences,
  accounts,
  initialRewardsData,
  initialActivities,
}: BenefitsClientProps) {
  const router = useRouter();

  // Primary Pillar: "rewards" vs "benefits"
  const [activePillar, setActivePillar] = React.useState<MainPillar>("rewards");

  // Sub-tabs
  const [rewardsSubTab, setRewardsSubTab] = React.useState<RewardsSubTab>("redeem");
  const [benefitsSubTab, setBenefitsSubTab] = React.useState<BenefitsSubTab>("privileges");

  // Rewards State
  const [rewardsData, setRewardsData] = React.useState<UserRewardsData>(initialRewardsData);
  const [activities, setActivities] = React.useState<BenefitActivityItem[]>(initialActivities);

  const isBenefitsGloballyEnabled = rewardsData.permissions ? rewardsData.permissions.enabled !== false : true;
  const isPointsRedemptionAllowed =
    isBenefitsGloballyEnabled &&
    (rewardsData.permissions?.methods ? rewardsData.permissions.methods.points_redemption !== false : true);
  const isAdvisoryAllowed =
    isBenefitsGloballyEnabled &&
    (rewardsData.permissions?.methods ? rewardsData.permissions.methods.private_advisory !== false : true);
  const isConciergeAllowed =
    isBenefitsGloballyEnabled &&
    (rewardsData.permissions?.methods ? rewardsData.permissions.methods.concierge !== false : true);

  // Selected Target Account for Redemptions
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>(
    accounts[0]?.id || ""
  );
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];


  // ---------------------------------------------------------------------------
  // SECTION 1: Rewards Redemption State & Handlers
  // ---------------------------------------------------------------------------
  const [redemptionCategory, setRedemptionCategory] = React.useState<
    "cash" | "travel" | "dining" | "goods"
  >("cash");
  const [pointsToRedeem, setPointsToRedeem] = React.useState<string>("25000");
  const [isSubmittingRedemption, setIsSubmittingRedemption] = React.useState(false);
  const [redemptionReceipt, setRedemptionReceipt] = React.useState<{
    reference: string;
    points: number;
    cashAmount: number;
    account: string;
    category: string;
    date: string;
  } | null>(null);

  const pointsNum = parseInt(pointsToRedeem, 10) || 0;
  const calculatedCashValue = Math.round((pointsNum / 100) * 100) / 100;

  const handleRedeemPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointsNum || pointsNum <= 0) {
      toast.error({ title: "Invalid points", description: "Please enter points greater than 0." });
      return;
    }
    if (pointsNum > rewardsData.pointsBalance) {
      toast.error({
        title: "Insufficient points",
        description: `Your available balance is ${rewardsData.pointsBalance.toLocaleString()} points.`,
      });
      return;
    }

    setIsSubmittingRedemption(true);
    try {
      const categoryLabel =
        redemptionCategory === "cash"
          ? "Vault Statement Cash Credit"
          : redemptionCategory === "travel"
          ? "Airline & Travel Voucher"
          : redemptionCategory === "dining"
          ? "Fine Dining Hospitality Credit"
          : "Luxury Goods Voucher";

      const res = await submitPointRedemption({
        points: pointsNum,
        targetAccountId: selectedAccountId,
        category: categoryLabel,
      });

      if (res.success && res.reference) {
        setRewardsData((prev) => ({
          ...prev,
          pointsBalance: prev.pointsBalance - pointsNum,
          cashEquivalent: (prev.pointsBalance - pointsNum) / 100,
        }));

        const newActivity: BenefitActivityItem = {
          id: res.reference,
          reference: res.reference,
          title: `Points Redemption (${pointsNum.toLocaleString()} pts)`,
          type: "REDEMPTION",
          value: `+$${res.cashAmount?.toLocaleString() || calculatedCashValue.toLocaleString()}`,
          date: new Date().toISOString(),
          status: "COMPLETED",
        };
        setActivities((prev) => [newActivity, ...prev]);

        setRedemptionReceipt({
          reference: res.reference,
          points: pointsNum,
          cashAmount: res.cashAmount || calculatedCashValue,
          account: `${selectedAccount?.accountType} ••••${selectedAccount?.accountNumber.slice(-4)}`,
          category: categoryLabel,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        });

        toast.success({
          title: "Points Redeemed Successfully",
          description: `$${res.cashAmount?.toLocaleString()} credited immediately to ${selectedAccount?.accountType}.`,
        });
      } else {
        toast.error({ title: "Redemption failed", description: res.message || "Please try again." });
      }
    } catch {
      toast.error({ title: "Error", description: "Could not process points redemption." });
    } finally {
      setIsSubmittingRedemption(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SECTION 2: Benefits Advisory & Concierge State & Handlers
  // ---------------------------------------------------------------------------
  const [advisoryTopic, setAdvisoryTopic] = React.useState("Portfolio Optimization & Liquidity");
  const [advisoryDate, setAdvisoryDate] = React.useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [advisoryFormat, setAdvisoryFormat] = React.useState("In-Person Vault Salon");
  const [advisoryNotes, setAdvisoryNotes] = React.useState("");
  const [isSubmittingAdvisory, setIsSubmittingAdvisory] = React.useState(false);
  const [advisoryReceipt, setAdvisoryReceipt] = React.useState<{
    reference: string;
    topic: string;
    date: string;
    format: string;
  } | null>(null);

  const handleBookAdvisory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdvisory(true);
    try {
      const res = await requestAdvisorySession({
        topic: advisoryTopic,
        preferredDate: advisoryDate,
        format: advisoryFormat,
        notes: advisoryNotes,
      });

      if (res.success && res.reference) {
        setAdvisoryReceipt({
          reference: res.reference,
          topic: advisoryTopic,
          date: advisoryDate,
          format: advisoryFormat,
        });

        const newActivity: BenefitActivityItem = {
          id: res.reference,
          reference: res.reference,
          title: `Fiduciary Consultation: ${advisoryTopic}`,
          type: "ADVISORY",
          value: "VIP Confirmed",
          date: new Date().toISOString(),
          status: "CONFIRMED",
        };
        setActivities((prev) => [newActivity, ...prev]);

        toast.success({
          title: "Advisory Consultation Booked",
          description: `Confirmed for ${advisoryDate}. Reference: ${res.reference}.`,
        });
      } else {
        toast.error({ title: "Booking failed", description: res.message || "Please try again." });
      }
    } catch {
      toast.error({ title: "Error", description: "Failed to schedule advisory session." });
    } finally {
      setIsSubmittingAdvisory(false);
    }
  };

  // Concierge Form State
  const [conciergeService, setConciergeService] = React.useState("Michelin Dining Reservation");
  const [conciergeDate, setConciergeDate] = React.useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [conciergeParty, setConciergeParty] = React.useState("2 Guests");
  const [conciergeNotes, setConciergeNotes] = React.useState("");
  const [isSubmittingConcierge, setIsSubmittingConcierge] = React.useState(false);
  const [conciergeReceipt, setConciergeReceipt] = React.useState<{
    reference: string;
    service: string;
    date: string;
  } | null>(null);

  const handleDispatchConcierge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingConcierge(true);
    try {
      const res = await requestConciergeBooking({
        serviceType: conciergeService,
        requestDetails: `Party: ${conciergeParty} | Notes: ${conciergeNotes || "None"}`,
        targetDate: conciergeDate,
        guestsCount: parseInt(conciergeParty, 10) || 2,
      });

      if (res.success && res.reference) {
        setConciergeReceipt({
          reference: res.reference,
          service: conciergeService,
          date: conciergeDate,
        });

        const newActivity: BenefitActivityItem = {
          id: res.reference,
          reference: res.reference,
          title: `Concierge: ${conciergeService}`,
          type: "CONCIERGE",
          value: "In Progress",
          date: new Date().toISOString(),
          status: "CONFIRMED",
        };
        setActivities((prev) => [newActivity, ...prev]);

        toast.success({
          title: "Concierge Request Dispatched",
          description: `Dispatched to 24/7 Global Hospitality Desk. Ref: ${res.reference}.`,
        });
      } else {
        toast.error({ title: "Dispatch failed", description: res.message || "Please retry." });
      }
    } catch {
      toast.error({ title: "Error", description: "Could not dispatch concierge request." });
    } finally {
      setIsSubmittingConcierge(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl rounded-sm border border-paper-300 bg-white shadow-sm overflow-hidden animate-fade-in-up">
      {/* Header matching Transfer page */}
      <header className="space-y-3 border-b border-paper-300 bg-paper-100 p-6 sm:p-7">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-small text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
        >
          <ChevronLeft className="h-4 w-4" /> Overview & Accounts
        </Link>
        <h1 className="font-display text-h2 font-bold text-ink-900">
          Rewards & Relationship Benefits
        </h1>
        <p className="max-w-2xl text-body text-ink-700">
          Earn high-multiplier relationship points, redeem for liquid vault statement credits and luxury experiences, or access exclusive private banking privileges.
        </p>
      </header>

      {/* Main Container */}
      <div className="p-6 sm:p-8 space-y-8 bg-white">
        {!isBenefitsGloballyEnabled && (
          <div className="p-4 rounded-none border border-amber-300 bg-amber-50 text-amber-950 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Benefits & Rewards Restricted</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Loyalty points redemptions and relationship perks are temporarily restricted for your account profile. Please contact your Senior Managing Wealth Director for assistance.
              </p>
            </div>
          </div>
        )}

        {/* Primary Pillar Folder Tabs */}
        <div className="flex flex-col">

          <div
            role="tablist"
            aria-label="Rewards and Benefits Primary Sections"
            className="flex items-end gap-1 overflow-x-auto scrollbar-hide border-b border-paper-300"
          >
            {[
              {
                id: "rewards",
                label: "Rewards Program",
                icon: Gift,
                badge: `${rewardsData.pointsBalance.toLocaleString()} pts`,
              },
              {
                id: "benefits",
                label: "Relationship Benefits",
                icon: Award,
                badge: rewardsData.tierName,
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
          {/* PILLAR 1: REWARDS SECTION                                         */}
          {/* ================================================================= */}
          {activePillar === "rewards" && (
            <div className="pt-6 space-y-6">
              {/* Rewards Points Header Valuation Card */}
              <div className="border border-paper-300 bg-paper-100 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-vintage-gold" /> Available Points
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-ink-900">
                    {rewardsData.pointsBalance.toLocaleString()}{" "}
                    <span className="text-sm font-normal text-ink-500">pts</span>
                  </div>
                  <div className="text-xs text-ink-600 font-mono">
                    Worth ${rewardsData.cashEquivalent.toLocaleString()} in liquid cash
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    Pending Monthly Accrual
                  </div>
                  <div className="text-xl font-display font-bold text-ink-800">
                    +{rewardsData.pendingPoints.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-ink-500">pts</span>
                  </div>
                  <div className="text-xs text-success font-semibold">Crediting next statement cycle</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    Lifetime Points Earned
                  </div>
                  <div className="text-xl font-display font-bold text-ink-800">
                    {rewardsData.lifetimeEarned.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-ink-500">pts</span>
                  </div>
                  <div className="text-xs text-ink-600">Zero expiration policy</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    Current Multiplier Tier
                  </div>
                  <div className="text-sm font-bold text-vintage-gold font-mono uppercase">
                    3X Worldwide Travel & Dining
                  </div>
                  <div className="text-xs text-ink-600">2X Business Services • 1.5X Vault</div>
                </div>
              </div>

              {/* Secondary Sub-Tabs for Rewards */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper-200 pb-3">
                <div className="flex items-center gap-2">
                  {[
                    { id: "redeem", label: "Redeem Points", icon: Coins },
                    { id: "multipliers", label: "Earn Multipliers", icon: Sparkles },
                    { id: "partners", label: "Airline & Travel Partners", icon: Plane },
                  ].map((st) => {
                    const SubIcon = st.icon;
                    const isSubActive = rewardsSubTab === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => setRewardsSubTab(st.id as RewardsSubTab)}
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
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span>1:1 Instant Cash Liquidation Guaranteed</span>
                </div>
              </div>

              {/* Sub-view: REDEEM POINTS */}
              {rewardsSubTab === "redeem" && (
                <div className="grid overflow-hidden rounded-none border border-paper-300 bg-white lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1.1fr)] shadow-sm">
                  {/* Left Column: Redemption Form Engine */}
                  <div className="p-5 sm:p-8 space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-ink-900 flex items-center gap-2">
                        <Coins className="w-5 h-5 text-vintage-gold" />
                        Instant Points Redemption
                      </h2>
                      <p className="text-small text-ink-600 mt-1">
                        Convert points into direct cash statement credits, travel waivers, or luxury perks.
                      </p>
                    </div>

                    {!redemptionReceipt ? (
                      <form onSubmit={handleRedeemPoints} className="space-y-6">
                        {/* Category Selector */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-ink-600">
                            Select Redemption Format
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {[
                              { id: "cash", label: "Vault Cash Credit", rate: "1.0¢ / pt", icon: DollarSign },
                              { id: "travel", label: "Flights & Travel", rate: "1.25¢ / pt", icon: Plane },
                              { id: "dining", label: "Fine Dining", rate: "1.15¢ / pt", icon: Compass },
                              { id: "goods", label: "Luxury Goods", rate: "1.0¢ / pt", icon: Award },
                            ].map((c) => {
                              const CIcon = c.icon;
                              const isCatActive = redemptionCategory === c.id;
                              return (
                                <div
                                  key={c.id}
                                  onClick={() => setRedemptionCategory(c.id as any)}
                                  className={cn(
                                    "p-3 border rounded-none cursor-pointer transition-all flex flex-col justify-between",
                                    isCatActive
                                      ? "border-ink-900 bg-paper-50 ring-1 ring-ink-900"
                                      : "border-paper-300 bg-white hover:border-paper-400"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <CIcon className="w-4 h-4 text-ink-800" />
                                    {isCatActive && <Check className="w-3.5 h-3.5 text-ink-900" />}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-ink-900">{c.label}</div>
                                    <div className="text-[10px] text-vintage-gold font-mono font-semibold">{c.rate}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Quick Points Preset Chips */}
                        <div className="space-y-2">
                          <label className="text-small font-medium text-ink-900">
                            Points to Redeem <span className="text-danger">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { pts: 10000, label: "10,000 pts ($100)" },
                              { pts: 25000, label: "25,000 pts ($250)" },
                              { pts: 50000, label: "50,000 pts ($500)" },
                              { pts: 100000, label: "100,000 pts ($1,000)" },
                              { pts: rewardsData.pointsBalance, label: `All Points (${rewardsData.pointsBalance.toLocaleString()})` },
                            ].map((preset) => (
                              <button
                                key={preset.pts}
                                type="button"
                                onClick={() => setPointsToRedeem(preset.pts.toString())}
                                className="px-2.5 py-1 text-xs border border-paper-300 bg-paper-50 hover:bg-paper-100 text-ink-800 rounded-none transition-colors"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                          <div className="relative mt-2">
                            <input
                              type="number"
                              min="1000"
                              max={rewardsData.pointsBalance}
                              step="500"
                              value={pointsToRedeem}
                              onChange={(e) => setPointsToRedeem(e.target.value)}
                              placeholder="25,000"
                              className="w-full px-3.5 py-2.5 border border-paper-300 bg-white text-small text-ink-900 font-mono rounded-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900"
                              required
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-ink-500 font-semibold">
                              PTS
                            </span>
                          </div>
                        </div>

                        {/* Real-time Calculation & Destination Account */}
                        <div className="border border-paper-300 bg-paper-50 p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-ink-800">
                                Target Crediting Vault Account
                              </label>
                              <select
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                className="w-full border border-paper-300 bg-white px-3 py-2 text-xs text-ink-900 rounded-none focus:border-ink-900"
                              >
                                {accounts.map((acc) => (
                                  <option key={acc.id} value={acc.id}>
                                    {acc.name} (••••{acc.accountNumber.slice(-4)}) — ${acc.balance.toLocaleString()}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium text-ink-800">
                                Liquid Cash Value Credited
                              </label>
                              <div className="w-full border border-paper-300 bg-white px-3 py-2 text-sm font-bold font-mono text-success rounded-none">
                                +${calculatedCashValue.toLocaleString()} USD
                              </div>
                            </div>
                          </div>
                        </div>

                        {!isPointsRedemptionAllowed && (
                          <div className="p-3 border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Points cash redemption is currently restricted for your account profile by administration.</span>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={isSubmittingRedemption || pointsNum <= 0 || !isPointsRedemptionAllowed}
                          className="w-full h-12 bg-ink-900 text-paper-50 hover:bg-black rounded-none text-small font-semibold tracking-wide disabled:opacity-50"
                        >
                          {isSubmittingRedemption ? (
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 animate-spin" /> Processing Instant Credit...
                            </span>
                          ) : !isPointsRedemptionAllowed ? (
                            <span className="flex items-center gap-2">
                              <Lock className="w-4 h-4" /> Redemption Restricted by Banker
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Redeem {pointsNum.toLocaleString()} Points for ${calculatedCashValue.toLocaleString()}{" "}
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </form>
                    ) : (
                      /* Redemption Confirmation Receipt */
                      <div className="border border-paper-300 bg-paper-50 p-6 space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-none bg-success/10 border border-success/30 flex items-center justify-center text-success">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-display text-lg font-bold text-ink-900">
                              Points Successfully Redeemed
                            </h3>
                            <p className="text-xs text-ink-500 font-mono">Reference: {redemptionReceipt.reference}</p>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-b border-paper-200 py-4 text-xs">
                          <div className="flex justify-between">
                            <span className="text-ink-500">Points Redeemed:</span>
                            <span className="font-mono font-bold text-ink-900">
                              -{redemptionReceipt.points.toLocaleString()} pts
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Cash Credit Amount:</span>
                            <span className="font-mono font-bold text-success">
                              +${redemptionReceipt.cashAmount.toLocaleString()} USD
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Credited To:</span>
                            <span className="font-semibold text-ink-900">{redemptionReceipt.account}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Settlement Timeline:</span>
                            <span className="font-semibold text-ink-900">Immediate Real-Time Credit</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Date:</span>
                            <span className="font-semibold text-ink-900">{redemptionReceipt.date}</span>
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
                            onClick={() => setRedemptionReceipt(null)}
                          >
                            Make Another Redemption
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Rewards InfoPanel */}
                  <aside
                    aria-label="About Rewards Program"
                    className="space-y-6 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                  >
                    <div className="space-y-5">
                      {/* Bespoke Heritage Rewards Illustration */}
                      <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                        <svg viewBox="0 0 280 130" className="h-auto w-full" role="img" aria-label="Rewards Illustration">
                          <rect width="280" height="130" fill="#FBF9F4" />
                          {/* Diamond Medal */}
                          <circle cx="80" cy="65" r="35" fill="#14181F" />
                          <circle cx="80" cy="65" r="28" fill="none" stroke="#B8893B" strokeWidth="2" strokeDasharray="3 3" />
                          {/* Star Emblem */}
                          <polygon points="80,45 85,58 98,58 87,67 91,80 80,72 69,80 73,67 62,58 75,58" fill="#B8893B" />
                          {/* Point Stream & Coin Stacks */}
                          <rect x="145" y="45" width="105" height="18" fill="#14181F" rx="2" />
                          <rect x="150" y="51" width="30" height="6" fill="#B8893B" />
                          <rect x="185" y="51" width="55" height="6" fill="#F6F1E7" />
                          <rect x="145" y="70" width="105" height="18" fill="#1F4D3F" rx="2" />
                          <rect x="150" y="76" width="40" height="6" fill="#B8893B" />
                          <rect x="195" y="76" width="45" height="6" fill="#F6F1E7" />
                          <circle cx="230" cy="100" r="14" fill="#D8432B" />
                          <text x="226" y="105" fill="#FFFFFF" fontSize="14" fontWeight="bold">$</text>
                        </svg>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-display text-base font-semibold text-ink-900">
                          The Heritage Rewards Standard
                        </h3>
                        <p className="text-small text-ink-700 leading-relaxed">
                          Your points are liquid, transparent, and direct. Enjoy true 1:1 conversion into cash statement credits with zero blackout dates and lifetime point preservation.
                        </p>
                      </div>

                      <div className="border border-paper-300 bg-white p-3.5 space-y-2 text-xs">
                        <div className="font-semibold text-ink-900 uppercase tracking-wider text-[11px]">
                          Points Valuation Matrix
                        </div>
                        <div className="flex justify-between border-b border-paper-100 pb-1">
                          <span className="text-ink-600">Vault Statement Credit:</span>
                          <span className="font-mono font-medium text-ink-900">1.0¢ per Point ($10 per 1k)</span>
                        </div>
                        <div className="flex justify-between border-b border-paper-100 pb-1">
                          <span className="text-ink-600">Airline Partner Transfers:</span>
                          <span className="font-medium text-ink-900">1:1 Point Transfer</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-600">Points Expiration:</span>
                          <span className="font-bold text-success">Never Expire</span>
                        </div>
                      </div>

                      <ol className="space-y-2.5" aria-label="Rewards steps">
                        {[
                          "Earn points across card spend, deposits, and wire volumes.",
                          "Select direct statement cash credit or travel vouchers.",
                          "Specify target vault account for instant crediting.",
                          "Funds clear immediately with zero processing fees.",
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
                      Heritage Trust Rewards Member FDIC. Points are non-taxable client rebates.
                    </div>
                  </aside>
                </div>
              )}

              {/* Sub-view: MULTIPLIERS */}
              {rewardsSubTab === "multipliers" && (
                <div className="border border-paper-300 bg-white p-6 space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-vintage-gold" />
                      Earning Multipliers Breakdown
                    </h2>
                    <p className="text-xs text-ink-600">
                      Maximize relationship point accumulation across your daily spending and institutional depository balances.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-paper-300 bg-paper-50 p-5 space-y-3">
                      <div className="text-xs uppercase font-bold text-ink-600">Dining & Global Travel</div>
                      <div className="text-3xl font-display font-bold text-vintage-gold">3X Points</div>
                      <p className="text-xs text-ink-700">
                        Earn 3 points per dollar spent on airlines, luxury hotels, cruise bookings, and worldwide fine dining.
                      </p>
                    </div>

                    <div className="border border-paper-300 bg-paper-50 p-5 space-y-3">
                      <div className="text-xs uppercase font-bold text-ink-600">Corporate & Business Services</div>
                      <div className="text-3xl font-display font-bold text-vintage-gold">2X Points</div>
                      <p className="text-xs text-ink-700">
                        Earn 2 points per dollar on cloud services, commercial equipment, client entertainment, and shipping.
                      </p>
                    </div>

                    <div className="border border-paper-300 bg-paper-50 p-5 space-y-3">
                      <div className="text-xs uppercase font-bold text-ink-600">Vault Asset Relationship</div>
                      <div className="text-3xl font-display font-bold text-vintage-gold">1.5X Points</div>
                      <p className="text-xs text-ink-700">
                        Monthly loyalty dividend awarded automatically based on your average monthly depository balances.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-view: PARTNERS */}
              {rewardsSubTab === "partners" && (
                <div className="border border-paper-300 bg-white p-6 space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-vintage-gold" />
                      1:1 Airline & Hospitality Transfer Partners
                    </h2>
                    <p className="text-xs text-ink-600">
                      Transfer your points at a 1:1 ratio with zero partner transfer surcharges.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { name: "Delta SkyMiles", code: "DAL", ratio: "1:1 Transfer", time: "Instant" },
                      { name: "British Airways Avios", code: "BAW", ratio: "1:1 Transfer", time: "Instant" },
                      { name: "Emirates Skywards", code: "UAE", ratio: "1:1 Transfer", time: "Instant" },
                      { name: "Marriott Bonvoy", code: "MAR", ratio: "1:1 Transfer", time: "Instant" },
                    ].map((partner) => (
                      <div key={partner.name} className="border border-paper-300 bg-paper-50 p-4 space-y-2">
                        <div className="text-xs font-mono font-bold text-ink-500 uppercase">{partner.code}</div>
                        <div className="font-display font-bold text-sm text-ink-900">{partner.name}</div>
                        <div className="text-xs text-success font-semibold">{partner.ratio}</div>
                        <div className="text-[11px] text-ink-500">Clearing speed: {partner.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* PILLAR 2: RELATIONSHIP BENEFITS                                   */}
          {/* ================================================================= */}
          {activePillar === "benefits" && (
            <div className="pt-6 space-y-6">
              {/* Client Tier Status Banner */}
              <div className="border border-paper-300 bg-paper-100 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-ink-900 text-paper-50 text-[11px] font-mono uppercase tracking-wider">
                    <Award className="h-3.5 w-3.5 text-vintage-gold" />
                    Tier Privilege Active
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-900">
                    {rewardsData.tierName}
                  </h2>
                  <p className="text-xs text-ink-600 max-w-xl">
                    Institutional status unlocked for relationship holdings exceeding $250,000. Enjoy complete fee waivers, global airport lounges, and direct private wealth advisory.
                  </p>
                </div>

                {/* Relationship Director Contact Card */}
                <div className="border border-paper-300 bg-white p-4 space-y-2 shrink-0 md:w-80 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-ink-500 tracking-wider">
                    Dedicated Wealth Director
                  </div>
                  <div className="font-display font-bold text-sm text-ink-900">
                    {rewardsData.relationshipDirector.name}
                  </div>
                  <div className="text-[11px] text-ink-600">
                    {rewardsData.relationshipDirector.title}
                  </div>
                  <div className="pt-2 border-t border-paper-200 text-[11px] space-y-1 font-mono text-ink-700">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-ink-500" />
                      <span className="truncate">{rewardsData.relationshipDirector.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-ink-500" />
                      <span>{rewardsData.relationshipDirector.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs for Benefits */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper-200 pb-3">
                <div className="flex items-center gap-2">
                  {[
                    { id: "privileges", label: "Active Privileges & Fee Waivers", icon: Shield },
                    { id: "advisory", label: "Private Wealth Advisory", icon: User },
                    { id: "concierge", label: "Lifestyle & Dining Concierge", icon: Compass },
                  ].map((st) => {
                    const SubIcon = st.icon;
                    const isSubActive = benefitsSubTab === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => setBenefitsSubTab(st.id as BenefitsSubTab)}
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
              </div>

              {/* Sub-view 1: ACTIVE PRIVILEGES */}
              {benefitsSubTab === "privileges" && (
                <div className="grid overflow-hidden rounded-none border border-paper-300 bg-white lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1.1fr)] shadow-sm">
                  {/* Left Column: Privileges Grid */}
                  <div className="p-5 sm:p-8 space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-ink-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-vintage-gold" />
                        Active Institutional Privileges
                      </h2>
                      <p className="text-small text-ink-600 mt-1">
                        All privileges below are automatically enabled on your account credentials.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          title: "Global ATM & FX Fee Waivers",
                          icon: Plane,
                          desc: "100% automatic reimbursement of all out-of-network domestic and international ATM surcharges with 0% foreign exchange spread.",
                          status: "Active Auto-Reimburse",
                        },
                        {
                          title: "Priority Pass™ VIP Lounge Access",
                          icon: Compass,
                          desc: "Unlimited complimentary access for cardholder and up to two guests across 1,300+ international airport lounges.",
                          status: "Prestige Membership Active",
                        },
                        {
                          title: "Institutional Wire Fee Exemption",
                          icon: DollarSign,
                          desc: "Unlimited zero-fee domestic Fedwire and international SWIFT transfers ($0 fee versus standard $45 institutional rate).",
                          status: "100% Fee Waived",
                        },
                        {
                          title: "Overdraft & Vault Sweep Buffer",
                          icon: Wallet,
                          desc: "$10,000 courtesy liquidity cushion with automated cross-vault sweep to avoid overdraft friction.",
                          status: "$10,000 Line Active",
                        },
                        {
                          title: "High-Limit Card Authorizations",
                          icon: CreditCard,
                          desc: "Custom daily purchasing limits up to $150,000 with real-time biometric and 3D Secure fraud shielding.",
                          status: "Custom Limit Enabled",
                        },
                        {
                          title: "Dedicated Managing Director",
                          icon: User,
                          desc: "Direct private telephone line to your dedicated Senior Wealth Director for concierge banking and execution.",
                          status: "Direct Access Unlocked",
                        },
                      ].map((priv) => {
                        const PIcon = priv.icon;
                        return (
                          <div
                            key={priv.title}
                            className="border border-paper-300 bg-paper-50 p-4 rounded-none space-y-3 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="p-2 bg-ink-900 text-paper-50 rounded-none">
                                  <PIcon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-mono font-semibold text-success uppercase">
                                  {priv.status}
                                </span>
                              </div>
                              <h3 className="font-display font-bold text-sm text-ink-900">{priv.title}</h3>
                              <p className="text-xs text-ink-600 leading-relaxed">{priv.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Benefits InfoPanel */}
                  <aside
                    aria-label="About Benefits"
                    className="space-y-6 border-t border-paper-300 bg-paper-100 p-5 sm:p-8 lg:border-l lg:border-t-0 rounded-none flex flex-col justify-between"
                  >
                    <div className="space-y-5">
                      {/* Bespoke Heritage Benefits Crest Art */}
                      <div className="w-full border border-paper-300 bg-white p-3 shadow-xs">
                        <svg viewBox="0 0 280 130" className="h-auto w-full" role="img" aria-label="Benefits Art">
                          <rect width="280" height="130" fill="#FBF9F4" />
                          {/* Heraldic Shield */}
                          <path d="M75 35 L115 35 L115 75 C115 95 75 110 75 110 C75 110 35 95 35 75 L35 35 Z" fill="#14181F" />
                          <path d="M75 42 L108 42 L108 73 C108 89 75 102 75 102 C75 102 42 89 42 73 L42 42 Z" fill="none" stroke="#B8893B" strokeWidth="2" />
                          {/* Key in shield */}
                          <circle cx="75" cy="58" r="8" fill="none" stroke="#F6F1E7" strokeWidth="2" />
                          <line x1="75" y1="66" x2="75" y2="86" stroke="#F6F1E7" strokeWidth="2.5" />
                          <line x1="75" y1="76" x2="82" y2="76" stroke="#F6F1E7" strokeWidth="2" />
                          <line x1="75" y1="82" x2="82" y2="82" stroke="#F6F1E7" strokeWidth="2" />
                          {/* Document & Seal */}
                          <rect x="145" y="35" width="95" height="75" fill="#FFFFFF" stroke="#B8893B" strokeWidth="1.5" />
                          <line x1="155" y1="50" x2="225" y2="50" stroke="#14181F" strokeWidth="2" />
                          <line x1="155" y1="62" x2="225" y2="62" stroke="#14181F" strokeWidth="2" />
                          <line x1="155" y1="74" x2="210" y2="74" stroke="#14181F" strokeWidth="2" />
                          <circle cx="215" cy="90" r="10" fill="#D8432B" />
                        </svg>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-display text-base font-semibold text-ink-900">
                          Private Banking Philosophy
                        </h3>
                        <p className="text-small text-ink-700 leading-relaxed">
                          Our relationship charter is centered around absolute fiduciary responsibility. As an elite private vault client, all standard retail fees are permanently waived.
                        </p>
                      </div>

                      <div className="border border-paper-300 bg-white p-3.5 space-y-2 text-xs">
                        <div className="font-semibold text-ink-900 uppercase tracking-wider text-[11px]">
                          Annual Value Estimate
                        </div>
                        <div className="flex justify-between border-b border-paper-100 pb-1">
                          <span className="text-ink-600">Wire & Transaction Waivers:</span>
                          <span className="font-mono font-medium text-ink-900">~$1,800 / year</span>
                        </div>
                        <div className="flex justify-between border-b border-paper-100 pb-1">
                          <span className="text-ink-600">Airport VIP Lounge Value:</span>
                          <span className="font-medium text-ink-900">~$650 / year</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-600">Fiduciary Advisory Value:</span>
                          <span className="font-bold text-success">~$2,500 / year</span>
                        </div>
                      </div>

                      <ol className="space-y-2.5" aria-label="Benefits steps">
                        {[
                          "Maintain qualifying depository relationship balance.",
                          "Automatic fee waivers applied at settlement.",
                          "Book confidential advisory sessions directly.",
                          "Dedicated global concierge available 24 hours a day.",
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
                      Heritage Private Wealth Advisory Member SIPC and FDIC.
                    </div>
                  </aside>
                </div>
              )}

              {/* Sub-view 2: PRIVATE WEALTH ADVISORY BOOKING */}
              {benefitsSubTab === "advisory" && (
                <div className="grid overflow-hidden rounded-none border border-paper-300 bg-white lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1.1fr)] shadow-sm">
                  <div className="p-5 sm:p-8 space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-ink-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-vintage-gold" />
                        Fiduciary Wealth Advisory Consultation
                      </h2>
                      <p className="text-small text-ink-600 mt-1">
                        Schedule a confidential 1-on-1 strategy session with your Senior Wealth Director.
                      </p>
                    </div>

                    {!advisoryReceipt ? (
                      <form onSubmit={handleBookAdvisory} className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-small font-medium text-ink-900">
                            Consultation Subject <span className="text-danger">*</span>
                          </label>
                          <select
                            value={advisoryTopic}
                            onChange={(e) => setAdvisoryTopic(e.target.value)}
                            className="w-full border border-paper-300 bg-white px-3.5 py-2.5 text-small text-ink-900 rounded-none focus:border-ink-900"
                          >
                            <option value="Portfolio Optimization & Liquidity">Portfolio Optimization & Liquidity</option>
                            <option value="Fiduciary Estate & Trust Structuring">Fiduciary Estate & Trust Structuring</option>
                            <option value="Cross-Border Offshore Tax Planning">Cross-Border Offshore Tax Planning</option>
                            <option value="Commercial Credit & Corporate Facilities">Commercial Credit & Corporate Facilities</option>
                            <option value="Philanthropic Endowment Strategy">Philanthropic Endowment Strategy</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-small font-medium text-ink-900">Preferred Date</label>
                            <input
                              type="date"
                              value={advisoryDate}
                              onChange={(e) => setAdvisoryDate(e.target.value)}
                              className="w-full border border-paper-300 bg-white px-3.5 py-2 text-small text-ink-900 rounded-none focus:border-ink-900"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-small font-medium text-ink-900">Meeting Format</label>
                            <select
                              value={advisoryFormat}
                              onChange={(e) => setAdvisoryFormat(e.target.value)}
                              className="w-full border border-paper-300 bg-white px-3.5 py-2 text-small text-ink-900 rounded-none focus:border-ink-900"
                            >
                              <option value="In-Person Vault Salon">In-Person Vault Salon (New York)</option>
                              <option value="Encrypted Video Conference">Encrypted Video Conference</option>
                              <option value="Secure Private Telephone">Secure Private Telephone</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-small font-medium text-ink-900">Client Agenda & Notes</label>
                          <textarea
                            rows={3}
                            value={advisoryNotes}
                            onChange={(e) => setAdvisoryNotes(e.target.value)}
                            placeholder="Specify particular portfolios, transactions, or family assets to discuss..."
                            className="w-full border border-paper-300 bg-white p-3 text-small text-ink-900 rounded-none focus:border-ink-900"
                          />
                        </div>

                        {!isAdvisoryAllowed && (
                          <div className="p-3 border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Private advisory bookings are currently restricted for your account profile by administration.</span>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={isSubmittingAdvisory || !isAdvisoryAllowed}
                          className="w-full h-12 bg-ink-900 text-paper-50 hover:bg-black rounded-none text-small font-semibold tracking-wide disabled:opacity-50"
                        >
                          {isSubmittingAdvisory ? (
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 animate-spin" /> Scheduling Advisory...
                            </span>
                          ) : !isAdvisoryAllowed ? (
                            <span className="flex items-center gap-2">
                              <Lock className="w-4 h-4" /> Advisory Booking Restricted
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Schedule Private Consultation <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </form>
                    ) : (
                      <div className="border border-paper-300 bg-paper-50 p-6 space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-success/10 border border-success/30 flex items-center justify-center text-success">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-display text-lg font-bold text-ink-900">
                              Advisory Consultation Confirmed
                            </h3>
                            <p className="text-xs text-ink-500 font-mono">Reference ID: {advisoryReceipt.reference}</p>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-b border-paper-200 py-4 text-xs">
                          <div className="flex justify-between">
                            <span className="text-ink-500">Agenda Topic:</span>
                            <span className="font-semibold text-ink-900">{advisoryReceipt.topic}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Date:</span>
                            <span className="font-semibold text-ink-900">{advisoryReceipt.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Format:</span>
                            <span className="font-semibold text-ink-900">{advisoryReceipt.format}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-ink-900 text-paper-50 hover:bg-black rounded-none"
                          onClick={() => setAdvisoryReceipt(null)}
                        >
                          Schedule Another Session
                        </Button>
                      </div>
                    )}
                  </div>

                  <aside className="space-y-4 border-t border-paper-300 bg-paper-100 p-6 lg:border-l lg:border-t-0">
                    <h3 className="font-display font-semibold text-base text-ink-900">Fiduciary Confidentiality</h3>
                    <p className="text-xs text-ink-600 leading-relaxed">
                      All consultations are conducted under strict non-disclosure legal guidelines. Heritage Private Wealth advisors act strictly as fee-only fiduciaries.
                    </p>
                    <div className="border border-paper-200 bg-white p-3 text-xs space-y-1">
                      <div className="font-semibold text-ink-900">Preparation Materials</div>
                      <p className="text-ink-600">Please have your latest custodial statements or trust agreements available.</p>
                    </div>
                  </aside>
                </div>
              )}

              {/* Sub-view 3: LIFESTYLE & DINING CONCIERGE */}
              {benefitsSubTab === "concierge" && (
                <div className="grid overflow-hidden rounded-none border border-paper-300 bg-white lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1.1fr)] shadow-sm">
                  <div className="p-5 sm:p-8 space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-ink-900 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-vintage-gold" />
                        24/7 Global Hospitality & Dining Concierge
                      </h2>
                      <p className="text-small text-ink-600 mt-1">
                        Dispatch requests for Michelin reservations, private aviation, or premier event hospitality.
                      </p>
                    </div>

                    {!conciergeReceipt ? (
                      <form onSubmit={handleDispatchConcierge} className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-small font-medium text-ink-900">Service Required</label>
                          <select
                            value={conciergeService}
                            onChange={(e) => setConciergeService(e.target.value)}
                            className="w-full border border-paper-300 bg-white px-3.5 py-2.5 text-small text-ink-900 rounded-none focus:border-ink-900"
                          >
                            <option value="Michelin Dining Reservation">Michelin-Starred Dining Priority Reservation</option>
                            <option value="Private Jet & Aviation Charter">Private Jet & Aviation Charter Quotes</option>
                            <option value="Luxury Yacht & Marina Booking">Luxury Yacht & Marina Berth Booking</option>
                            <option value="Opera & Gala Premier Access">Opera, Philharmonic & Gala Premier Seating</option>
                            <option value="Bespoke Luxury Hotel Privilege">Bespoke 5-Star Hotel Upgrade & Amenity Access</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-small font-medium text-ink-900">Target Date</label>
                            <input
                              type="date"
                              value={conciergeDate}
                              onChange={(e) => setConciergeDate(e.target.value)}
                              className="w-full border border-paper-300 bg-white px-3.5 py-2 text-small text-ink-900 rounded-none focus:border-ink-900"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-small font-medium text-ink-900">Party Size</label>
                            <select
                              value={conciergeParty}
                              onChange={(e) => setConciergeParty(e.target.value)}
                              className="w-full border border-paper-300 bg-white px-3.5 py-2 text-small text-ink-900 rounded-none focus:border-ink-900"
                            >
                              <option value="1 Guest">1 Guest</option>
                              <option value="2 Guests">2 Guests</option>
                              <option value="4 Guests">4 Guests</option>
                              <option value="6 Guests">6 Guests</option>
                              <option value="8+ Private Delegation">8+ Private Delegation</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-small font-medium text-ink-900">Specific Preferences & Venue</label>
                          <textarea
                            rows={3}
                            value={conciergeNotes}
                            onChange={(e) => setConciergeNotes(e.target.value)}
                            placeholder="Name of establishment, dietary notes, preferred seating time..."
                            className="w-full border border-paper-300 bg-white p-3 text-small text-ink-900 rounded-none focus:border-ink-900"
                          />
                        </div>

                        {!isConciergeAllowed && (
                          <div className="p-3 border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Lifestyle concierge requests are currently restricted for your account profile by administration.</span>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={isSubmittingConcierge || !isConciergeAllowed}
                          className="w-full h-12 bg-ink-900 text-paper-50 hover:bg-black rounded-none text-small font-semibold tracking-wide disabled:opacity-50"
                        >
                          {isSubmittingConcierge ? (
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 animate-spin" /> Dispatching to Concierge Desk...
                            </span>
                          ) : !isConciergeAllowed ? (
                            <span className="flex items-center gap-2">
                              <Lock className="w-4 h-4" /> Concierge Services Restricted
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Dispatch Concierge Request <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </form>
                    ) : (
                      <div className="border border-paper-300 bg-paper-50 p-6 space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-success/10 border border-success/30 flex items-center justify-center text-success">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-display text-lg font-bold text-ink-900">
                              Concierge Request Dispatched
                            </h3>
                            <p className="text-xs text-ink-500 font-mono">Reference: {conciergeReceipt.reference}</p>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-b border-paper-200 py-4 text-xs">
                          <div className="flex justify-between">
                            <span className="text-ink-500">Service:</span>
                            <span className="font-semibold text-ink-900">{conciergeReceipt.service}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-500">Date:</span>
                            <span className="font-semibold text-ink-900">{conciergeReceipt.date}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-ink-900 text-paper-50 hover:bg-black rounded-none"
                          onClick={() => setConciergeReceipt(null)}
                        >
                          Submit Another Concierge Request
                        </Button>
                      </div>
                    )}
                  </div>

                  <aside className="space-y-4 border-t border-paper-300 bg-paper-100 p-6 lg:border-l lg:border-t-0">
                    <h3 className="font-display font-semibold text-base text-ink-900">Global Desk Availability</h3>
                    <p className="text-xs text-ink-600 leading-relaxed">
                      Operated 24/7 across New York, London, Zurich, and Singapore. Confirmations typically transmitted via SMS or encrypted dispatch within 2 hours.
                    </p>
                  </aside>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* LOWER SECTION: Recent Rewards Redemptions & Benefit Ledger        */}
        {/* ================================================================= */}
        <section className="space-y-4 pt-4 border-t border-paper-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">
                {activePillar === "rewards" ? "Points Redemption & Earnings Ledger" : "Active Privileges & Advisory Log"}
              </h2>
              <p className="text-small text-ink-600">
                {activePillar === "rewards"
                  ? "Audit record of points converted into statement credits and loyalty disbursements."
                  : "Track scheduled consultations, concierge dispatches, and permanent privilege waivers."}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-paper-300 bg-white shadow-xs">
            <table className="w-full text-left text-small">
              <thead className="border-b border-paper-300 bg-paper-100 text-[11px] uppercase tracking-wider text-ink-600 font-semibold">
                <tr>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Activity / Item</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Value</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200">
                {activities.map((item) => (
                  <tr key={item.id} className="hover:bg-paper-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink-900">{item.reference}</td>
                    <td className="px-5 py-3.5 font-medium text-ink-900">{item.title}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-paper-100 border border-paper-200 text-ink-700">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-ink-900">{item.value}</td>
                    <td className="px-5 py-3.5 text-xs text-ink-600">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-success/10 text-success border border-success/30">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
