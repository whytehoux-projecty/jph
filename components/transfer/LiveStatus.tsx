"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusPill, type Status } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecentTransferRequests, getTransferStatuses } from "@/app/actions/transfer";
import { formatAmount } from "@/lib/format";
import { LocalDate } from "@/components/dashboard/LocalDate";

const POLL_MS = 10_000;

const STATUS: Record<string, { label: string; status: Status }> = {
  PENDING: { label: "Being checked", status: "warning" },
  APPROVED: { label: "Approved", status: "success" },
  COMPLETED: { label: "Completed", status: "success" },
  REJECTED: { label: "Declined", status: "danger" },
  CANCELLED: { label: "Cancelled", status: "neutral" },
};

function TransferStatus({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status.charAt(0) + status.slice(1).toLowerCase(), status: "neutral" as Status };
  return <StatusPill status={s.status}>{s.label}</StatusPill>;
}

/** Polls the server every 10 s while a request is still pending. */
export function LiveStatusBadge({ reference, initialStatus }: { reference: string; initialStatus: string }) {
  const [status, setStatus] = React.useState(initialStatus);

  React.useEffect(() => {
    if (status !== "PENDING") return;
    const id = setInterval(async () => {
      try {
        const res = await getTransferStatuses([reference]);
        if (res[0] && res[0].status !== status) setStatus(res[0].status);
      } catch {
        /* keep last known status */
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [reference, status]);

  return (
    <span aria-live="polite">
      <TransferStatus status={status} />
    </span>
  );
}

interface Recent {
  id: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  methodId: string | null;
  createdAt: string;
}

const METHOD_LABELS: Record<string, string> = {
  internal: "Within Heritage Trust",
  ach: "ACH",
  wire_domestic: "Domestic wire",
  wire_international: "International wire",
  fednow: "FedNow",
  crypto: "Crypto wallet",
  zelle: "Zelle",
  cashapp: "Cash App",
  venmo: "Venmo",
};

/** The customer's latest transfer requests; refreshes itself while any are pending. */
export function RecentRequests({ refreshKey = 0 }: { refreshKey?: number }) {
  const [items, setItems] = React.useState<Recent[] | null>(null);
  const [failed, setFailed] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setItems(await getRecentTransferRequests(5));
      setFailed(false);
    } catch {
      setFailed(true);
      setItems((prev) => prev ?? []);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load, refreshKey]);

  const hasPending = items?.some((i) => i.status === "PENDING");
  React.useEffect(() => {
    if (!hasPending) return;
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [hasPending, load]);

  if (items === null) {
    return (
      <Card aria-busy="true" className="p-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-3 h-4 w-full" />
      </Card>
    );
  }
  if (items.length === 0 && !failed) return null;

  return (
    <section aria-labelledby="recent-requests">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 id="recent-requests" className="font-sans text-h4 text-fg">
          Your recent transfers
        </h2>
        {hasPending && <span className="text-small text-fg-muted">Status updates automatically</span>}
      </div>
      <Card>
        {failed ? (
          <p className="p-5 text-small text-fg-muted">
            We couldn't load your recent transfers. You can find them in{" "}
            <Link href="/activities" className="font-semibold text-fg-action underline underline-offset-[3px]">
              Activity
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-line" aria-live="polite">
            {items.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-body text-fg">
                    {i.description || (i.methodId && METHOD_LABELS[i.methodId]) || "Transfer"}
                  </p>
                  <p className="text-caption text-fg-muted">
                    {i.methodId && METHOD_LABELS[i.methodId] ? `${METHOD_LABELS[i.methodId]} · ` : ""}
                    <LocalDate iso={i.createdAt} />
                    {" · "}
                    <span className="font-code">{i.reference}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-fg">{formatAmount(i.amount, { currency: i.currency || "USD" })}</span>
                  <TransferStatus status={i.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
