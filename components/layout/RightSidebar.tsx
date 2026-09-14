"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  PiggyBank,
  Banknote,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { VintageIcon } from "@/components/ui/vintage-icon";
import {
  BudgetWidget,
  UpcomingBillsWidget,
  CreditScoreWidget,
  FinancialTipWidget,
  CashFlowProjectionWidget,
  RecentAlertsWidget,
  AccountSwitcherWidget,
} from "@/components/dashboard/RightSidebarWidgets";

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const extraServices = [
  {
    name: "Vault Premium +",
    href: "#",
    icon: ShieldCheck,
    desc: "Exclusive security features",
  },
  {
    name: "Savings & Goals",
    href: "#",
    icon: PiggyBank,
    desc: "High-yield savings",
  },
  {
    name: "Personal Loans",
    href: "#",
    icon: Banknote,
    desc: "Low interest rates",
  },
  {
    name: "Business Suite",
    href: "#",
    icon: Briefcase,
    desc: "For your enterprise",
  },
];

export function RightSidebar({ isOpen, onToggle }: RightSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed right-0 top-[70px] bottom-0 w-[300px] border-l border-[#1E4B35]/10 bg-[#F1F8F5]/95 backdrop-blur-md transition-transform duration-300 ease-in-out z-40 shadow-xl",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}>
      <ScrollArea className="h-full">
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative">
              <Avatar className="h-40 w-40 border-4 border-white shadow-xl rounded-xl">
                <AvatarImage
                  src="/images/icons/default-avatar.svg"
                  className="object-cover"
                />
                <AvatarFallback className="rounded-xl text-3xl">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-9 w-9 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-playfair font-bold text-2xl text-charcoal">
                John Doe
              </h3>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  variant="outline"
                  className="text-secondary border-secondary text-xs px-2 py-0.5 bg-secondary/5">
                  PREMIUM MEMBER
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                ID: 8839-2991-00
              </p>
            </div>
          </div>

          {/* Widgets Section */}
          <div className="space-y-6 animate-fade-in-up">
            <RecentAlertsWidget />
            <div className="h-px bg-border/50" />
            <AccountSwitcherWidget />
            <div className="h-px bg-border/50" />
            <CreditScoreWidget />
            <div className="h-px bg-border/50" />
            <BudgetWidget />
            <div className="h-px bg-border/50" />
            <CashFlowProjectionWidget />
            <div className="h-px bg-border/50" />
            <UpcomingBillsWidget />
            <div className="h-px bg-border/50" />
            <FinancialTipWidget />
          </div>

          {/* Extra Services Menu */}
          <div className="space-y-1 mt-6">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Quick Access
            </h4>
            <div className="space-y-2">
              {extraServices.map((service) => (
                <Link
                  key={service.name}
                  href={service.href}
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent group">
                  <VintageIcon
                    icon={service.icon}
                    size="sm"
                    variant="charcoal"
                  />

                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {service.name}
                    </h5>
                    <p className="text-[10px] text-muted-foreground">
                      {service.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>

          {/* Promo Box specific to Sidebar */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
            <h4 className="font-playfair font-bold text-primary mb-1">
              Upgrade to Metal
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Get 3% cashback and exclusive concierge service.
            </p>
            <Button className="w-full h-8 text-xs bg-primary text-white hover:bg-primary/90">
              Learn More
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
