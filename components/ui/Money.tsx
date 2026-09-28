import { cn, formatCurrency } from "@/lib/utils";

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
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  const isNaN = Number.isNaN(numericAmount);
  
  if (isNaN) {
    return <span className={cn("font-mono tabular-nums lining-nums text-muted-foreground", className)}>-</span>;
  }

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    signDisplay,
  }).format(numericAmount);

  return (
    <span className={cn("font-mono tabular-nums lining-nums", className)}>
      {formatted}
    </span>
  );
}
