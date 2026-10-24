import Link from "next/link";
import { ArrowRight, Landmark, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountNumber } from "@/components/ui/account-number";
import { VisibleAmount } from "./balance-visibility";

export interface DashboardAccount {
  id: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  balance: number;
  status: string;
  isPrimary: boolean;
  isExternal: boolean;
  institutionName: string | null;
}

export interface DashboardWallet {
  id: string;
  currency: string;
  balance: number;
  status: string;
}

/** "HIGH_YIELD_SAVINGS" → "High yield savings" */
export function humanize(value: string) {
  const s = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const STATUS: Record<string, { label: string; status: "warning" | "danger" | "neutral" }> = {
  FROZEN: { label: "Frozen", status: "danger" },
  SUSPENDED: { label: "Suspended", status: "danger" },
  CLOSED: { label: "Closed", status: "neutral" },
  PENDING: { label: "Opening", status: "warning" },
  DORMANT: { label: "Dormant", status: "warning" },
};

export function AccountList({
  accounts,
  wallets,
  locale,
}: {
  accounts: DashboardAccount[];
  wallets: DashboardWallet[];
  locale: string;
}) {
  return (
    <section aria-labelledby="accounts-heading">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 id="accounts-heading" className="font-sans text-h4 text-fg">
          Your accounts
        </h2>
        <Link
          href="/vaults"
          className="inline-flex min-h-11 items-center gap-1 text-small font-semibold text-fg-action underline-offset-[3px] hover:underline"
        >
          Manage accounts
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Landmark}
            title="No accounts to show yet"
            description="Once an account is open it appears here with its balance. You can open another account from Accounts."
            action={
              <Button asChild variant="secondary" icon={<Plus aria-hidden="true" />}>
                <Link href="/vaults">Go to Accounts</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {accounts.map((a) => {
            const st =
              STATUS[a.status] ??
              (a.status !== "ACTIVE" ? { label: humanize(a.status), status: "neutral" as const } : undefined);
            const name = a.isExternal && a.institutionName ? a.institutionName : humanize(a.accountType);
            return (
              <li key={a.id}>
                <Card interactive className="relative flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-sans text-h5 text-fg">
                        <Link
                          href={`/vaults/${a.id}`}
                          className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
                        >
                          {name}
                          {a.isExternal && <span className="sr-only"> (linked external account)</span>}
                        </Link>
                      </h3>
                      <p className="mt-0.5 text-small text-fg-muted">
                        <AccountNumber value={a.accountNumber} label={`${name} account`} />
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-1">
                      {a.isPrimary && <Badge variant="default">Primary</Badge>}
                      {a.isExternal && <Badge variant="outline">External</Badge>}
                      {st && <StatusPill status={st.status}>{st.label}</StatusPill>}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="text-caption text-fg-muted">Balance</p>
                    <VisibleAmount value={a.balance} currency={a.currency} locale={locale} size="lg" />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {wallets.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 font-sans text-h5 text-fg">Digital assets</h3>
          <Card>
            <ul className="divide-y divide-line">
              {wallets.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-body font-semibold text-fg">{w.currency} wallet</p>
                    {w.status !== "ACTIVE" && <p className="text-small text-fg-muted">{humanize(w.status)}</p>}
                  </div>
                  <VisibleAmount value={w.balance} currency={w.currency} locale={locale} size="md" />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </section>
  );
}
