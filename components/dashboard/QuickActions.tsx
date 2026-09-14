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
    variant: "charcoal",
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
    variant: "green",
  },
];

export function QuickActions() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-lg font-playfair">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative flex flex-col items-start p-4 rounded-none border bg-card/50 hover:bg-card hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex w-full items-start justify-between mb-3">
                <VintageIcon
                  icon={action.icon}
                  variant={action.variant}
                  size="sm"
                  className="rounded-none"
                />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1" />
              </div>

              <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                {action.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
