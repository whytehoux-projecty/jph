import Link from "next/link";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Receipt } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusPill, type Status } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/Button";
import { VisibleAmount } from "./balance-visibility";
import { LocalDate } from "./LocalDate";
import { humanize } from "./AccountList";

export interface DashboardTransaction {
  id: string;
  type: string; // CREDIT | DEBIT
  transactionType: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

const STATUS: Record<string, { label: string; status: Status }> = {
  PENDING: { label: "Pending", status: "warning" },
  REJECTED: { label: "Declined", status: "danger" },
  CANCELLED: { label: "Cancelled", status: "neutral" },
  DISPUTED: { label: "Disputed", status: "info" },
};

export function RecentTransactions({
  transactions,
  locale,
  title = "Recent activity",
  viewAllHref = "/activities",
  emptyDescription = "Deposits, transfers and payments will be listed here as soon as they happen.",
}: {
  transactions: DashboardTransaction[];
  locale: string;
  title?: string;
  viewAllHref?: string | null;
  emptyDescription?: string;
}) {
  return (
    <section aria-labelledby="recent-heading">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 id="recent-heading" className="font-sans text-h4 text-fg">
          {title}
        </h2>
        {transactions.length > 0 && viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex min-h-11 items-center gap-1 text-small font-semibold text-fg-action underline-offset-[3px] hover:underline"
          >
            View all activity
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      <Card>
        {transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description={emptyDescription}
            action={
              <Button asChild variant="secondary">
                <Link href="/deposit">Make a deposit</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {transactions.map((t) => {
              const credit = t.type === "CREDIT";
              const st = STATUS[t.status];
              const Icon = credit ? ArrowDownLeft : ArrowUpRight;
              const muted = t.status === "REJECTED" || t.status === "CANCELLED";
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-round bg-surface-muted text-fg-muted"
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body text-fg">{t.description || humanize(t.transactionType)}</p>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-fg-muted">
                      <LocalDate iso={t.createdAt} locale={locale} />
                      <span aria-hidden="true">·</span>
                      <span>{humanize(t.transactionType)}</span>
                      {st && <StatusPill status={st.status}>{st.label}</StatusPill>}
                    </p>
                  </div>
                  <div className={muted ? "text-right line-through decoration-fg-muted" : "text-right"}>
                    <span className="sr-only">{credit ? "Money in" : "Money out"}: </span>
                    <VisibleAmount
                      value={credit ? Math.abs(t.amount) : -Math.abs(t.amount)}
                      currency={t.currency}
                      locale={locale}
                      tone="auto"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
