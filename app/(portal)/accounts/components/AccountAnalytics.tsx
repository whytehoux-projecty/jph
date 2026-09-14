"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AccountAnalyticsProps {
  currency?: string;
  totalLiquidAssets?: number;
  activeAccountsCount?: number;
  onDrilldown?: (type: "liquid" | "active" | "pending") => void;
}

export function AccountAnalytics({
  currency = "USD",
  totalLiquidAssets = 0,
  activeAccountsCount = 0,
  onDrilldown,
}: AccountAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <button
            type="button"
            onClick={() => onDrilldown?.("liquid")}
            className="w-full h-full p-6 flex flex-col justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Liquid Assets
              </p>
              <h3 className="text-2xl font-bold font-playfair text-charcoal mt-2">
                {formatCurrency(totalLiquidAssets, currency)}
              </h3>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Click to view liquid accounts</span>
            </div>
          </button>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <button
            type="button"
            onClick={() => onDrilldown?.("active")}
            className="w-full h-full p-6 flex flex-col justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Accounts
              </p>
              <h3 className="text-2xl font-bold font-playfair text-charcoal mt-2">
                {activeAccountsCount}
              </h3>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              <span>Click to show active accounts</span>
            </div>
          </button>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <button
            type="button"
            onClick={() => onDrilldown?.("pending")}
            className="w-full h-full p-6 flex flex-col justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Actions
              </p>
              <h3 className="text-2xl font-bold font-playfair text-charcoal mt-2">
                3
              </h3>
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-600 font-medium">
              <AlertCircle className="w-3 h-3 mr-1" />
              <span>Click to review accounts needing attention</span>
            </div>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
