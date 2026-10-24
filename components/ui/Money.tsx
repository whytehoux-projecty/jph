import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/format";

/**
 * Plain currency text with tabular figures. Kept for existing call sites;
 * new code uses <Amount> (components/ui/amount.tsx), which adds credit/debit
 * tone and masking.
 */
interface MoneyProps {
  amount: number | string;
  currency?: string;
  locale?: string;
  className?: string;
  signDisplay?: "auto" | "always" | "never" | "exceptZero";
}

export function Money({
  amount,
  currency = "USD",
  locale = "en-US",
  className,
  signDisplay = "auto",
}: MoneyProps) {
  const formatted = formatAmount(amount, { currency, locale, signDisplay });

  if (formatted === null) {
    return <span className={cn("font-sans tabular-nums lining-nums text-fg-muted", className)}>-</span>;
  }

  return (
    <span className={cn("font-sans tabular-nums lining-nums", className)}>
      {formatted}
    </span>
  );
}
