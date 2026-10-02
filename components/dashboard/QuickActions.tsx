"use client";

import Link from "next/link";
import {
  Send,
  Receipt,
  Plus,
  ArrowUpRight,
  Wallet,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  {
    title: "Transfer Funds",
    description: "Domestic & Fedwire",
    href: "/transfer",
    icon: Send,
  },
  {
    title: "Bill Pay & Invoicing",
    description: "Utilities & vendors",
    href: "/bills",
    icon: Receipt,
  },
  {
    title: "Post Transaction",
    description: "Record manual entry",
    href: "/transactions",
    icon: Plus,
  },
  {
    title: "Accounts Vault",
    description: "Statements & balances",
    href: "/accounts",
    icon: Wallet,
  },
];

export function QuickActions() {
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-ink-500">
          Executive Actions
        </h3>
        <span className="text-[11px] font-mono text-ink-500">Instant Rail Execution</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group relative flex flex-col justify-between p-4 rounded-sm border border-paper-200 bg-white transition-all duration-200 hover:border-ink-900/40 hover:bg-paper-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600"
            >
              <div className="flex w-full items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-paper-200 bg-paper-50 text-ink-700 transition-colors group-hover:border-vermilion-600/40 group-hover:text-vermilion-600">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-ink-500/40 transition-all duration-200 group-hover:text-vermilion-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-ink-900 group-hover:text-vermilion-600 transition-colors">
                  {action.title}
                </h4>
                <p className="mt-0.5 text-xs text-ink-500 line-clamp-1">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

