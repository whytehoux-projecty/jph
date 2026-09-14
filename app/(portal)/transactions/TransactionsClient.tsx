"use client";


import { useState, useEffect, useRef, Suspense, Fragment } from "react";
import { updateCategory, addNote, disputeTransaction } from "@/app/actions/transactions";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Calendar,
  X,
  Edit2,
  Check,
  Briefcase,
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertTriangle,
  Tag,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VintageIcon } from "@/components/ui/vintage-icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";

const categories = [
  "General",
  "Income",
  "Shopping",
  "Dining",
  "Utilities",
  "Transportation",
  "Health",
  "Transfer",
  "Interest",
  "Groceries",
  "Entertainment",
  "Services",
];

function isSameCalendarMonth(date: Date, now: Date) {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

type ExportOptionsProps = {
  onExportCsv: () => void;
  onDownloadStatement: () => void;
};

function ExportOptions({
  onExportCsv,
  onDownloadStatement,
}: ExportOptionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        variant="outline"
        icon={<Download className="w-4 h-4" />}
        onClick={onExportCsv}>
        Export CSV
      </Button>
      <Button
        variant="primary"
        icon={<FileText className="w-4 h-4" />}
        onClick={onDownloadStatement}>
        Download statement
      </Button>
    </div>
  );
}

type TransactionFiltersPanelProps = {
  categoryFilters: string[];
  setCategoryFilters: (updater: any) => void;
  transactionTypes: string[];
  setTransactionTypes: (updater: any) => void;
  statusFilters: string[];
  setStatusFilters: (updater: any) => void;
  minAmount: string;
  setMinAmount: (v: string) => void;
  maxAmount: string;
  setMaxAmount: (v: string) => void;
  handleClearFilters: () => void;
};

function TransactionFiltersPanel({
  categoryFilters,
  setCategoryFilters,
  transactionTypes,
  setTransactionTypes,
  statusFilters,
  setStatusFilters,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  handleClearFilters,
}: TransactionFiltersPanelProps) {
  return (
    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilters([])}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              categoryFilters.length === 0
                ? "bg-charcoal text-white border-charcoal"
                : "text-muted-foreground hover:bg-slate-100/80"
            }`}>
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                setCategoryFilters((prev: string[]) =>
                  prev.includes(cat)
                    ? prev.filter((c) => c !== cat)
                    : [...prev, cat],
                )
              }
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                categoryFilters.includes(cat)
                  ? "bg-charcoal text-white border-charcoal"
                  : "text-muted-foreground hover:bg-slate-100/80"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
          Type
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "credit", label: "Credit" },
            { id: "debit", label: "Debit" },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() =>
                setTransactionTypes((prev: string[]) =>
                  prev.includes(type.id)
                    ? prev.filter((t) => t !== type.id)
                    : [...prev, type.id],
                )
              }
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                transactionTypes.includes(type.id)
                  ? "bg-charcoal text-white border-charcoal"
                  : "text-muted-foreground hover:bg-slate-100/80"
              }`}>
              {type.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {["COMPLETED", "PENDING", "FAILED", "CANCELLED", "DISPUTED"].map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilters((prev: string[]) =>
                    prev.includes(status)
                      ? prev.filter((s) => s !== status)
                      : [...prev, status],
                  )
                }
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  statusFilters.includes(status)
                    ? "bg-charcoal text-white border-charcoal"
                    : "text-muted-foreground hover:bg-slate-100/80"
                }`}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ),
          )}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
          Amount Range
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1">
            <span className="text-xs text-muted-foreground">$</span>
            <Input
              type="number"
              placeholder="Min"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
          <span className="text-xs text-muted-foreground">to</span>
          <div className="flex-1 flex items-center gap-1">
            <span className="text-xs text-muted-foreground">$</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="md:col-span-4 flex justify-end">
        <Button
          variant="ghost"
          size="small"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleClearFilters}>
          Clear all filters
        </Button>
      </div>
    </div>
  );
}

type TransactionRowProps = {
  tx: any;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  editingTxId: string | null;
  editingCategory: string;
  setEditingCategory: (v: string) => void;
  startEditing: (tx: any) => void;
  handleUpdateCategory: (id: string) => void;
  handleExportReceipt: (tx: any) => void;
  cancelEditing: () => void;
  activeDisputeId: string | null;
  disputeReason: string;
  setDisputeReason: (v: string) => void;
  disputeFiles: File[];
  setDisputeFiles: (files: File[]) => void;
  disputeSubmitting: boolean;
  handleDisputeStart: (tx: any) => void;
  handleDisputeCancel: () => void;
  handleDisputeSubmit: (tx: any) => void;
  handleAddNote: (tx: any) => void;
  showAllNotesFor: string | null;
  setShowAllNotesFor: (id: string | null) => void;
};

function TransactionRow({
  tx,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpanded,
  editingTxId,
  editingCategory,
  setEditingCategory,
  startEditing,
  handleUpdateCategory,
  handleExportReceipt,
  cancelEditing,
  activeDisputeId,
  disputeReason,
  setDisputeReason,
  disputeFiles,
  setDisputeFiles,
  disputeSubmitting,
  handleDisputeStart,
  handleDisputeCancel,
  handleDisputeSubmit,
  handleAddNote,
  showAllNotesFor,
  setShowAllNotesFor,
}: TransactionRowProps) {
  const accountLabel =
    tx.accountName ||
    (tx.accountLast4 ? `•••• ${tx.accountLast4}` : null) ||
    tx.accountNumber ||
    tx.accountId ||
    "";
  const dateLabel = new Date(tx.createdAt || tx.date).toLocaleDateString();

  return (
    <Fragment key={tx.id}>
      <TableRow data-testid="transaction-item">
        <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={isSelected}
            onChange={() => onToggleSelect(tx.id)}
            aria-label="Select transaction"
          />
        </TableCell>
        <TableCell>
          <div className="flex justify-center w-8">
            {Number(tx.amount) > 0 ? (
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowUpRight className="h-4 w-4 text-red-600" />
            )}
          </div>
        </TableCell>
        <TableCell className="font-medium">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px] text-slate-600">
              {String(tx.merchantName || tx.description || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <div>{tx.description}</div>
              <div className="text-xs text-muted-foreground md:hidden mt-0.5">
                {dateLabel}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          {editingTxId === tx.id ? (
            <div className="flex items-center gap-1">
              <Select
                value={editingCategory}
                onValueChange={setEditingCategory}>
                <SelectTrigger className="h-7 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="small"
                className="h-7 w-7 p-0 text-green-600"
                onClick={() => handleUpdateCategory(tx.id)}>
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="small"
                className="h-7 w-7 p-0 text-red-600"
                onClick={cancelEditing}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div
              className="group flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => startEditing(tx)}>
              <Badge
                variant="outline"
                className="font-normal text-muted-foreground group-hover:border-primary group-hover:text-primary">
                {tx.category || "Uncategorized"}
              </Badge>
              <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </div>
          )}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {accountLabel || "—"}
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {dateLabel}
          </div>
        </TableCell>
        <TableCell
          className={`text-right font-mono font-semibold ${Number(tx.amount) > 0 ? "text-green-600" : "text-foreground"}`}>
          {Number(tx.amount) > 0 ? "+" : ""}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(Number(tx.amount))}
        </TableCell>
        <TableCell className="text-right">
          {(() => {
            const normalizedStatus = String(tx.status || "").toUpperCase();
            let variant:
              | "default"
              | "secondary"
              | "destructive"
              | "outline"
              | "success"
              | "warning" = "default";
            let label = normalizedStatus || "UNKNOWN";
            let dotClasses = "";

            switch (normalizedStatus) {
              case "COMPLETED":
                variant = "success";
                label = "Completed";
                dotClasses = "bg-green-500";
                break;
              case "PENDING":
                variant = "warning";
                label = "Pending";
                dotClasses = "bg-yellow-500 animate-pulse";
                break;
              case "FAILED":
                variant = "destructive";
                label = "Failed";
                dotClasses = "bg-red-500";
                break;
              case "CANCELLED":
                variant = "secondary";
                label = "Cancelled";
                dotClasses = "bg-slate-400";
                break;
              case "DISPUTED":
                variant = "destructive";
                label = "Disputed";
                dotClasses = "bg-amber-500";
                break;
              default:
                variant = "default";
                label =
                  normalizedStatus.charAt(0) +
                    normalizedStatus.slice(1).toLowerCase() || "Unknown";
                dotClasses = "";
                break;
            }

            return (
              <Badge
                variant={variant}
                className="text-[10px] inline-flex items-center">
                {dotClasses && (
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${dotClasses}`}
                  />
                )}
                {label}
              </Badge>
            );
          })()}
        </TableCell>
        <TableCell
          className="text-right pr-4"
          onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 text-muted-foreground"
            onClick={() => onToggleExpanded(tx.id)}
            aria-label={
              isExpanded
                ? "Hide transaction details"
                : "Show transaction details"
            }>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-slate-50/60">
          <TableCell colSpan={9}>
            <div className="px-4 py-3 text-xs text-muted-foreground space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="font-semibold text-[11px] uppercase tracking-wide text-slate-500">
                    Transaction ID
                  </div>
                  <div className="font-mono text-[12px] text-charcoal">
                    {tx.id}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-[11px] uppercase tracking-wide text-slate-500">
                    Account
                  </div>
                  <div className="text-sm">{accountLabel || "—"}</div>
                </div>
                <div>
                  <div className="font-semibold text-[11px] uppercase tracking-wide text-slate-500">
                    Time
                  </div>
                  <div>
                    {new Date(tx.createdAt || tx.date).toLocaleString()}
                  </div>
                </div>
                {tx.reference && (
                  <div>
                    <div className="font-semibold text-[11px] uppercase tracking-wide text-slate-500">
                      Reference
                    </div>
                    <div>{tx.reference}</div>
                  </div>
                )}
                {tx.runningBalance && (
                  <div>
                    <div className="font-semibold text-[11px] uppercase tracking-wide text-slate-500">
                      Running balance
                    </div>
                    <div>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(Number(tx.runningBalance))}
                    </div>
                  </div>
                )}
              </div>

              {(() => {
                const rawNotes: any =
                  Array.isArray(tx.notes) && tx.notes.length > 0
                    ? tx.notes
                    : tx.note
                      ? [{ text: tx.note }]
                      : [];
                const notes = Array.isArray(rawNotes) ? rawNotes : [];

                if (notes.length === 0) return null;

                const isAllVisible = showAllNotesFor === tx.id;
                const visibleNotes = isAllVisible ? notes : notes.slice(0, 3);

                return (
                  <div className="pt-3 border-t border-slate-200 space-y-1">
                    <div className="font-semibold text-[11px] uppercase tracking-wide text-slate-500">
                      Notes
                    </div>
                    <ul className="space-y-1">
                      {visibleNotes.map((note: any, index: number) => (
                        <li
                          key={note.id ?? index}
                          className="flex gap-2 text-slate-700">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <div>
                            <div className="text-xs">
                              {note.text || note.content || String(note)}
                            </div>
                            {note.authorName && (
                              <div className="text-[11px] text-slate-400">
                                {note.authorName}
                              </div>
                            )}
                            {note.createdAt && (
                              <div className="text-[11px] text-slate-400">
                                {new Date(note.createdAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {notes.length > 3 && (
                      <button
                        type="button"
                        className="mt-1 text-[11px] text-primary hover:underline"
                        onClick={() =>
                          setShowAllNotesFor(isAllVisible ? null : tx.id)
                        }>
                        {isAllVisible
                          ? "Show fewer"
                          : `View all ${notes.length} notes`}
                      </button>
                    )}
                  </div>
                );
              })()}

              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
                <Button
                  variant="outline"
                  size="small"
                  className="h-8 text-xs"
                  onClick={() => handleExportReceipt(tx)}>
                  <FileText className="w-3 h-3 mr-1" />
                  Export receipt
                </Button>
                {activeDisputeId === tx.id ? (
                  <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                    <div className="flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                        Dispute reason
                      </div>
                      <Select
                        value={disputeReason}
                        onValueChange={setDisputeReason}>
                        <SelectTrigger className="h-8 w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unrecognized transaction">
                            Unrecognized transaction
                          </SelectItem>
                          <SelectItem value="Incorrect amount">
                            Incorrect amount
                          </SelectItem>
                          <SelectItem value="Duplicate charge">
                            Duplicate charge
                          </SelectItem>
                          <SelectItem value="Service not received">
                            Service not received
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 text-[11px] text-slate-600">
                        <span>Attachments</span>
                        <input
                          type="file"
                          multiple
                          className="block text-[11px]"
                          onChange={(e) =>
                            setDisputeFiles(
                              Array.from((e.target as any).files || []),
                            )
                          }
                        />
                      </label>
                      <Button
                        variant="ghost"
                        size="small"
                        className="h-8 text-xs"
                        onClick={handleDisputeCancel}
                        disabled={disputeSubmitting}>
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="small"
                        className="h-8 text-xs"
                        onClick={() => handleDisputeSubmit(tx)}
                        disabled={disputeSubmitting}>
                        {disputeSubmitting ? "Submitting..." : "Submit dispute"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="small"
                    className="h-8 text-xs"
                    onClick={() => handleDisputeStart(tx)}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Dispute
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="small"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => handleAddNote(tx)}>
                  <Tag className="w-3 h-3 mr-1" />
                  Add note / tag
                </Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}
type TransactionsAnalyticsProps = {
  filteredTransactions: any[];
  liveMessage: string;
};

function TransactionsAnalytics({
  filteredTransactions,
  liveMessage,
}: TransactionsAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending insights</CardTitle>
        <CardDescription>
          Quick view of where your money is going this period.
        </CardDescription>
        <div className="sr-only" aria-live="polite">
          {liveMessage || `Showing ${filteredTransactions.length} transactions`}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Top categories by spend
          </p>
          {(() => {
            const spendByCategory = new Map<string, number>();
            for (const tx of filteredTransactions) {
              const amount = Number(tx.amount);
              if (!(tx.type === "WITHDRAWAL" || amount < 0)) continue;
              const key = tx.category || "Uncategorized";
              const current = spendByCategory.get(key) || 0;
              spendByCategory.set(key, current + Math.abs(amount));
            }
            const items = Array.from(spendByCategory.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);
            if (items.length === 0) {
              return (
                <p className="text-xs text-muted-foreground">
                  No spending data for the selected filters.
                </p>
              );
            }
            const max = items[0][1] || 1;
            return (
              <ul className="space-y-2">
                {items.map(([cat, value]) => (
                  <li key={cat} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium text-charcoal">{cat}</span>
                        <span className="text-muted-foreground">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(value)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-red-300"
                          style={{
                            width: `${Math.max(6, (value / max) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Top merchants by spend
          </p>
          {(() => {
            const spendByMerchant = new Map<string, number>();
            for (const tx of filteredTransactions) {
              const amount = Number(tx.amount);
              if (!(tx.type === "WITHDRAWAL" || amount < 0)) continue;
              const key = tx.merchantName || tx.description || "Merchant";
              const current = spendByMerchant.get(key) || 0;
              spendByMerchant.set(key, current + Math.abs(amount));
            }
            const items = Array.from(spendByMerchant.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);
            if (items.length === 0) {
              return (
                <p className="text-xs text-muted-foreground">
                  No merchant data for the selected filters.
                </p>
              );
            }
            const max = items[0][1] || 1;
            return (
              <ul className="space-y-2">
                {items.map(([merchant, value]) => (
                  <li key={merchant} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium text-charcoal">
                          {merchant}
                        </span>
                        <span className="text-muted-foreground">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(value)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-red-300"
                          style={{
                            width: `${Math.max(6, (value / max) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TransactionsClient({
  initialTransactions,
  initialAccounts,
  initialStats,
  userPreferences
}: {
  initialTransactions: any[];
  initialAccounts: any[];
  initialStats: any;
  userPreferences: any;
}) {
  const [accounts, setAccounts] = useState<any[]>(initialAccounts);
  const [stats, setStats] = useState<any>(initialStats);
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  type SearchScope =
    | "all"
    | "description"
    | "category"
    | "amount"
    | "idref"
    | "notes";
  const [searchScope, setSearchScope] = useState<SearchScope>("all");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePreset, setDatePreset] = useState<"30d" | "7d" | "all">("30d");
  const [showFilters, setShowFilters] = useState(false);
  const [transactionTypes, setTransactionTypes] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>("");
  const [disputeSubmitting, setDisputeSubmitting] = useState<boolean>(false);
  const [disputeFiles, setDisputeFiles] = useState<File[]>([]);
  const [showAllNotesFor, setShowAllNotesFor] = useState<string | null>(null);

  // Prompt-replacement dialogs
  const [promptDialog, setPromptDialog] = useState<{
    type: "bulkDispute" | "bulkTag" | "bulkReview" | "addNote";
    tx?: any;
  } | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [kpiQuickFilter, setKpiQuickFilter] = useState<
    "all" | "income" | "expenses"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [quickView, setQuickView] = useState<"none" | "large" | "thisMonth">(
    "none",
  );
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [hasNewData, setHasNewData] = useState(false);
  const transactionsRef = useRef<any[]>(initialTransactions);
  const [liveMessage, setLiveMessage] = useState("");
  const [bulkCategory, setBulkCategory] = useState<string>("");

  useEffect(() => {
    // Data is loaded via Server Component props
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("transactionsFilters");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (parsed.searchQuery != null) setSearchQuery(parsed.searchQuery);
      if (
        parsed.searchScope === "all" ||
        parsed.searchScope === "description" ||
        parsed.searchScope === "category" ||
        parsed.searchScope === "amount" ||
        parsed.searchScope === "idref" ||
        parsed.searchScope === "notes"
      ) {
        setSearchScope(parsed.searchScope);
      }
      if (Array.isArray(parsed.categoryFilters)) {
        setCategoryFilters(parsed.categoryFilters);
      } else if (parsed.selectedCategory != null) {
        if (parsed.selectedCategory === "All") {
          setCategoryFilters([]);
        } else {
          setCategoryFilters([parsed.selectedCategory]);
        }
      }
      if (parsed.dateFrom != null) setDateFrom(parsed.dateFrom);
      if (parsed.dateTo != null) setDateTo(parsed.dateTo);
      if (
        parsed.datePreset === "30d" ||
        parsed.datePreset === "7d" ||
        parsed.datePreset === "all"
      )
        setDatePreset(parsed.datePreset);
      if (Array.isArray(parsed.transactionTypes))
        setTransactionTypes(parsed.transactionTypes);
      if (Array.isArray(parsed.statusFilters))
        setStatusFilters(parsed.statusFilters);
      if (parsed.minAmount != null) setMinAmount(parsed.minAmount);
      if (parsed.maxAmount != null) setMaxAmount(parsed.maxAmount);
      if (
        parsed.kpiQuickFilter === "all" ||
        parsed.kpiQuickFilter === "income" ||
        parsed.kpiQuickFilter === "expenses"
      ) {
        setKpiQuickFilter(parsed.kpiQuickFilter);
      }
      if (
        parsed.quickView === "none" ||
        parsed.quickView === "large" ||
        parsed.quickView === "thisMonth"
      ) {
        setQuickView(parsed.quickView);
      }
      if (typeof parsed.pageSize === "number" && parsed.pageSize > 0) {
        setPageSize(parsed.pageSize);
      }
    } catch {}
  }, []);

  const fetchTransactions = async () => {
    // Data is loaded via Server Component props
  };

  useEffect(() => {
    transactionsRef.current = transactions;
  }, [transactions]);



  const handleUpdateCategory = async (txId: string) => {
    if (!editingCategory) return;
    try {
      await updateCategory(txId, editingCategory);
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === txId ? { ...tx, category: editingCategory } : tx,
        ),
      );
      setEditingTxId(null);
    } catch (error) {
      console.error("Failed to update category", error);
    }
  };

  const startEditing = (tx: any) => {
    setEditingTxId(tx.id);
    setEditingCategory(tx.category || "General");
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const normalizedSearch = searchQuery.toLowerCase();
    const amountValue = Number(transaction.amount);
    const idValue = String(transaction.id || "").toLowerCase();
    const referenceValue = String(transaction.reference || "").toLowerCase();
    const noteStrings: string[] = [];
    if (Array.isArray(transaction.notes)) {
      for (const note of transaction.notes) {
        if (!note) continue;
        const raw =
          typeof note === "string"
            ? note
            : note.text || note.content || String(note);
        noteStrings.push(String(raw));
      }
    }
    if (transaction.note) {
      noteStrings.push(String(transaction.note));
    }
    const notesValue = noteStrings.join(" ").toLowerCase();
    const descValue = (transaction.description || "").toLowerCase();
    const merchantValue = (transaction.merchantName || "").toLowerCase();
    const categoryValue = (transaction.category || "").toLowerCase();

    const matchesDescription =
      descValue.includes(normalizedSearch) ||
      merchantValue.includes(normalizedSearch);
    const matchesCategoryField = categoryValue.includes(normalizedSearch);
    const matchesAmountField = String(transaction.amount || "").includes(
      searchQuery,
    );
    const matchesIdRef =
      idValue.includes(normalizedSearch) ||
      referenceValue.includes(normalizedSearch);
    const matchesNotes = notesValue.includes(normalizedSearch);

    const matchesSearch =
      !normalizedSearch ||
      (searchScope === "all" &&
        (matchesDescription ||
          matchesCategoryField ||
          matchesAmountField ||
          matchesIdRef ||
          matchesNotes)) ||
      (searchScope === "description" && matchesDescription) ||
      (searchScope === "category" && matchesCategoryField) ||
      (searchScope === "amount" && matchesAmountField) ||
      (searchScope === "idref" && matchesIdRef) ||
      (searchScope === "notes" && matchesNotes);

    const txCategory = transaction.category || "Uncategorized";
    const matchesCategory =
      categoryFilters.length === 0 || categoryFilters.includes(txCategory);
    const txDate = new Date(transaction.createdAt || transaction.date);
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const matchesPreset =
      datePreset === "all"
        ? true
        : datePreset === "30d"
          ? txDate >= thirtyDaysAgo
          : txDate >= sevenDaysAgo;

    const matchesDateFrom = !dateFrom || txDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || txDate <= new Date(dateTo);

    const matchesType =
      transactionTypes.length === 0 ||
      transactionTypes.includes(transaction.type);

    const matchesStatus =
      statusFilters.length === 0 || statusFilters.includes(transaction.status);

    const matchesMinAmount =
      !minAmount || Math.abs(amountValue) >= Number(minAmount);

    const matchesMaxAmount =
      !maxAmount || Math.abs(amountValue) <= Number(maxAmount);

    const matchesKpiQuick =
      kpiQuickFilter === "all"
        ? true
        : kpiQuickFilter === "income"
          ? amountValue > 0
          : amountValue < 0;

    const matchesQuickView =
      quickView === "none"
        ? true
        : quickView === "large"
          ? Math.abs(amountValue) >= 1000
          : isSameCalendarMonth(txDate, now);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPreset &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesType &&
      matchesStatus &&
      matchesMinAmount &&
      matchesMaxAmount &&
      matchesKpiQuick &&
      matchesQuickView
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    categoryFilters,
    dateFrom,
    dateTo,
    datePreset,
    transactionTypes,
    statusFilters,
    minAmount,
    maxAmount,
    kpiQuickFilter,
    pageSize,
    quickView,
  ]);

  const totalPages =
    filteredTransactions.length === 0
      ? 1
      : Math.ceil(filteredTransactions.length / pageSize);

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const visibleIds = pagedTransactions.map((tx) => tx.id);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "DEPOSIT" || Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "WITHDRAWAL" || Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload = {
        searchQuery,
        searchScope,
        categoryFilters,
        dateFrom,
        dateTo,
        datePreset,
        transactionTypes,
        statusFilters,
        minAmount,
        maxAmount,
        kpiQuickFilter,
        quickView,
        pageSize,
      };
      window.localStorage.setItem(
        "transactionsFilters",
        JSON.stringify(payload),
      );
    } catch {}
  }, [
    searchQuery,
    categoryFilters,
    dateFrom,
    dateTo,
    datePreset,
    transactionTypes,
    statusFilters,
    minAmount,
    maxAmount,
    kpiQuickFilter,
    quickView,
    pageSize,
  ]);

  const canComparePreviousPeriod =
    datePreset !== "all" && !dateFrom && !dateTo && transactions.length > 0;

  const previousPeriodTransactions = canComparePreviousPeriod
    ? (() => {
        const now = new Date();
        const days = datePreset === "30d" ? 30 : 7;
        const currentStart = new Date(now);
        currentStart.setDate(now.getDate() - days);
        const previousEnd = currentStart;
        const previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - days);

        return transactions.filter((transaction) => {
          const txDate = new Date(transaction.createdAt || transaction.date);
          if (txDate < previousStart || txDate >= previousEnd) return false;

          const normalizedSearch = searchQuery.toLowerCase();
          const amountValue = Number(transaction.amount);

          const idValue = String(transaction.id || "").toLowerCase();
          const referenceValue = String(
            transaction.reference || "",
          ).toLowerCase();
          const noteStrings: string[] = [];
          if (Array.isArray(transaction.notes)) {
            for (const note of transaction.notes) {
              if (!note) continue;
              const raw =
                typeof note === "string"
                  ? note
                  : note.text || note.content || String(note);
              noteStrings.push(String(raw));
            }
          }
          if (transaction.note) {
            noteStrings.push(String(transaction.note));
          }
          const notesValue = noteStrings.join(" ").toLowerCase();
          const descValue = (transaction.description || "").toLowerCase();
          const merchantValue = (transaction.merchantName || "").toLowerCase();
          const categoryValue = (transaction.category || "").toLowerCase();

          const matchesDescription =
            descValue.includes(normalizedSearch) ||
            merchantValue.includes(normalizedSearch);
          const matchesCategoryField = categoryValue.includes(normalizedSearch);
          const matchesAmountField = String(transaction.amount || "").includes(
            searchQuery,
          );
          const matchesIdRef =
            idValue.includes(normalizedSearch) ||
            referenceValue.includes(normalizedSearch);
          const matchesNotes = notesValue.includes(normalizedSearch);

          const matchesSearch =
            !normalizedSearch ||
            (searchScope === "all" &&
              (matchesDescription ||
                matchesCategoryField ||
                matchesAmountField ||
                matchesIdRef ||
                matchesNotes)) ||
            (searchScope === "description" && matchesDescription) ||
            (searchScope === "category" && matchesCategoryField) ||
            (searchScope === "amount" && matchesAmountField) ||
            (searchScope === "idref" && matchesIdRef) ||
            (searchScope === "notes" && matchesNotes);

          const txCategory = transaction.category || "Uncategorized";
          const matchesCategory =
            categoryFilters.length === 0 ||
            categoryFilters.includes(txCategory);

          const matchesType =
            transactionTypes.length === 0 ||
            transactionTypes.includes(transaction.type);

          const matchesStatus =
            statusFilters.length === 0 ||
            statusFilters.includes(transaction.status);

          const matchesMinAmount =
            !minAmount || Math.abs(amountValue) >= Number(minAmount);

          const matchesMaxAmount =
            !maxAmount || Math.abs(amountValue) <= Number(maxAmount);

          return (
            matchesSearch &&
            matchesCategory &&
            matchesType &&
            matchesStatus &&
            matchesMinAmount &&
            matchesMaxAmount
          );
        });
      })()
    : [];

  const previousIncome = previousPeriodTransactions
    .filter((t) => t.type === "DEPOSIT" || Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const previousExpenses = previousPeriodTransactions
    .filter((t) => t.type === "WITHDRAWAL" || Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const previousCount = previousPeriodTransactions.length;

  const computeDeltaPercent = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const transactionsDeltaPercent = computeDeltaPercent(
    filteredTransactions.length,
    previousCount,
  );
  const incomeDeltaPercent = computeDeltaPercent(totalIncome, previousIncome);
  const expensesDeltaPercent = computeDeltaPercent(
    totalExpenses,
    previousExpenses,
  );

  const periodLabel =
    datePreset === "30d"
      ? "Last 30 days"
      : datePreset === "7d"
        ? "Last 7 days"
        : "All time";

  const activeKpiLabel =
    kpiQuickFilter === "income"
      ? "Income"
      : kpiQuickFilter === "expenses"
        ? "Expenses"
        : null;

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilters([]);
    setDateFrom("");
    setDateTo("");
    setDatePreset("30d");
    setTransactionTypes([]);
    setStatusFilters([]);
    setMinAmount("");
    setMaxAmount("");
    setSelectedIds([]);
    setExpandedRows([]);
    setQuickView("none");
    setLiveMessage("Filters cleared. Showing all transactions.");
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleIds);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((existing) => existing !== id)
        : [...prev, id],
    );
  };

  useEffect(() => {
    if (selectedIds.length > 0) {
      setLiveMessage(`${selectedIds.length} transactions selected`);
    } else {
      setLiveMessage("");
    }
  }, [selectedIds]);

  const handleBulkCategorize = async () => {
    if (selectedIds.length === 0) return;
    if (!bulkCategory) return;
    const value = bulkCategory;
    try {
      for (const id of selectedIds) {
        await updateCategory(id, value);
      }
      setTransactions((prev) =>
        prev.map((tx) =>
          selectedIds.includes(tx.id) ? { ...tx, category: value } : tx,
        ),
      );
      setLiveMessage(
        `Updated category for ${selectedIds.length} selected transactions`,
      );
    } catch (error) {
      console.error("Failed to bulk update categories", error);
      toast.error({ title: "Category update failed", description: "Please try again later." });
    }
  };

  const handleBulkDispute = () => {
    if (selectedIds.length === 0) return;
    setPromptInput("Unrecognized or incorrect");
    setPromptDialog({ type: "bulkDispute" });
  };

  const handleBulkTag = () => {
    if (selectedIds.length === 0) return;
    setPromptInput("");
    setPromptDialog({ type: "bulkTag" });
  };

  const handleBulkMarkReview = () => {
    if (selectedIds.length === 0) return;
    setPromptInput("");
    setPromptDialog({ type: "bulkReview" });
  };

  const toggleRowExpanded = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id)
        ? prev.filter((existing) => existing !== id)
        : [...prev, id],
    );
  };

  // CSV Export Logic (Hidden from UI but available via function)
  const buildCsvContent = (rows: any[]) => {
    const headers = [
      "Date",
      "Description",
      "Type",
      "Category",
      "Amount",
      "Status",
    ];
    return [
      headers.join(","),
      ...rows.map((tx) =>
        [
          new Date(tx.createdAt || tx.date).toLocaleDateString(),
          `"${tx.description}"`,
          tx.type,
          tx.category || "Uncategorized",
          tx.amount,
          tx.status,
        ].join(","),
      ),
    ].join("\n");
  };

  const triggerCsvDownload = (csvContent: string, suffix: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `transactions_${suffix}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    const csvContent = buildCsvContent(filteredTransactions);
    triggerCsvDownload(csvContent, "export");
  };

  const handleDownloadStatement = () => {
    const csvContent = buildCsvContent(filteredTransactions);
    triggerCsvDownload(csvContent, "statement");
  };

  const handleBulkExport = () => {
    const selected = filteredTransactions.filter((tx) =>
      selectedIds.includes(tx.id),
    );
    if (selected.length === 0) return;
    const csvContent = buildCsvContent(selected);
    triggerCsvDownload(csvContent, "selected");
  };

  const handleExportReceipt = async (tx: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const blob = new Blob(["Simulated PDF Content"], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transaction_${tx.id}_receipt.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export receipt", error);
      toast.error({ title: "Receipt export failed", description: "Please try again later." });
    }
  };

  const handleKpiCardClick = (target: "all" | "income" | "expenses") => {
    setKpiQuickFilter((current) => {
      const next = current === target ? "all" : target;
      if (next !== "all" && datePreset === "all") {
        setDatePreset("30d");
      }
      return next;
    });
  };

  const handleDisputeStart = (tx: any) => {
    setActiveDisputeId(tx.id);
    setDisputeReason("Unrecognized transaction");
    setDisputeFiles([]);
  };

  const handleDisputeCancel = () => {
    setActiveDisputeId(null);
    setDisputeReason("");
    setDisputeFiles([]);
    setDisputeSubmitting(false);
  };

  const handleDisputeSubmit = async (tx: any) => {
    if (!disputeReason) {
      toast.warn({ title: "Select a dispute reason before submitting." });
      return;
    }

    try {
      setDisputeSubmitting(true);
      await disputeTransaction(tx.id, {
        reason: disputeReason,
        hasAttachments: disputeFiles.length > 0,
      });
      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, status: "DISPUTED" } : t)),
      );
      toast.success({ title: "Dispute submitted", description: "Transaction marked as Disputed." });
      handleDisputeCancel();
    } catch (error) {
      console.error("Failed to submit dispute", error);
      toast.error({ title: "Dispute failed", description: "Please try again later." });
      setDisputeSubmitting(false);
    }
  };

  const handleAddNote = (tx: any) => {
    setPromptInput("");
    setPromptDialog({ type: "addNote", tx });
  };

  // Handles confirm action for all prompt-replacement dialogs
  const handlePromptConfirm = async () => {
    if (!promptDialog) return;
    const { type, tx } = promptDialog;
    const value = promptInput.trim();

    if (type === "bulkDispute") {
      if (!value) { toast.warn({ title: "Enter a dispute reason." }); return; }
      setPromptDialog(null);
      try {
        for (const id of selectedIds) await disputeTransaction(id, { reason: value, hasAttachments: false });
        setTransactions((prev) => prev.map((t) => selectedIds.includes(t.id) ? { ...t, status: "DISPUTED" } : t));
        setLiveMessage(`Disputed ${selectedIds.length} transactions`);
        toast.success({ title: `${selectedIds.length} transactions disputed` });
      } catch { toast.error({ title: "Bulk dispute failed", description: "Please try again." }); }
    }

    if (type === "bulkTag") {
      if (!value) { toast.warn({ title: "Enter a tag name." }); return; }
      setPromptDialog(null);
      try {
        const nowIso = new Date().toISOString();
        for (const id of selectedIds) await addNote(id, `Tag: ${value}`);
        setTransactions((prev) => prev.map((t) => {
          if (!selectedIds.includes(t.id)) return t;
          const existing = Array.isArray(t.notes) ? t.notes : t.note ? [t.note] : [];
          return { ...t, notes: [...existing, { text: `Tag: ${value}`, createdAt: nowIso, authorName: "You" }] };
        }));
        setLiveMessage(`Tagged ${selectedIds.length} transactions`);
        toast.success({ title: `Tag "${value}" added to ${selectedIds.length} transactions` });
      } catch { toast.error({ title: "Bulk tag failed", description: "Please try again." }); }
    }

    if (type === "bulkReview") {
      setPromptDialog(null);
      const noteText = value ? `Marked for review: ${value}` : "Marked for review";
      try {
        const nowIso = new Date().toISOString();
        for (const id of selectedIds) await addNote(id, noteText);
        setTransactions((prev) => prev.map((t) => {
          if (!selectedIds.includes(t.id)) return t;
          const existing = Array.isArray(t.notes) ? t.notes : t.note ? [t.note] : [];
          return { ...t, notes: [...existing, { text: noteText, createdAt: nowIso, authorName: "You" }] };
        }));
        setLiveMessage(`Marked ${selectedIds.length} transactions for review`);
        toast.success({ title: `${selectedIds.length} transactions marked for review` });
      } catch { toast.error({ title: "Failed to mark for review", description: "Please try again." }); }
    }

    if (type === "addNote" && tx) {
      if (!value) { toast.warn({ title: "Note cannot be empty." }); return; }
      setPromptDialog(null);
      try {
        await addNote(tx.id, value);
        const nowIso = new Date().toISOString();
        setTransactions((prev) => prev.map((t) => {
          if (t.id !== tx.id) return t;
          const existing = Array.isArray(t.notes) ? t.notes : t.note ? [t.note] : [];
          return { ...t, notes: [...existing, { text: value, createdAt: nowIso, authorName: "You" }] };
        }));
        toast.success({ title: "Note added", duration: 2000 });
      } catch { toast.error({ title: "Failed to save note", description: "Please try again." }); }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-charcoal">
            Transactions
          </h1>
          <p className="text-muted-foreground mt-1">
            Search, filter, and export a complete record of your account
            activity.
          </p>
          {lastUpdatedAt && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Last updated at{" "}
              {lastUpdatedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <ExportOptions
          onExportCsv={handleExport}
          onDownloadStatement={handleDownloadStatement}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={`flex flex-row items-center justify-between p-6 cursor-pointer transition-shadow hover:shadow-sm ${
            kpiQuickFilter === "all" ? "ring-1 ring-charcoal/60 shadow-sm" : ""
          }`}
          onClick={() => handleKpiCardClick("all")}>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </p>
            <h2 className="text-2xl font-bold mt-1 text-charcoal">
              {filteredTransactions.length}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
            {transactionsDeltaPercent != null && (
              <p className="text-xs mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 ${
                    transactionsDeltaPercent >= 0
                      ? "text-vintage-green-dark"
                      : "text-red-600"
                  }`}>
                  {transactionsDeltaPercent >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(transactionsDeltaPercent).toFixed(1)}%</span>
                </span>
                <span className="text-muted-foreground">
                  {datePreset === "30d"
                    ? "vs previous 30 days"
                    : datePreset === "7d"
                      ? "vs previous 7 days"
                      : "vs previous period"}
                </span>
              </p>
            )}
          </div>
          <VintageIcon icon={Briefcase} variant="charcoal" size="lg" />
        </Card>
        <Card
          className={`flex flex-row items-center justify-between p-6 bg-gradient-to-br from-vintage-green/10 to-transparent border-vintage-green/20 cursor-pointer transition-shadow hover:shadow-sm ${
            kpiQuickFilter === "income"
              ? "ring-1 ring-vintage-green-dark shadow-sm"
              : ""
          }`}
          onClick={() => handleKpiCardClick("income")}>
          <div>
            <p className="text-sm font-medium text-vintage-green-dark">
              Total Income
            </p>
            <h2 className="text-2xl font-bold mt-1 text-vintage-green font-mono">
              +
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalIncome)}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
            {incomeDeltaPercent != null && (
              <p className="text-xs mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 ${
                    incomeDeltaPercent >= 0
                      ? "text-vintage-green-dark"
                      : "text-red-600"
                  }`}>
                  {incomeDeltaPercent >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(incomeDeltaPercent).toFixed(1)}%</span>
                </span>
                <span className="text-muted-foreground">
                  {datePreset === "30d"
                    ? "vs previous 30 days"
                    : datePreset === "7d"
                      ? "vs previous 7 days"
                      : "vs previous period"}
                </span>
              </p>
            )}
          </div>
          <VintageIcon icon={TrendingUp} variant="green" size="lg" />
        </Card>
        <Card
          className={`flex flex-row items-center justify-between p-6 bg-gradient-to-br from-red-50 to-transparent border-red-100 cursor-pointer transition-shadow hover:shadow-sm ${
            kpiQuickFilter === "expenses" ? "ring-1 ring-red-500 shadow-sm" : ""
          }`}
          onClick={() => handleKpiCardClick("expenses")}>
          <div>
            <p className="text-sm font-medium text-red-700">Total Expenses</p>
            <h2 className="text-2xl font-bold mt-1 text-red-600 font-mono">
              -
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalExpenses)}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
            {expensesDeltaPercent != null && (
              <p className="text-xs mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 ${
                    expensesDeltaPercent <= 0
                      ? "text-vintage-green-dark"
                      : "text-red-600"
                  }`}>
                  {expensesDeltaPercent <= 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  <span>{Math.abs(expensesDeltaPercent).toFixed(1)}%</span>
                </span>
                <span className="text-muted-foreground">
                  {datePreset === "30d"
                    ? "vs previous 30 days"
                    : datePreset === "7d"
                      ? "vs previous 7 days"
                      : "vs previous period"}
                </span>
              </p>
            )}
          </div>
          <VintageIcon icon={TrendingDown} variant="gold" size="lg" />{" "}
          {/* Gold usage for contrast/vintage feel, or create Red variant if preferred */}
        </Card>
      </div>

      <TransactionsAnalytics
        filteredTransactions={filteredTransactions}
        liveMessage={liveMessage}
      />

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle>History</CardTitle>
              {activeKpiLabel && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Showing:{" "}
                  <span className="font-semibold text-charcoal">
                    {activeKpiLabel}
                  </span>{" "}
                  · {periodLabel}
                </p>
              )}
            </div>

            {/* Search & Filter Toggles */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by merchant, description, category, or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={searchScope}
                onValueChange={(value) =>
                  setSearchScope(value as typeof searchScope)
                }>
                <SelectTrigger className="h-10 w-[160px] text-xs">
                  <SelectValue placeholder="All fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fields</SelectItem>
                  <SelectItem value="description">
                    Description & merchant
                  </SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="idref">ID or reference</SelectItem>
                  <SelectItem value="notes">Notes</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-full border bg-background px-1 py-0.5 text-[11px]">
                  {[
                    { id: "30d", label: "Last 30 days" },
                    { id: "7d", label: "Last 7 days" },
                    { id: "all", label: "All time" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setDatePreset(preset.id as "30d" | "7d" | "all")
                      }
                      className={`rounded-full px-3 py-1 transition-colors ${
                        datePreset === preset.id
                          ? "bg-charcoal text-white"
                          : "text-muted-foreground hover:bg-slate-100/80"
                      }`}>
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="hidden md:inline-flex rounded-full border bg-background px-1 py-0.5 text-[11px]">
                  {[
                    { id: "large", label: "Large transactions" },
                    { id: "thisMonth", label: "This month" },
                  ].map((view) => (
                    <button
                      key={view.id}
                      type="button"
                      onClick={() =>
                        setQuickView((prev) =>
                          prev === view.id
                            ? "none"
                            : (view.id as typeof quickView),
                        )
                      }
                      className={`rounded-full px-3 py-1 transition-colors ${
                        quickView === view.id
                          ? "bg-charcoal text-white"
                          : "text-muted-foreground hover:bg-slate-100/80"
                      }`}>
                      {view.label}
                    </button>
                  ))}
                </div>
                <Button
                  variant={showFilters ? "primary" : "outline"}
                  size="small"
                  className="h-10"
                  onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {showFilters && (
            <TransactionFiltersPanel
              categoryFilters={categoryFilters}
              setCategoryFilters={setCategoryFilters}
              transactionTypes={transactionTypes}
              setTransactionTypes={setTransactionTypes}
              statusFilters={statusFilters}
              setStatusFilters={setStatusFilters}
              minAmount={minAmount}
              setMinAmount={setMinAmount}
              maxAmount={maxAmount}
              setMaxAmount={setMaxAmount}
              handleClearFilters={handleClearFilters}
            />
          )}
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">
              <AlertCircle className="w-4 h-4" />
              <span className="flex-1">{error}</span>
              <Button
                variant="ghost"
                size="small"
                className="text-red-700 hover:text-red-800"
                onClick={fetchTransactions}>
                Retry
              </Button>
            </div>
          )}
          {!error && hasNewData && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-charcoal bg-amber-50 border-b border-amber-100">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="flex-1">
                New transactions may be available based on your recent activity.
              </span>
              <Button
                variant="ghost"
                size="small"
                className="text-amber-700 hover:text-amber-800"
                onClick={fetchTransactions}>
                Refresh
              </Button>
            </div>
          )}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-charcoal">
                  {selectedIds.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted-foreground">
                    Set category
                  </span>
                  <Select value={bulkCategory} onValueChange={setBulkCategory}>
                    <SelectTrigger className="h-8 w-[130px] text-xs">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="small"
                  className="h-8 text-xs"
                  onClick={handleBulkCategorize}
                  disabled={!bulkCategory}>
                  <Tag className="w-3 h-3 mr-1" />
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  className="h-8 text-xs"
                  onClick={handleBulkDispute}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Dispute
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  className="h-8 text-xs"
                  onClick={handleBulkTag}>
                  <Tag className="w-3 h-3 mr-1" />
                  Tag
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  className="h-8 text-xs"
                  onClick={handleBulkMarkReview}>
                  <FileText className="w-3 h-3 mr-1" />
                  Mark review
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  className="h-8 text-xs"
                  onClick={handleBulkExport}>
                  Export selected
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => setSelectedIds([])}>
                  Clear selection
                </Button>
              </div>
            </div>
          )}

          <Table wrapperClassName="max-h-[360px] md:max-h-[480px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] sticky top-0 z-10 bg-background">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all transactions"
                  />
                </TableHead>
                <TableHead className="w-[80px] sticky top-0 z-10 bg-background">
                  Type
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-background">
                  Description
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-background">
                  Category
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-background">
                  Account
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-background">
                  Date
                </TableHead>
                <TableHead className="text-right sticky top-0 z-10 bg-background">
                  Amount
                </TableHead>
                <TableHead className="text-right sticky top-0 z-10 bg-background">
                  Status
                </TableHead>
                <TableHead className="w-[60px] text-right sticky top-0 z-10 bg-background">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                pagedTransactions.map((tx) => {
                  const isSelected = selectedIds.includes(tx.id);
                  const isExpanded = expandedRows.includes(tx.id);
                  return (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      isSelected={isSelected}
                      isExpanded={isExpanded}
                      onToggleSelect={toggleSelectOne}
                      onToggleExpanded={toggleRowExpanded}
                      editingTxId={editingTxId}
                      editingCategory={editingCategory}
                      setEditingCategory={setEditingCategory}
                      startEditing={startEditing}
                      handleUpdateCategory={handleUpdateCategory}
                      handleExportReceipt={handleExportReceipt}
                      cancelEditing={() => setEditingTxId(null)}
                      activeDisputeId={activeDisputeId}
                      disputeReason={disputeReason}
                      setDisputeReason={setDisputeReason}
                      disputeFiles={disputeFiles}
                      setDisputeFiles={setDisputeFiles}
                      disputeSubmitting={disputeSubmitting}
                      handleDisputeStart={handleDisputeStart}
                      handleDisputeCancel={handleDisputeCancel}
                      handleDisputeSubmit={handleDisputeSubmit}
                      handleAddNote={handleAddNote}
                      showAllNotesFor={showAllNotesFor}
                      setShowAllNotesFor={setShowAllNotesFor}
                    />
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No transactions match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div>
                {filteredTransactions.length === 0 ? (
                  <span>Showing 0 of 0</span>
                ) : (
                  <span>
                    Showing{" "}
                    <span className="font-medium">
                      {startIndex + 1}-
                      {Math.min(endIndex, filteredTransactions.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredTransactions.length}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px]">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="h-7 w-[70px] text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[25, 50, 100].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="small"
                className="h-7 px-2"
                disabled={safePage === 1}
                onClick={() => setCurrentPage(1)}>
                First
              </Button>
              <Button
                variant="ghost"
                size="small"
                className="h-7 px-2"
                disabled={safePage === 1}
                onClick={() =>
                  setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
                }>
                Previous
              </Button>
              <span className="text-[11px]">
                Page{" "}
                <span className="font-medium">
                  {filteredTransactions.length === 0 ? 0 : safePage}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {filteredTransactions.length === 0 ? 0 : totalPages}
                </span>
              </span>
              <Button
                variant="ghost"
                size="small"
                className="h-7 px-2"
                disabled={
                  filteredTransactions.length === 0 || safePage >= totalPages
                }
                onClick={() =>
                  setCurrentPage((prev) =>
                    prev < totalPages ? prev + 1 : prev,
                  )
                }>
                Next
              </Button>
              <Button
                variant="ghost"
                size="small"
                className="h-7 px-2"
                disabled={
                  filteredTransactions.length === 0 || safePage >= totalPages
                }
                onClick={() => setCurrentPage(totalPages)}>
                Last
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt-replacement dialog for bulk operations and add-note */}
      <Dialog open={!!promptDialog} onOpenChange={(open) => { if (!open) setPromptDialog(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {promptDialog?.type === "bulkDispute" && `Dispute ${selectedIds.length} Transaction${selectedIds.length !== 1 ? "s" : ""}`}
              {promptDialog?.type === "bulkTag" && `Tag ${selectedIds.length} Transaction${selectedIds.length !== 1 ? "s" : ""}`}
              {promptDialog?.type === "bulkReview" && `Mark ${selectedIds.length} Transaction${selectedIds.length !== 1 ? "s" : ""} for Review`}
              {promptDialog?.type === "addNote" && "Add Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="text-sm text-muted-foreground block mb-1.5">
              {promptDialog?.type === "bulkDispute" && "Dispute reason"}
              {promptDialog?.type === "bulkTag" && "Tag name"}
              {promptDialog?.type === "bulkReview" && "Optional note (why these need review)"}
              {promptDialog?.type === "addNote" && "Note"}
            </label>
            <Input
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={
                promptDialog?.type === "bulkDispute" ? "e.g. Unrecognized transaction" :
                promptDialog?.type === "bulkTag" ? "e.g. Tax deductible" :
                promptDialog?.type === "bulkReview" ? "Optional" :
                "Your note…"
              }
              onKeyDown={(e) => { if (e.key === "Enter") handlePromptConfirm(); }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPromptDialog(null)}>Cancel</Button>
            <Button variant="primary" onClick={handlePromptConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

