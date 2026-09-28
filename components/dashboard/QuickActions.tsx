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
import { VintageIcon } from "@/components/ui/vintage-icon";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant: "gold" | "green" | "charcoal";
}

const quickActions: QuickAction[] = [
  {
    title: "Transfer Money",
    description: "Send funds instantly",
    href: "/transfer",
    icon: Send,
    variant: "gold",
  },
  {
    title: "Pay Bills",
    description: "Utilities & cards",
    href: "/bills",
    icon: Receipt,
    variant: "gold",
  },
  {
    title: "Add Transaction",
    description: "Log a new activity",
    href: "/transactions",
    icon: Plus,
    variant: "gold",
  },
  {
    title: "View All Accounts",
    description: "Balances & details",
    href: "/accounts",
    icon: Wallet,
    variant: "gold",
  },
];

export function QuickActions() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-xl font-playfair text-[color:var(--heritage-navy)]">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative flex flex-col items-start p-5 rounded-xl border border-[color:var(--heritage-navy)]/10 bg-white shadow-vintage-sm hover:shadow-vintage-md transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-gold)]">
              <div className="flex w-full items-start justify-between mb-4">
                <VintageIcon
                  icon={action.icon}
                  variant={action.variant}
                  size="md"
                  className="rounded-lg"
                />
                <ArrowUpRight className="h-4 w-4 text-[color:var(--heritage-navy)]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <h4 className="font-semibold text-sm mb-1 text-[color:var(--heritage-navy)] group-hover:text-[color:var(--heritage-gold)] transition-colors">
                {action.title}
              </h4>
              <p className="text-[13px] text-muted-foreground line-clamp-1">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
