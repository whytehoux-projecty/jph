"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

export function RecentTransactions({
  transactions = [],
}: RecentTransactionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return transactions.filter((tx) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        tx.description?.toLowerCase().includes(normalizedQuery);
      const matchesType =
        typeFilter === "all" || tx.type?.toLowerCase() === typeFilter;
      const matchesStatus =
        statusFilter === "all" || tx.status?.toLowerCase() === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [transactions, searchQuery, typeFilter, statusFilter]);

  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8 text-center px-4 bg-paper-100 rounded border border-dashed border-paper-200">
          <div className="rounded bg-paper-200 p-3 mb-3 shadow-none">
            <Receipt className="h-6 w-6 text-ink-500" />
          </div>
          <h4 className="font-semibold text-sm mb-1 text-ink-900">No recent transactions</h4>
          <p className="text-xs text-ink-500 mb-4 max-w-[200px]">
            Your account activity will appear here once you start transacting.
          </p>
          <Link
            href="/transfer"
            className={cn(
              buttonVariants({ variant: "outline", size: "small" }),
              "h-8 text-xs border-paper-200 text-ink-900 hover:bg-paper-200",
            )}>
            Make a transfer <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
              Upcoming & Pending
            </h4>
            <span className="text-[10px] text-ink-500 bg-paper-200 px-1.5 py-0.5 rounded">
              Simulated
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded border border-paper-200 bg-paper-50 hover:border-ink-900 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-bg rounded">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-ink-900">Netflix Subscription</p>
                <p className="text-xs text-ink-500">
                  Auto-pay • Tomorrow
                </p>
              </div>
            </div>
            <span className="text-sm font-bold font-mono tabular-nums text-ink-900">-$15.99</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded border border-paper-200 bg-paper-50 hover:border-ink-900 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error-bg rounded">
                <AlertTriangle className="h-4 w-4 text-error" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-ink-900">Pending Transfer</p>
                <p className="text-xs text-ink-500">
                  Review details • Today
                </p>
              </div>
            </div>
            <span className="text-sm font-bold font-mono tabular-nums text-ink-900">-$220.00</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded border border-paper-200 bg-paper-50 hover:border-ink-900 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info-bg rounded">
                <ShieldAlert className="h-4 w-4 text-info" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-ink-900">Security Check</p>
                <p className="text-xs text-ink-500">
                  Review recent login
                </p>
              </div>
            </div>
            <Button variant="ghost" size="small" className="h-7 text-xs rounded hover:bg-paper-200">
              Review
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search transactions"
          className="h-9"
        />
        <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center px-4 bg-paper-100 rounded border border-dashed border-paper-200">
          <div className="rounded bg-paper-200 p-3 mb-3 shadow-none">
            <Receipt className="h-6 w-6 text-ink-500" />
          </div>
          <h4 className="font-semibold text-sm mb-1 text-ink-900">
            No transactions match your filters
          </h4>
          <p className="text-xs text-ink-500 mb-4 max-w-[220px]">
            Try adjusting your search or filters to see more results.
          </p>
          <Button
            variant="outline"
            size="small"
            className="h-8 text-xs border-paper-200 text-ink-900 hover:bg-paper-200"
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
              setStatusFilter("all");
            }}>
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTransactions.map((tx) => {
            const isPositive =
              tx.type === "DEPOSIT" ||
              (tx.type === "TRANSFER" && tx.amount > 0);
            
            // Ledger specifies negative uses ink-900, but error is also acceptable.
            // We use standard colors: success for positive, ink-900 for neutral/negative.
            const amountColor = isPositive
              ? "text-success"
              : "text-ink-900";
            const sign = isPositive ? "+" : "−";
            const Icon = isPositive ? ArrowDownLeft : ArrowUpRight;
            const iconBg = isPositive ? "bg-success-bg text-success" : "bg-paper-200 text-ink-900";
            const status = (tx.status || "COMPLETED").toUpperCase();

            return (
              <div key={tx.id} className="flex items-center py-2 border-b border-paper-200 last:border-0">
                <div className={cn("p-2 rounded shrink-0", iconBg)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="ml-4 space-y-1 overflow-hidden">
                  <div className="flex items-center">
                    <p className="text-sm font-medium leading-none truncate max-w-[200px]" title={tx.description}>
                      {tx.description.charAt(0).toUpperCase() + tx.description.slice(1).toLowerCase()}
                    </p>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium ml-2 uppercase shrink-0",
                      status === "PENDING" ? "bg-warning-bg text-warning" :
                      status === "REJECTED" ? "bg-error-bg text-error" :
                      "bg-success-bg text-success"
                    )}>
                      {status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                  </p>
                </div>
                <div className={`ml-auto font-bold font-mono tabular-nums ${amountColor}`}>
                  {sign}{formatCurrency(Math.abs(tx.amount))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
