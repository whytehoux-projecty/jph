"use client";

import { useState } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, BarChart3, Eye, EyeOff, Plus } from "lucide-react";
import { formatCurrency, languageToLocale, translate } from '@/lib/utils';
import { updatePreferences } from "@/app/actions/profile";
import Link from "next/link";
import { NoticeCarousel, type Notice } from "@/components/dashboard/NoticeCarousel";

interface BalanceBannerProps {
  totalBalance: number;
  currency: string;
  language: string;
  accounts: any[];
  initialHideBalance?: boolean;
  notices?: Notice[];
}

export function BalanceBanner({ totalBalance, currency, language, accounts, initialHideBalance = false, notices = [] }: BalanceBannerProps) {
  const [showBalance, setShowBalance] = useState(!initialHideBalance);

  const toggleBalance = async () => {
    const newShowBalance = !showBalance;
    setShowBalance(newShowBalance);
    // Sync to backend without awaiting to keep UI snappy
    updatePreferences({ hideBalance: !newShowBalance }).catch(console.error);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-[2.3px] w-full items-stretch">
      {/* ── Left Side (40%): Total Balance & Actions ── */}
      <div className="w-full lg:w-[40%] bg-paper-50 rounded-sm border border-paper-200 p-6 md:p-7 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-ink-500">Total Balance</h2>
            <TabsList className="bg-paper-100 p-0.5 rounded-sm border border-paper-200 w-fit shrink-0">
              <TabsTrigger value="overview" className="p-1.5" title={translate(language, "nav.overview") || "Overview"}>
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="analytics" className="p-1.5" title={translate(language, "nav.analytics") || "Analytics"}>
                <BarChart3 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-3 my-3">
            <div className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-display font-semibold tracking-tight text-ink-900">
              {showBalance ? formatCurrency(totalBalance, currency, languageToLocale(language)) : "****"}
            </div>
            <button 
              onClick={toggleBalance}
              className="text-ink-400 hover:text-ink-700 transition-colors p-1.5 rounded-sm hover:bg-paper-100"
              aria-label={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-paper-200/70 flex items-center justify-between">
          <div className="text-xs text-ink-500">
            <span className="font-mono font-medium text-ink-700">{accounts.length}</span> connected {accounts.length === 1 ? 'account' : 'accounts'}
          </div>
          <Link 
            href="/deposit"
            className="bg-vermilion-600 hover:bg-vermilion-700 text-white text-xs font-semibold px-4 py-2 rounded-sm transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Deposit
          </Link>
        </div>
      </div>

      {/* ── Right Side (60%): Critical notices / rotating announcements ── */}
      <NoticeCarousel notices={notices} className="w-full lg:w-[60%] min-h-[170px]" />
    </div>
  );
}
