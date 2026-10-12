"use client";

import { cn, formatCurrency, languageToLocale } from "@/lib/utils";
import { StatCardShell } from "@/components/dashboard/StatCardShell";

interface AccountData {
  id: string;
  accountNumber: string;
  accountType: string;
  currency?: string;
  balance: number;
  status?: string;
  isPrimary?: boolean;
}

interface PrimaryAccountCardProps {
  accounts: AccountData[];
  /** Real balance history of the primary account (oldest → newest). Sparkline hidden if < 2 points. */
  series?: number[];
  currency?: string;
  language?: string;
  className?: string;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 200;
    const y = 34 - ((v - min) / range) * 30;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${pts.join(" L")}`;
  return (
    <svg viewBox="0 0 200 38" preserveAspectRatio="none" className="w-full h-6" aria-hidden>
      <path d={`${line} L200,38 L0,38 Z`} fill={color} fillOpacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function PrimaryAccountCard({
  accounts = [],
  series = [],
  currency = "USD",
  language = "en",
  className,
}: PrimaryAccountCardProps) {
  const locale = languageToLocale(language);
  const primary = accounts.find((a) => a.isPrimary) || accounts[0] || null;
  const secondary = primary ? accounts.find((a) => a.id !== primary.id) || null : null;

  if (!primary) {
    return <StatCardShell caption="Primary Account" empty emptyHint="No bank accounts" className={className} />;
  }

  const pBal = Number(primary.balance);
  const pPositive = pBal >= 0;
  const color = pPositive ? "#047857" : "#be123c";
  const sBal = secondary ? Number(secondary.balance) : 0;

  return (
    <StatCardShell
      caption={`${primary.accountType} · ••${primary.accountNumber?.slice(-4) || "****"}`}
      className={cn("bg-emerald-500/10 border-emerald-500/25 hover:border-emerald-600/40", className)}
    >
      <h1
        title={formatCurrency(pBal, primary.currency || currency, locale)}
        className={cn(
          "text-xl xl:text-2xl font-bold font-mono tabular-nums tracking-tight truncate",
          pPositive ? "text-emerald-700" : "text-rose-700"
        )}
      >
        {formatCurrency(pBal, primary.currency || currency, locale)}
      </h1>
      {series.length >= 2 && <Sparkline data={series} color={color} />}
      {secondary && (
        <div className="pt-2 border-t border-paper-200/70 flex items-center justify-between gap-2 min-w-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-500 truncate">
            {secondary.accountType} ••{secondary.accountNumber?.slice(-4) || "****"}
          </span>
          <h3
            className={cn(
              "text-sm font-semibold font-mono tabular-nums shrink-0",
              sBal >= 0 ? "text-emerald-700" : "text-rose-700"
            )}
          >
            {formatCurrency(sBal, secondary.currency || currency, locale)}
          </h3>
        </div>
      )}
    </StatCardShell>
  );
}
