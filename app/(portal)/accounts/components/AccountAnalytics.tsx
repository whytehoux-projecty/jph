"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";

interface AccountAnalyticsProps {
  currency?: string;
  totalLiquidAssets?: number;
  activeAccountsCount?: number;
  pendingActionsCount?: number;
  onDrilldown?: (type: "liquid" | "active" | "pending") => void;
}

export function AccountAnalytics({
  currency = "USD",
  totalLiquidAssets = 0,
  activeAccountsCount = 0,
  pendingActionsCount = 0,
}: AccountAnalyticsProps) {

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Liquid Assets
            </p>
            <p className="text-3xl font-mono lining-nums tabular-nums text-ink-900 mt-2">
              <Money amount={totalLiquidAssets} currency={currency} />
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Accounts
            </p>
            <p className="text-3xl font-mono lining-nums tabular-nums text-ink-900 mt-2">
              {activeAccountsCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {pendingActionsCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200">
            <span className="font-semibold text-amber-900">{pendingActionsCount}</span>
          </span>
          <p>
            Account{pendingActionsCount > 1 ? "s" : ""} need attention. Please review pending actions.
          </p>
        </div>
      )}
    </div>
  );
}
