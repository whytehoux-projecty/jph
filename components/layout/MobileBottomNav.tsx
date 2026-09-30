"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, CreditCard, Menu, List } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Activity", href: "/transactions", icon: List },
  { name: "Transfer", href: "/transfer", icon: ArrowLeftRight },
  { name: "Cards", href: "/cards", icon: CreditCard },
  { name: "More", href: "/settings", icon: Menu }, // Or another appropriate icon for More
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[color:var(--heritage-surface)]/95 backdrop-blur-md border-t border-[color:var(--heritage-navy)]/15 safe-area-pb">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-gold)] focus-visible:ring-offset-2",
                isActive 
                  ? "text-[color:var(--heritage-navy)] font-semibold" 
                  : "text-muted-foreground hover:text-[color:var(--heritage-navy)]/80"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[color:var(--heritage-gold)] rounded-b-md" />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
