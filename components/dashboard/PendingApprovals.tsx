"use client";

import Link from "next/link";
import { Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { formatCurrency, languageToLocale } from "@/lib/utils";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { Button } from "@/components/ui/Button";

interface PendingItem {
  id: string;
  type: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
}

export function PendingApprovals({ items, language = "en" }: { items: PendingItem[], language?: string }) {
  if (!items || items.length === 0) {
    return (
      <Card className="h-full border border-paper-200 bg-paper-100 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Items requiring your attention</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <VintageIcon icon={CheckCircle2} variant="green" size="lg" className="mb-4" />
          <p className="text-sm text-ink-500">You're all caught up!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-paper-200 bg-white shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Items requiring your attention</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-warning-bg text-xs font-bold text-warning">
            {items.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between rounded border border-paper-200 bg-paper-50 p-3 gap-3 transition-colors hover:border-ink-900"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-warning-bg text-warning">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-ink-900">
                    {item.type}
                  </span>
                  <span className="text-xs text-ink-500 line-clamp-1">
                    {item.description}
                  </span>
                  <span className="text-xs text-ink-500 mt-0.5">
                    {new Date(item.date).toLocaleDateString(languageToLocale(language), { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end sm:flex-col gap-2 shrink-0">
                <span className="text-sm font-semibold text-ink-900 font-mono tabular-nums text-right">
                  {formatCurrency(item.amount, item.currency, languageToLocale(language))}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:text-success hover:bg-success-bg rounded" aria-label="Approve">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-error hover:text-error hover:bg-error-bg rounded" aria-label="Reject">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {items.length > 3 && (
            <Link href="/approvals" className="flex items-center justify-center text-xs font-medium text-vermilion-600 hover:underline py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 rounded">
              View {items.length - 3} more
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
