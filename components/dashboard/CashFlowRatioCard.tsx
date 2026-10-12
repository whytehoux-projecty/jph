"use client";

import { formatCurrency, languageToLocale } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { StatCardShell, SplitRow } from "@/components/dashboard/StatCardShell";

interface CashFlowRatioCardProps {
  credits: number;
  debits: number;
  currency?: string;
  language?: string;
  className?: string;
}

export function CashFlowRatioCard({
  credits = 0,
  debits = 0,
  currency = "USD",
  language = "en",
  className,
}: CashFlowRatioCardProps) {
  const locale = languageToLocale(language);
  const c = Math.abs(credits);
  const d = Math.abs(debits);
  const total = c + d;

  if (total === 0) {
    return <StatCardShell caption="Cash Flow · Month" empty emptyHint="No activity" className={className} />;
  }

  const creditPct = Math.round((c / total) * 100);

  return (
    <StatCardShell caption="Cash Flow · Month" className={className}>
      <SplitRow
        label="Credits"
        tone="positive"
        value={`+${formatCurrency(c, currency, locale)}`}
        icon={<ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />}
      />
      <SplitRow
        label="Debits"
        tone="negative"
        value={`−${formatCurrency(d, currency, locale)}`}
        icon={<ArrowUpRight className="h-3.5 w-3.5 text-rose-600" />}
      />
      {/* Single proportion bar: green share vs red share */}
      <div
        className="mt-1 h-1 w-full rounded-full overflow-hidden flex bg-paper-200"
        title={`${creditPct}% credits / ${100 - creditPct}% debits`}
      >
        <div className="h-full bg-emerald-600" style={{ width: `${creditPct}%` }} />
        <div className="h-full bg-rose-600" style={{ width: `${100 - creditPct}%` }} />
      </div>
    </StatCardShell>
  );
}
