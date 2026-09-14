"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, ShoppingBag, Coffee, Plane, Car, FileText, Wallet, PieChart } from "lucide-react";
import { getTransactions } from "@/app/actions/transactions";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG: Record<string, { icon: any; bar: string; bg: string; text: string }> = {
  Shopping:  { icon: ShoppingBag, bar: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-700" },
  Dining:    { icon: Coffee,      bar: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
  Travel:    { icon: Plane,       bar: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  Transport: { icon: Car,         bar: "bg-emerald-500",bg: "bg-emerald-50",text: "text-emerald-700" },
  Utilities: { icon: FileText,    bar: "bg-slate-500",  bg: "bg-slate-50",  text: "text-slate-700" },
  General:   { icon: Wallet,      bar: "bg-gray-400",   bg: "bg-gray-50",   text: "text-gray-600" },
};

function getCfg(name: string) {
  return CATEGORY_CONFIG[name] ?? CATEGORY_CONFIG["General"];
}

interface CategoryEntry {
  name: string;
  amount: number;
}

export function CardSpendingInsights({ cardId }: { cardId?: string }) {
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [thisMonth, setThisMonth] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch recent transactions and group by category client-side
    getTransactions({ limit: 100 })
      .then((data) => {
        const raw: any[] = Array.isArray(data) ? data : [];

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const catMap: Record<string, number> = {};
        let thisTotal = 0;
        let lastTotal = 0;

        raw.forEach((tx) => {
          const txDate = new Date(tx.date || tx.createdAt);
          const amount = Math.abs(Number(tx.amount ?? 0));
          const isDebit = tx.type === "debit" || tx.originalType === "WITHDRAWAL" || tx.originalType === "TRANSFER_OUT" || tx.originalType === "PAYMENT";

          if (!isDebit) return; // only count spending

          const cat = tx.category || "General";

          if (txDate >= thisMonthStart) {
            catMap[cat] = (catMap[cat] || 0) + amount;
            thisTotal += amount;
          } else if (txDate >= lastMonthStart) {
            lastTotal += amount;
          }
        });

        const sorted = Object.entries(catMap)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        setCategories(sorted);
        setThisMonth(thisTotal);
        setLastMonth(lastTotal);
      })
      .catch(() => {
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, [cardId]);

  const change = thisMonth - lastMonth;
  const changePct = lastMonth > 0 ? Math.round((change / lastMonth) * 100) : 0;
  const maxCatAmount = categories[0]?.amount || 1;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <PieChart className="w-4 h-4 text-vintage-green" />
          Spending Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Month vs Month */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/40 rounded-xl p-3 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">This Month</p>
            {loading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <p className="text-xl font-bold font-mono text-charcoal">
                ${thisMonth.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            )}
          </div>
          <div className="bg-muted/40 rounded-xl p-3 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">vs Last Month</p>
            {loading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <div className="flex items-center gap-1.5">
                <p className="text-xl font-bold font-mono text-charcoal">
                  {changePct > 0 ? "+" : ""}{changePct}%
                </p>
                {changePct > 0 ? (
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                ) : changePct < 0 ? (
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">By Category</p>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3.5 w-12" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No spending data for this month yet.
            </p>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => {
                const cfg = getCfg(cat.name);
                const Icon = cfg.icon;
                const pct = Math.round((cat.amount / maxCatAmount) * 100);
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", cfg.bg)}>
                          <Icon className={cn("w-3 h-3", cfg.text)} />
                        </div>
                        <span className="text-xs font-medium text-charcoal">{cat.name}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-charcoal">
                        ${cat.amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", cfg.bar)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
