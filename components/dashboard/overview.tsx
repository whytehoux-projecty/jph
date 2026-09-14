"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface OverviewProps {
  data?: any[];
  income?: number; // Keep for backward compatibility if needed, or remove
  expense?: number;
}

export function Overview({ data, income, expense }: OverviewProps) {
  if (Array.isArray(data) && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-center px-6 bg-muted/30 rounded-xl border border-dashed">
        <div className="rounded-full bg-background p-3 mb-3 shadow-sm">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="font-semibold text-sm mb-1">No chart data yet</h4>
        <p className="text-xs text-muted-foreground mb-4 max-w-[240px]">
          Connect an account or add transactions to unlock analytics.
        </p>
        <Link
          href="/accounts"
          className={cn(
            buttonVariants({ variant: "outline", size: "small" }),
            "h-8 text-xs",
          )}>
          Connect an account
        </Link>
      </div>
    );
  }

  const chartData = data?.length
    ? data
    : [
    {
      name: "Current Month",
      income: income || 0,
      expense: expense || 0,
        },
      ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#aaaaaa"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#aaaaaa"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
          cursor={{ fill: "transparent" }}
        />
        <Bar
          dataKey="income"
          fill="#D4AF7A" // Gold
          name="Income"
          radius={[4, 4, 0, 0]}
          barSize={60}
        />
        <Bar
          dataKey="expense"
          fill="#dc2626" // Red
          name="Expense"
          radius={[4, 4, 0, 0]}
          barSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
