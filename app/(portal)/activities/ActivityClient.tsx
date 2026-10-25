"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Download, FilterX, Receipt, RotateCw, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FormField } from "@/components/ui/form-field";
import { StatusPill } from "@/components/ui/badge";
import { Amount } from "@/components/ui/amount";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocalDate } from "@/components/dashboard/LocalDate";
import { exportTransactions, queryTransactions, type TransactionQuery } from "@/app/actions/transactions";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";
import { humanizeType, toActivityRow, txStatus, type ActivityRow } from "./activity-row";
import { TransactionSheet } from "./TransactionSheet";

type DatePreset = "all" | "7" | "30" | "90" | "year" | "custom";

interface Filters {
  search: string;
  accountId: string;
  preset: DatePreset;
  from: string;
  to: string;
  direction: "" | "in" | "out";
  status: "" | NonNullable<TransactionQuery["status"]>;
}

const EMPTY: Filters = { search: "", accountId: "", preset: "all", from: "", to: "", direction: "", status: "" };

function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toQuery(f: Filters, page: number, pageSize: number): TransactionQuery {
  const q: TransactionQuery = { page, pageSize };
  if (f.search.trim()) q.search = f.search.trim();
  if (f.accountId) q.accountId = f.accountId;
  if (f.direction) q.direction = f.direction;
  if (f.status) q.status = f.status;
  const today = new Date();
  if (f.preset === "custom") {
    if (f.from) q.from = f.from;
    if (f.to) q.to = f.to;
  } else if (f.preset === "year") {
    q.from = `${today.getFullYear()}-01-01`;
  } else if (f.preset !== "all") {
    const start = new Date(today);
    start.setDate(today.getDate() - Number(f.preset) + 1);
    q.from = isoDay(start);
  }
  return q;
}

function csvCell(v: unknown) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function ActivityClient({
  accounts,
  locale,
  fallbackCurrency,
  initial,
}: {
  accounts: Array<{ id: string; label: string }>;
  locale: string;
  fallbackCurrency: string;
  initial: { rows: ActivityRow[]; total: number; pageSize: number };
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ActivityRow[]>(initial.rows);
  const [total, setTotal] = useState(initial.total);
  const [state, setState] = useState<"ready" | "loading" | "error">("ready");
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<ActivityRow | null>(null);
  const pageSize = initial.pageSize;
  const first = useRef(true);
  const requestId = useRef(0);

  const dateError =
    filters.preset === "custom" && filters.from && filters.to && filters.from > filters.to
      ? "The start date must be on or before the end date."
      : null;

  const load = useCallback(
    async (f: Filters, p: number) => {
      const id = ++requestId.current;
      setState("loading");
      try {
        const res = await queryTransactions(toQuery(f, p, pageSize));
        if (id !== requestId.current) return; // a newer search has started
        setRows(res.rows.map((t) => toActivityRow(t)));
        setTotal(res.total);
        setState("ready");
      } catch {
        if (id === requestId.current) setState("error");
      }
    },
    [pageSize],
  );

  // Re-query when filters change (search is debounced) or the page changes.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (dateError) return;
    const t = window.setTimeout(() => load(filters, page), filters.search ? 350 : 0);
    return () => window.clearTimeout(t);
  }, [filters, page, load, dateError]);

  // Pending items update without a reload while they are on screen.
  const hasPending = rows.some((r) => r.status === "PENDING" || r.status === "PROCESSING");
  useEffect(() => {
    if (!hasPending) return;
    const t = window.setInterval(() => load(filters, page), 30_000);
    return () => window.clearInterval(t);
  }, [hasPending, filters, page, load]);

  const update = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const active = useMemo(() => JSON.stringify(filters) !== JSON.stringify(EMPTY), [filters]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const download = async () => {
    setExporting(true);
    try {
      const all = (await exportTransactions(toQuery(filters, 1, pageSize))).map((t) => toActivityRow(t));
      const header = ["Date", "Description", "Type", "Money in", "Money out", "Currency", "Status", "Reference", "Account (last 4)", "Category"];
      const lines = all.map((r) =>
        [
          r.createdAt.slice(0, 10),
          r.description,
          humanizeType(r.transactionType),
          r.type === "CREDIT" ? r.amount.toFixed(2) : "",
          r.type === "DEBIT" ? r.amount.toFixed(2) : "",
          r.currency,
          txStatus(r.status).label,
          r.reference,
          r.accountLast4,
          r.category ?? "",
        ]
          .map(csvCell)
          .join(","),
      );
      const blob = new Blob([[header.join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `heritage-vault-activity-${isoDay(new Date())}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success({ title: "Download ready", description: `${all.length} transactions exported.` });
    } catch (err) {
      toast.error({ title: "The download didn't work", description: userFacingError(err, "Please try again.") });
    } finally {
      setExporting(false);
    }
  };

  const onRowUpdated = (row: ActivityRow) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
    setSelected(row);
  };

  return (
    <>
      <PageHeader
        title="Activity"
        description="Every payment in and out of your accounts. Select a transaction for details, a receipt, or to report a problem."
        actions={
          <Button variant="secondary" icon={<Download aria-hidden="true" />} onClick={download} loading={exporting} loadingLabel="Preparing download" disabled={total === 0}>
            Download CSV
          </Button>
        }
      />

      <Card className="mb-4 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <FormField label="Search" className="sm:col-span-2 xl:col-span-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Description or reference"
                value={filters.search}
                onChange={(e) => update({ search: e.target.value })}
                className="pl-9"
              />
            </div>
          </FormField>
          <FormField label="Account">
            <NativeSelect value={filters.accountId} onChange={(e) => update({ accountId: e.target.value })}>
              <option value="">All accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Date">
            <NativeSelect value={filters.preset} onChange={(e) => update({ preset: e.target.value as DatePreset })}>
              <option value="all">All dates</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="year">This year</option>
              <option value="custom">Choose dates…</option>
            </NativeSelect>
          </FormField>
          <FormField label="Money in or out">
            <NativeSelect value={filters.direction} onChange={(e) => update({ direction: e.target.value as Filters["direction"] })}>
              <option value="">In and out</option>
              <option value="in">Money in</option>
              <option value="out">Money out</option>
            </NativeSelect>
          </FormField>
          <FormField label="Status">
            <NativeSelect value={filters.status} onChange={(e) => update({ status: e.target.value as Filters["status"] })}>
              <option value="">Any status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </NativeSelect>
          </FormField>
        </div>
        {filters.preset === "custom" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:max-w-xl">
            <FormField label="From" error={dateError}>
              <Input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => update({ from: e.target.value })} />
            </FormField>
            <FormField label="To">
              <Input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => update({ to: e.target.value })} />
            </FormField>
          </div>
        )}
        {active && (
          <div className="mt-3">
            <Button variant="tertiary" size="sm" icon={<FilterX aria-hidden="true" />} onClick={() => update(EMPTY)}>
              Clear filters
            </Button>
          </div>
        )}
      </Card>

      <p className="mb-3 text-small text-fg-muted" role="status" aria-live="polite">
        {state === "loading" ? "Updating…" : `${total.toLocaleString(locale)} ${total === 1 ? "transaction" : "transactions"}${active ? " match your filters" : ""}`}
      </p>

      {state === "error" ? (
        <Alert
          variant="danger"
          title="We couldn't load your transactions"
          actions={
            <Button variant="secondary" size="sm" icon={<RotateCw aria-hidden="true" />} onClick={() => load(filters, page)}>
              Try again
            </Button>
          }
        >
          Your money is not affected. Check your connection and try again.
        </Alert>
      ) : state === "loading" && rows.length === 0 ? (
        <Card aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 border-b border-line px-5 py-4 last:border-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          {active ? (
            <EmptyState
              icon={FilterX}
              title="No transactions match these filters"
              description="Try a wider date range or clear the filters."
              action={<Button variant="secondary" onClick={() => update(EMPTY)}>Clear filters</Button>}
            />
          ) : (
            <EmptyState icon={Receipt} title="No transactions yet" description="Payments in and out of your accounts will be listed here." />
          )}
        </Card>
      ) : (
        <Card className={state === "loading" ? "opacity-60 transition-opacity" : undefined} aria-busy={state === "loading"}>
          <Table stackOnMobile>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead numeric>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const st = txStatus(r.status);
                const credit = r.type === "CREDIT";
                return (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                    <TableCell label="Date" className="whitespace-nowrap text-fg-muted">
                      <LocalDate iso={r.createdAt} locale={locale} />
                    </TableCell>
                    <TableCell className="max-md:order-first">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(r);
                        }}
                        className="flex items-start gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                      >
                        {credit ? (
                          <ArrowDownLeft className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden="true" />
                        )}
                        <span>
                          <span className="block text-body text-fg">{r.description || humanizeType(r.transactionType)}</span>
                          <span className="block text-caption text-fg-muted">
                            {humanizeType(r.transactionType)}
                            {r.accountLast4 && ` · account ending ${r.accountLast4}`}
                          </span>
                        </span>
                      </button>
                    </TableCell>
                    <TableCell label="Status">
                      <StatusPill status={st.status}>{st.label}</StatusPill>
                    </TableCell>
                    <TableCell label="Amount" numeric>
                      <span className="sr-only">{credit ? "Money in" : "Money out"}: </span>
                      <Amount value={credit ? r.amount : -r.amount} currency={r.currency || fallbackCurrency} locale={locale} tone="auto" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {state !== "error" && total > pageSize && (
        <Pagination className="mt-6" page={page} pageCount={pageCount} onPageChange={setPage} label="Transaction pages" />
      )}

      <TransactionSheet
        transaction={selected}
        locale={locale}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdated={onRowUpdated}
      />
    </>
  );
}
