import { Card } from "@/components/ui/Card";
import { VisibleAmount } from "./balance-visibility";

/**
 * Money in and out since the 1st of this month, from getTransactionStats
 * (all statuses except declined). Only rendered when every account shares
 * one currency, because the stats are not split by currency.
 */
export function MonthSummary({
  moneyIn,
  moneyOut,
  currency,
  locale,
}: {
  moneyIn: number;
  moneyOut: number;
  currency: string;
  locale: string;
}) {
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date());
  return (
    <Card className="p-5">
      <h2 className="font-sans text-h5 text-fg">This month</h2>
      <p className="text-small text-fg-muted">Since 1 {month}, including pending items</p>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-caption text-fg-muted">Money in</dt>
          <dd className="mt-1">
            <VisibleAmount value={moneyIn} currency={currency} locale={locale} size="md" />
          </dd>
        </div>
        <div>
          <dt className="text-caption text-fg-muted">Money out</dt>
          <dd className="mt-1">
            <VisibleAmount value={moneyOut} currency={currency} locale={locale} size="md" />
          </dd>
        </div>
      </dl>
    </Card>
  );
}
