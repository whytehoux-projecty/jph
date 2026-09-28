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
      <Card className="h-full border border-[color:var(--heritage-navy)]/10 bg-white shadow-vintage-sm">
        <CardHeader className="pb-2">
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Items requiring your attention</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <VintageIcon icon={CheckCircle2} variant="green" size="lg" className="mb-4" />
          <p className="text-sm text-muted-foreground">You're all caught up!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-[color:var(--heritage-navy)]/10 bg-white shadow-vintage-sm hover-lift">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Items requiring your attention</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
            {items.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-[color:var(--heritage-navy)]/5 bg-slate-50/50 p-3 gap-3 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[color:var(--heritage-navy)]">
                    {item.type}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {item.description}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {new Date(item.date).toLocaleDateString(languageToLocale(language), { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end sm:flex-col gap-2 shrink-0">
                <span className="text-sm font-semibold text-[color:var(--heritage-navy)] font-inter tabular-nums lining-nums text-right">
                  {formatCurrency(item.amount, item.currency, languageToLocale(language))}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full" aria-label="Approve">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full" aria-label="Reject">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {items.length > 3 && (
            <Link href="/approvals" className="flex items-center justify-center text-xs font-medium text-[color:var(--heritage-gold)] hover:underline py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] rounded-md">
              View {items.length - 3} more
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
