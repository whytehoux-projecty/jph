"use client";

import * as React from "react";
import {
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRightLeft,
  Building2,
  Globe2,
  Coins,
  TrendingUp,
  PiggyBank,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { VAULT_TYPES, type VaultType } from "@/lib/vault-rules";
import { cn } from "@/lib/utils";

interface VaultExplainerPanelProps {
  heldTypes?: string[];
  onOpenNew?: () => void;
  onLinkExternal?: () => void;
}

export function VaultExplainerPanel({
  heldTypes = [],
  onOpenNew,
  onLinkExternal,
}: VaultExplainerPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<VaultType>("SAVINGS");

  const activeDef = VAULT_TYPES[activeTab];

  return (
    <div className="rounded-none border border-paper-300 bg-white shadow-xs overflow-hidden">
      {/* Top Banner Bar */}
      <div className="bg-paper-100 p-4 sm:p-5 border-b border-paper-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <span className="p-2 bg-ink-900 text-white rounded-none shrink-0">
            <Layers className="w-5 h-5 text-vintage-gold" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base sm:text-lg font-bold text-ink-900">
                Understanding Heritage Trust Vaults
              </h2>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                Single Source of Truth
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-700 mt-0.5">
              "Vaults" is your unified command center for all liquid capital: core banking, high-yield savings, digital assets, and wealth reserves.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="ghost"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-ink-700 hover:text-ink-900 border border-paper-300 bg-white"
          >
            {isExpanded ? (
              <>
                Hide Explainer <ChevronUp className="w-3.5 h-3.5 ml-1" />
              </>
            ) : (
              <>
                Learn How Vaults Work <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Interactive Explainer & Comparison Section */}
      {isExpanded && (
        <div className="p-5 sm:p-7 space-y-6 bg-paper-50 animate-fade-in-up">
          {/* Core Rule Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-paper-300 space-y-2">
              <div className="flex items-center gap-2 text-ink-900 font-semibold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                1. One Account Per Type
              </div>
              <p className="text-xs text-ink-700 leading-relaxed">
                You can hold a maximum of <strong>one vault per type</strong> (Savings, Current, DCA, Investment, Offshore). Internal and external accounts count together toward this total.
              </p>
            </div>

            <div className="p-4 bg-white border border-paper-300 space-y-2">
              <div className="flex items-center gap-2 text-ink-900 font-semibold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-vintage-gold" />
                2. Primary vs. Secondary
              </div>
              <p className="text-xs text-ink-700 leading-relaxed">
                Your first opened Savings or Current vault becomes <strong>Primary</strong>. All subsequent accounts or external links become <strong>Secondary</strong>. Sub-accounts can never be Primary.
              </p>
            </div>

            <div className="p-4 bg-white border border-paper-300 space-y-2">
              <div className="flex items-center gap-2 text-ink-900 font-semibold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                3. Safe Account Swaps
              </div>
              <p className="text-xs text-ink-700 leading-relaxed">
                To replace an existing account without breaking the one-per-type policy, submit an <strong>Account Swap Request</strong>. It is reviewed and safely executed by administration.
              </p>
            </div>
          </div>

          {/* Interactive Vault Type Deep-Dive Tabs */}
          <div className="border border-paper-300 bg-white">
            <div className="flex items-center overflow-x-auto border-b border-paper-200 bg-paper-100">
              {(Object.keys(VAULT_TYPES) as VaultType[]).map((type) => {
                const def = VAULT_TYPES[type];
                const isSelected = activeTab === type;
                const isHeld = heldTypes.includes(type);

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveTab(type)}
                    className={cn(
                      "px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 border-r border-paper-200 outline-none",
                      isSelected
                        ? "bg-white text-ink-900 border-b-2 border-b-ink-900"
                        : "text-ink-600 hover:text-ink-900 hover:bg-paper-200"
                    )}
                  >
                    <span>{def.label}</span>
                    {isHeld && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-none font-mono">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Deep-dive Content */}
            <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-ink-900 font-display">
                      {activeDef.label}
                    </h3>
                    <Badge variant={activeDef.category === "core" ? "success" : "secondary"} className="text-[10px]">
                      {activeDef.category === "core" ? "Core Bank Vault" : "Specialized Sub-Account"}
                    </Badge>
                    <span className="text-xs font-mono text-emerald-700 font-bold ml-auto">
                      {activeDef.interestRate}
                    </span>
                  </div>
                  <p className="text-xs text-ink-700 mt-1 leading-relaxed">
                    {activeDef.explainer.purpose}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-paper-50 border border-paper-200 space-y-1">
                    <span className="font-semibold text-ink-900 block">Interest & APY Growth:</span>
                    <p className="text-ink-700">{activeDef.explainer.interest}</p>
                  </div>
                  <div className="p-3 bg-paper-50 border border-paper-200 space-y-1">
                    <span className="font-semibold text-ink-900 block">Fees & Account Charges:</span>
                    <p className="text-ink-700">{activeDef.explainer.fees}</p>
                  </div>
                  <div className="p-3 bg-paper-50 border border-paper-200 space-y-1">
                    <span className="font-semibold text-ink-900 block">Withdrawals & Liquidity:</span>
                    <p className="text-ink-700">{activeDef.explainer.withdrawals}</p>
                  </div>
                  <div className="p-3 bg-paper-50 border border-paper-200 space-y-1">
                    <span className="font-semibold text-ink-900 block">Typical Everyday Usage:</span>
                    <p className="text-ink-700">{activeDef.explainer.typicalUse}</p>
                  </div>
                </div>
              </div>

              {/* Global vs US Context Box */}
              <div className="p-4 bg-paper-100 border border-paper-300 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-900">
                    <Globe2 className="w-4 h-4 text-ink-700" />
                    US vs. Global Context
                  </div>
                  <p className="text-xs text-ink-700 mt-2 leading-relaxed">
                    {activeDef.explainer.globalContext}
                  </p>
                </div>

                <div className="pt-3 border-t border-paper-200 text-[11px] text-ink-600 space-y-1 font-mono">
                  <div>Can be Primary: <strong className="text-ink-900">{activeDef.canBePrimary ? "YES (If first opened)" : "NO (Always Secondary)"}</strong></div>
                  <div>Base Currency: <strong className="text-ink-900">{activeDef.defaultCurrency}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
