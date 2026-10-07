"use client";

import * as React from "react";
import { getRecentTransferRequests, getTransferStatuses } from "@/app/actions/transfer";
import { cn } from "@/lib/utils";
import { fmtMoney } from "@/lib/transfer-forms/validators";

const POLL_MS = 10_000;

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending approval", cls: "bg-warning-bg text-warning" },
  APPROVED: { label: "Approved", cls: "bg-success-bg text-success" },
  COMPLETED: { label: "Completed", cls: "bg-success-bg text-success" },
  REJECTED: { label: "Rejected", cls: "bg-error-bg text-error" },
  CANCELLED: { label: "Cancelled", cls: "bg-paper-200 text-ink-700" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { label: status, cls: "bg-paper-200 text-ink-700" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", s.cls)}>
      {status === "PENDING" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {s.label}
    </span>
  );
}

/** Polls the server every 10s while a request is still pending. */
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
      <StatusBadge status={status} />
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
  internal: "Internal",
  ach: "ACH",
  wire_domestic: "Domestic wire",
  wire_international: "International wire",
  fednow: "FedNow",
  crypto: "Digital wallet",
  zelle: "Zelle",
  cashapp: "Cash App",
  venmo: "Venmo",
};

/** Recent transfer requests; refreshes itself while any are pending. */
export function RecentRequests({ refreshKey = 0 }: { refreshKey?: number }) {
  const [items, setItems] = React.useState<Recent[] | null>(null);

  const load = React.useCallback(async () => {
    try {
      setItems(await getRecentTransferRequests(5));
    } catch {
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

  if (!items || items.length === 0) return null;

  return (
    <section aria-labelledby="recent-requests" className="rounded border border-paper-300 bg-paper-50">
      <div className="flex items-center justify-between border-b border-paper-200 px-5 py-3">
        <h2 id="recent-requests" className="font-display text-base font-semibold text-ink-900">
          Recent requests
        </h2>
        {hasPending && <span className="text-xs text-ink-500">Updating live</span>}
      </div>
      <ul className="divide-y divide-paper-200" aria-live="polite">
        {items.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-small">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">
                {METHOD_LABELS[i.methodId ?? ""] ?? "Transfer"} · {i.description}
              </p>
              <p className="text-xs text-ink-500">
                <span className="font-mono">{i.reference}</span> · {new Date(i.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono tabular-nums text-ink-900">{fmtMoney(i.amount, i.currency || "USD")}</span>
              <StatusBadge status={i.status} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
