"use client";

import { formatCurrency, languageToLocale } from "@/lib/utils";
import { StatCardShell, SplitRow } from "@/components/dashboard/StatCardShell";

interface CryptoWalletItem {
  id?: string;
  currency: string;
  balance: number;
}

interface InvestmentAccountItem {
  id?: string;
  accountType: string;
  balance: number;
  currency?: string;
}

interface InvestmentPortfolioCardProps {
  cryptoWallets?: CryptoWalletItem[];
  investmentAccounts?: InvestmentAccountItem[];
  currency?: string;
  language?: string;
  className?: string;
}

export function InvestmentPortfolioCard({
  cryptoWallets = [],
  investmentAccounts = [],
  currency = "USD",
  language = "en",
  className,
}: InvestmentPortfolioCardProps) {
  const locale = languageToLocale(language);

  if (cryptoWallets.length === 0 && investmentAccounts.length === 0) {
    return <StatCardShell caption="Investments" empty emptyHint="No portfolio linked" className={className} />;
  }

  const crypto = cryptoWallets.reduce((s, w) => s + Number(w.balance || 0), 0);
  const brokerage = investmentAccounts.reduce((s, a) => s + Number(a.balance || 0), 0);
  const total = crypto + brokerage;
  const fmt = (n: number) => formatCurrency(n, currency, locale);

  return (
    <StatCardShell caption="Investments" className={className}>
      <div
        title={fmt(total)}
        className="text-xl xl:text-2xl font-bold font-mono tabular-nums tracking-tight text-ink-900 truncate"
      >
        {fmt(total)}
      </div>
      <div className="pt-2 border-t border-paper-200/70 flex flex-col gap-1.5">
        <SplitRow label="USDC/USDT" tone="neutral" value={fmt(crypto)} />
        <SplitRow label="Brokerage" tone="neutral" value={fmt(brokerage)} />
      </div>
    </StatCardShell>
  );
}
