"use client";

import { formatCurrency, languageToLocale } from "@/lib/utils";
import { StatCardShell, SplitRow } from "@/components/dashboard/StatCardShell";

interface SavingsLoansCardProps {
  savingsBalance?: number | null;
  loansBalance?: number | null;
  hasSavingsData?: boolean;
  hasLoansData?: boolean;
  currency?: string;
  language?: string;
  className?: string;
}

export function SavingsLoansCard({
  savingsBalance = 0,
  loansBalance = 0,
  hasSavingsData = true,
  hasLoansData = true,
  currency = "USD",
  language = "en",
  className,
}: SavingsLoansCardProps) {
  const locale = languageToLocale(language);

  if (!hasSavingsData && !hasLoansData) {
    return <StatCardShell caption="Savings & Loans" empty emptyHint="No savings or loans" className={className} />;
  }

  const loans = Math.abs(Number(loansBalance || 0));

  return (
    <StatCardShell caption="Savings & Loans" className={className}>
      <SplitRow
        label="Savings"
        tone="positive"
        value={formatCurrency(Number(savingsBalance || 0), currency, locale)}
      />
      <SplitRow
        label="Loans"
        tone="negative"
        value={loans > 0 ? `−${formatCurrency(loans, currency, locale)}` : formatCurrency(0, currency, locale)}
      />
    </StatCardShell>
  );
}
