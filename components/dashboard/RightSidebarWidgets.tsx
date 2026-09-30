"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { getAccounts } from "@/app/actions/accounts";
import { getBillHistory } from "@/app/actions/bills";
import { getTransactionStats } from "@/app/actions/transactions";
import { getNotifications } from "@/app/actions/notifications";
import { getBudgets, getCreditScore } from "@/app/actions/widgets";
import { formatDistanceToNow } from "date-fns";

export function FinancialTipWidget() {
  return (
    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-200/20 rounded-full blur-xl group-hover:bg-amber-300/30 transition-all duration-500" />
      <h4 className="text-xs font-bold mb-2 flex items-center gap-2 text-amber-900 tracking-tight">
        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
          <Lightbulb className="h-3.5 w-3.5" />
        </div>
        Daily Tip
      </h4>
      <p className="text-[11px] text-amber-800/80 italic leading-relaxed font-medium">
        "Review your subscriptions monthly to avoid paying for unused services."
      </p>
    </div>
  );
}

export function BudgetWidget() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    getBudgets().then(data => {
      if (data && data.length > 0) setCategories(data);
    }).catch(console.error);
  }, []);

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4 hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          Monthly Budget
        </h4>
      </div>
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.name} className="space-y-1.5 group">
            <div className="flex justify-between text-xs items-end">
              <span className="font-semibold text-slate-700">{cat.name}</span>
              <span className="text-[10px] text-slate-400 font-mono font-medium">
                <span className="text-slate-700">{formatCurrency(cat.spent)}</span> / {formatCurrency(cat.limit)}
              </span>
            </div>
            <Progress
              value={(cat.spent / cat.limit) * 100}
              className="h-2 bg-slate-100"
              indicatorClassName={cat.color}
            />
          </div>
        ))}
      </div>
      <Button variant="ghost" size="small" className="w-full text-xs h-8 rounded-xl font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
        View All Budgets <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
      </Button>
    </div>
  );
}

export function UpcomingBillsWidget() {
  const router = useRouter();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBillHistory()
      .then((data) => {
        const pending = (data || []).filter((b: any) => b.status === "PENDING").slice(0, 3);
        setBills(pending);
      })
      .catch(() => setBills([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4 hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-shadow duration-300">
      <h4 className="text-[13px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
        <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg">
          <AlertCircle className="h-3.5 w-3.5" />
        </div>
        Upcoming Bills
      </h4>
      <div className="space-y-2">
        {bills.map((bill) => (
          <div
            key={bill.id || bill.payee?.name || bill.amount}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100/50 hover:border-slate-200 transition-colors group cursor-pointer text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{bill.payee?.name || "Scheduled Bill"}</p>
                <p className="text-[10px] text-rose-500 font-medium">Due soon</p>
              </div>
            </div>
            <span className="font-bold text-slate-800 font-mono tracking-tight">{formatCurrency(bill.amount)}</span>
          </div>
        ))}
        {bills.length === 0 && !loading && (
          <p className="text-xs text-slate-400 text-center py-3 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">No pending bills</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="small"
        className="w-full text-xs h-8 rounded-xl font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        onClick={() => router.push('/bills')}
      >
        See All Bills <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
      </Button>
    </div>
  );
}

export function CreditScoreWidget() {
  const [scoreData, setScoreData] = useState<any>(null);

  useEffect(() => {
    getCreditScore().then(setScoreData).catch(console.error);
  }, []);

  const score = scoreData?.score || 785;
  const change = scoreData?.change || 12;

  return (
    <div className="p-5 rounded-2xl bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.15)] border border-slate-700/50 group overflow-hidden relative">
      <div className="absolute -inset-24 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rotate-12 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
            Credit Score
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 h-auto rounded-full font-semibold shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          Excellent
        </Badge>
      </div>
      <div className="flex items-end gap-2 mb-1.5 relative z-10">
        <span className="text-4xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">{score}</span>
        <span className="text-xs text-emerald-400 mb-2 flex items-center font-medium bg-emerald-400/10 px-1.5 py-0.5 rounded text-[10px]">
          +{change} pts <TrendingUp className="h-2.5 w-2.5 ml-1" />
        </span>
      </div>
      <p className="text-[10px] text-slate-400/80 font-medium relative z-10">Updated today</p>
    </div>
  );
}

export function CashFlowProjectionWidget() {
  const [inflow, setInflow] = useState(0);
  const [outflow, setOutflow] = useState(0);

  useEffect(() => {
    getTransactionStats("month")
      .then((s: any) => {
        setInflow(s?.income || 6250);
        setOutflow(Math.abs(s?.expenses || 3820));
      })
      .catch(() => {
        setInflow(6250);
        setOutflow(3820);
      });
  }, []);

  const net = inflow - outflow;
  const netColor = net >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4 hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-shadow duration-300">
      <h4 className="text-[13px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
        <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
          <TrendingUp className="h-3.5 w-3.5" />
        </div>
        Cash Flow Projection
      </h4>
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100/50">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <div className="bg-emerald-100 p-1 rounded-md text-emerald-600">
              <ArrowDownLeft className="h-3 w-3" />
            </div>
            Inflow
          </div>
          <span className="font-bold text-slate-800 font-mono tracking-tight">
            {formatCurrency(inflow)}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100/50">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <div className="bg-rose-100 p-1 rounded-md text-rose-600">
              <ArrowUpRight className="h-3 w-3" />
            </div>
            Outflow
          </div>
          <span className="font-bold text-slate-800 font-mono tracking-tight">
            {formatCurrency(outflow)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projected net</span>
          <span className={`font-black font-mono tracking-tighter text-sm ${netColor}`}>
            {formatCurrency(net)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RecentAlertsWidget() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await getNotifications();
        const notifications = Array.isArray(res) ? res : [];
        setAlerts(notifications.slice(0, 5));
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4 hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-shadow duration-300">
      <h4 className="text-[13px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
        <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
          <BellRing className="h-3.5 w-3.5" />
        </div>
        Recent Alerts
      </h4>
      <div className="space-y-2">
        {alerts.map((alert) => {
           // Use a subtle red background for urgent-sounding alerts
           const isUrgent = alert.title?.toLowerCase().includes("failed") || alert.title?.toLowerCase().includes("declined");
           return (
            <div
              key={alert.id || alert.title}
              className={`flex items-start justify-between p-3 rounded-xl border transition-colors group cursor-pointer ${isUrgent ? 'bg-rose-50/50 border-rose-100 hover:border-rose-200' : 'bg-slate-50/80 border-slate-100/50 hover:border-slate-200'} text-xs`}>
              <div className="flex-1 min-w-0 mr-3">
                <p className={`font-semibold truncate ${isUrgent ? 'text-rose-900' : 'text-slate-800'}`}>{alert.title}</p>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${isUrgent ? 'text-rose-600/80' : 'text-slate-500'}`}>
                  {alert.message}
                </p>
                <p className={`text-[9px] mt-1 font-mono uppercase tracking-widest ${isUrgent ? 'text-rose-400' : 'text-slate-400'}`}>
                  {formatDistanceToNow(new Date(alert.createdAt || Date.now()), { addSuffix: true })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="small"
                className={`h-7 w-7 p-0 rounded-lg shrink-0 ${isUrgent ? 'text-rose-600 hover:bg-rose-100 hover:text-rose-700' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                onClick={() => {
                  const title = (alert.title || '').toLowerCase();
                  if (title.includes('transfer') || title.includes('transaction')) router.push('/transactions');
                  else if (title.includes('card')) router.push('/cards');
                  else if (title.includes('bill')) router.push('/bills');
                  else router.push('/dashboard');
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
        {alerts.length === 0 && !loading && (
          <p className="text-xs text-slate-400 text-center py-3 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">No new alerts</p>
        )}
      </div>
    </div>
  );
}

export function AccountSwitcherWidget() {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    getAccounts()
      .then((data) => setAccounts(data || []))
      .catch(() => setAccounts([]));
  }, []);

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4 hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-shadow duration-300">
      <h4 className="text-[13px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
        <div className="p-1.5 bg-sky-50 text-sky-500 rounded-lg">
          <Wallet className="h-3.5 w-3.5" />
        </div>
        Account Switcher
      </h4>
      <Select defaultValue={accounts[0]?.id || ""}>
        <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl focus:ring-1 focus:ring-primary/20 text-xs font-semibold text-slate-700 shadow-sm">
          <SelectValue placeholder={accounts.length > 0 ? "Select account" : "Loading accounts..."} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
          {accounts.length > 0 ? (
            accounts.map((a) => (
              <SelectItem key={a.id} value={a.id} className="text-xs font-medium focus:bg-slate-50 rounded-lg">
                <span className="flex items-center justify-between w-full gap-4">
                  <span>{a.accountType} ••••{a.accountNumber.slice(-4)}</span>
                  <span className="font-mono text-slate-500">{formatCurrency(a.balance, a.currency || 'USD')}</span>
                </span>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled className="text-xs">
              No accounts available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
