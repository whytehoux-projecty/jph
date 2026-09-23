"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transfer", href: "/transfer", icon: ArrowLeftRight },
  { name: "Cards", href: "/cards", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
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
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive 
                  ? "text-[color:var(--heritage-gold)]" 
                  : "text-muted-foreground hover:text-[color:var(--heritage-gold)]/80"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
