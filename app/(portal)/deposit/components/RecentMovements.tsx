"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { Amount } from "@/components/ui/amount";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill, type Status } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocalDate } from "@/components/dashboard/LocalDate";
import { MASK } from "@/lib/format";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import type { RecentMoneyMovement } from "@/app/actions/deposits";

const STATUS: Record<string, { label: string; status: Status }> = {
  PENDING: { label: "Being checked", status: "warning" },
  APPROVED: { label: "Completed", status: "success" },
  COMPLETED: { label: "Completed", status: "success" },
  REJECTED: { label: "Declined", status: "danger" },
  CANCELLED: { label: "Cancelled", status: "neutral" },
};

export function RecentMovements({ items, locale }: { items: RecentMoneyMovement[]; locale: string }) {
  return (
    <section aria-labelledby="recent-heading" className="mt-10">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 id="recent-heading" className="font-sans text-h4 text-fg">
          Recent deposits and withdrawals
        </h2>
        {items.length > 0 && (
          <Button asChild variant="link">
            <Link href="/activities">All activity</Link>
          </Button>
        )}
      </div>
      <Card>
        {items.length === 0 ? (
          <EmptyState
            compact
            icon={Inbox}
            headingLevel={3}
            title="Nothing here yet"
            description="Deposits and withdrawals you request on this page appear here with their status."
          />
        ) : (
          <Table stackOnMobile>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead numeric>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m) => {
                const s = STATUS[m.status] ?? { label: m.status.charAt(0) + m.status.slice(1).toLowerCase(), status: "neutral" as Status };
                const type = VAULT_TYPES[normalizeVaultType(m.accountType)]?.label ?? m.accountType;
                return (
                  <TableRow key={m.id}>
                    <TableCell label="Date" className="whitespace-nowrap">
                      <LocalDate iso={m.createdAt} locale={locale} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/activities/receipt/${m.id}`} className="text-body text-fg underline-offset-[3px] hover:underline">
                        {m.description}
                      </Link>
                      <span className="block text-caption text-fg-muted">
                        {type} {MASK} {m.accountLast4} · <span className="font-code">{m.reference}</span>
                      </span>
                    </TableCell>
                    <TableCell label="Status">
                      <StatusPill status={s.status}>{s.label}</StatusPill>
                    </TableCell>
                    <TableCell label="Amount" numeric>
                      <Amount
                        value={m.direction === "out" ? -m.amount : m.amount}
                        currency={m.currency}
                        locale={locale}
                        tone="auto"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </section>
  );
}
