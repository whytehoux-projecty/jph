"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingDown,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Zap,
} from "lucide-react";

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  icon: React.ElementType;
  color: string;
}

interface SpendingByCategoryProps {
  transactions?: any[];
  totalExpenses: number;
}

const categoryIcons: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  Shopping: { icon: ShoppingBag, color: "text-pink-600" },
  "Food & Dining": { icon: Utensils, color: "text-orange-600" },
  Transportation: { icon: Car, color: "text-blue-600" },
  Housing: { icon: Home, color: "text-green-600" },
  Utilities: { icon: Zap, color: "text-yellow-600" },
  General: { icon: TrendingDown, color: "text-gray-600" },
};

export function SpendingByCategory({
  transactions = [],
  totalExpenses,
}: SpendingByCategoryProps) {
  // Analyze transactions by category
  const categoryMap = new Map<string, number>();

  transactions.forEach((tx) => {
    if (tx.amount < 0 || tx.type === "WITHDRAWAL" || tx.type === "TRANSFER") {
      const category = tx.category || "General";
      const amount = Math.abs(tx.amount);
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
    }
  });

  // Convert to array and sort by amount
  const categories: CategoryData[] = Array.from(categoryMap.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      icon: categoryIcons[name]?.icon || categoryIcons.General.icon,
      color: categoryIcons[name]?.color || categoryIcons.General.color,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // Top 5 categories

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Track where your money goes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <TrendingDown className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No spending data available yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          Your top spending categories this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-full p-1.5 bg-muted ${category.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
