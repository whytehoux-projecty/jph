"use client";

import { useState } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, BarChart3, Eye, EyeOff } from "lucide-react";
import { formatCurrency, languageToLocale, translate } from '@/lib/utils';
import { updatePreferences } from "@/app/actions/profile";

interface BalanceBannerProps {
  totalBalance: number;
  currency: string;
  language: string;
  accounts: any[];
  initialHideBalance?: boolean;
}

export function BalanceBanner({ totalBalance, currency, language, accounts, initialHideBalance = false }: BalanceBannerProps) {
  const [showBalance, setShowBalance] = useState(!initialHideBalance);

  const toggleBalance = async () => {
    const newShowBalance = !showBalance;
    setShowBalance(newShowBalance);
    // Sync to backend without awaiting to keep UI snappy
    updatePreferences({ hideBalance: !newShowBalance }).catch(console.error);
  };

  return (
    <div className="bg-paper-50 rounded-sm border border-paper-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-stretch justify-between gap-6">
      <div className="flex-1 w-full min-w-0">
        <h2 className="text-sm font-medium text-ink-500 mb-2">Total Balance</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-ink-900">
            {showBalance ? formatCurrency(totalBalance, currency, languageToLocale(language)) : "****"}
          </div>
          <button 
            onClick={toggleBalance}
            className="text-ink-400 hover:text-ink-700 transition-colors p-1"
            aria-label={showBalance ? "Hide balance" : "Show balance"}
          >
            {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex flex-col mt-4 w-full max-w-md">
          {accounts.map((acc: any, i: number) => {
            const isFrozen = acc.status === "FROZEN" || acc.status === "SUSPENDED" || acc.isFrozen;
            
            const textColors = [
              "text-blue-700",
              "text-emerald-700",
              "text-purple-700",
              "text-amber-700",
              "text-rose-700"
            ];
            
            const colorClass = isFrozen 
              ? "text-ink-400" 
              : textColors[i % textColors.length];

            return (
              <div key={acc.id} className="flex items-center justify-between py-2.5 border-b border-paper-200/70 last:border-0 transition-all duration-300 group">
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs uppercase tracking-wider font-semibold ${colorClass}`}>
                    {acc.accountType} <span className="opacity-70">(••{acc.accountNumber?.slice(-4) || '****'})</span>
                  </span>
                  {isFrozen && (
                    <span className="bg-ink-900 text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm shadow-sm">
                      Frozen
                    </span>
                  )}
                </div>
                <span className={`text-sm font-mono font-bold ${colorClass}`}>
                  {showBalance ? formatCurrency(acc.balance, acc.currency || currency, languageToLocale(language)) : "****"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-end items-start md:items-end shrink-0 pb-2">
        <TabsList className="bg-paper-100 p-0.5 rounded-sm border border-paper-200 w-fit">
          <TabsTrigger value="overview" className="p-1.5" title={translate(language, "nav.overview") || "Overview"}>
            <LayoutGrid className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="analytics" className="p-1.5" title={translate(language, "nav.analytics") || "Analytics"}>
            <BarChart3 className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}
