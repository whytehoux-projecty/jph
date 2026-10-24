import { Card } from "@/components/ui/Card";
import { BalanceVisibilityToggle, VisibleAmount } from "./balance-visibility";

export interface CurrencyTotal {
  currency: string;
  total: number;
}

/**
 * Headline balance. Accounts in different currencies are totalled
 * separately — they are never converted or added together.
 */
export function BalanceSummary({
  totals,
  accountCount,
  locale,
}: {
  totals: CurrencyTotal[];
  accountCount: number;
  locale: string;
}) {
  const [primary, ...others] = totals;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="balance-heading" className="text-label uppercase text-fg-muted">
            Total balance
          </h2>
          <p className="mt-2">
            {primary ? (
              <VisibleAmount value={primary.total} currency={primary.currency} locale={locale} size="figure" />
            ) : (
              <VisibleAmount value={0} locale={locale} size="figure" />
            )}
          </p>
          {others.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-body text-fg">
              {others.map((t) => (
                <li key={t.currency}>
                  <VisibleAmount value={t.total} currency={t.currency} locale={locale} size="md" />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-small text-fg-muted">
            Across {accountCount} {accountCount === 1 ? "account" : "accounts"}
            {totals.length > 1 && ", shown by currency"}
          </p>
        </div>
        <div className="-mr-2 -mt-2">
          <BalanceVisibilityToggle />
        </div>
      </div>
    </Card>
  );
}
