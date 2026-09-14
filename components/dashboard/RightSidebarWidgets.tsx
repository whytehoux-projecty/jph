"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  TrendingUp,
  AlertCircle,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Lightbulb,
  BellRing,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function FinancialTipWidget() {
  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
      <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
        <Lightbulb className="h-3 w-3 text-yellow-500" />
        Daily Tip
      </h4>
      <p className="text-xs text-muted-foreground italic">
        "Review your subscriptions monthly to avoid paying for unused services."
      </p>
    </div>
  );
}

export function BudgetWidget() {
  const categories = [
    { name: "Food & Dining", spent: 450, limit: 600, color: "bg-orange-500" },
    { name: "Transportation", spent: 120, limit: 200, color: "bg-blue-500" },
    { name: "Entertainment", spent: 280, limit: 300, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Monthly Budget
      </h4>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{cat.name}</span>
              <span className="text-muted-foreground">
                {formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}
              </span>
            </div>
            <Progress
              value={(cat.spent / cat.limit) * 100}
              className="h-1.5"
              indicatorClassName={cat.color}
            />
          </div>
        ))}
      </div>
      <Button variant="ghost" size="small" className="w-full text-xs h-7">
        View All Budgets <ChevronRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
}

export function UpcomingBillsWidget() {
  const bills = [
    {
      name: "Netflix Subscription",
      amount: 15.99,
      date: "Tomorrow",
      icon: Calendar,
    },
    {
      name: "Electric Bill",
      amount: 142.5,
      date: "In 3 days",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        Upcoming Bills
      </h4>
      <div className="space-y-2">
        {bills.map((bill) => (
          <div
            key={bill.name}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-background border">
                <bill.icon className="h-3 w-3 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{bill.name}</p>
                <p className="text-[10px] text-muted-foreground">{bill.date}</p>
              </div>
            </div>
            <span className="font-semibold">{formatCurrency(bill.amount)}</span>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="small" className="w-full text-xs h-7">
        See All Bills <ChevronRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
}

export function CreditScoreWidget() {
  return (
    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-green-400" />
          <span className="text-xs font-medium text-slate-300">
            Credit Score
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] border-green-500/50 text-green-400 bg-green-500/10 px-1.5 py-0 h-5">
          Excellent
        </Badge>
      </div>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-3xl font-bold">785</span>
        <span className="text-xs text-green-400 mb-1.5 flex items-center">
          +12 pts <TrendingUp className="h-3 w-3 ml-0.5" />
        </span>
      </div>
      <p className="text-[10px] text-slate-400">Updated 2 days ago</p>
    </div>
  );
}

export function CashFlowProjectionWidget() {
  const inflow = 8420;
  const outflow = 5140;
  const net = inflow - outflow;
  const netColor = net >= 0 ? "text-vintage-green" : "text-red-600";

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Cash Flow Projection
      </h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowDownLeft className="h-3.5 w-3.5 text-vintage-green" />
            Projected inflow
          </div>
          <span className="font-semibold text-vintage-green">
            {formatCurrency(inflow)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5 text-red-600" />
            Projected outflow
          </div>
          <span className="font-semibold text-red-600">
            {formatCurrency(outflow)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-xs text-muted-foreground">Projected net</span>
          <span className={`font-semibold ${netColor}`}>
            {formatCurrency(net)}
          </span>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { getNotifications } from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";

export function RecentAlertsWidget() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await getNotifications();
        const notifications = Array.isArray(res) ? res : [];
        setAlerts(notifications.slice(0, 5));
      } catch {
        // Silent — x-silent-error header already suppresses api-client logging
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <BellRing className="h-4 w-4 text-primary" />
        Recent Alerts
      </h4>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id || alert.title}
            className="flex items-start justify-between p-2 rounded-lg bg-muted/50 text-xs">
            <div>
              <p className="font-medium">{alert.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {alert.message} • {formatDistanceToNow(new Date(alert.date), { addSuffix: true })}
              </p>
            </div>
            <Button variant="ghost" size="small" className="h-6 text-[10px]">
              View
            </Button>
          </div>
        ))}
        {alerts.length === 0 && !loading && (
             <p className="text-xs text-muted-foreground text-center py-2">No new alerts</p>
        )}
      </div>
    </div>
  );
}

export function AccountSwitcherWidget() {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Wallet className="h-4 w-4 text-primary" />
        Account Switcher
      </h4>
      <Select defaultValue="primary-checking">
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="primary-checking">Primary Checking</SelectItem>
          <SelectItem value="savings-plus">Savings Plus</SelectItem>
          <SelectItem value="business-pro">Business Pro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
