"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Building2,
  ArrowRightLeft,
  FileText,
  KeyRound,
  CreditCard,
  ReceiptText,
  LifeBuoy,
  BellRing,
  LogOut,
  Landmark
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Accounts", href: "/admin/accounts", icon: Building2 },
  { name: "Transactions", href: "/admin/transactions", icon: ArrowRightLeft },
  { name: "Cards", href: "/admin/cards", icon: CreditCard },
  { name: "Bill Payments", href: "/admin/bills", icon: ReceiptText },
  { name: "Statements", href: "/admin/statements", icon: FileText },
  { name: "Applications", href: "/admin/applications", icon: FileText },
  { name: "Access Requests", href: "/admin/requests", icon: KeyRound },
  { name: "Support Inbox", href: "/admin/support", icon: LifeBuoy },
  { name: "Push Notifications", href: "/admin/notifications", icon: BellRing },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-charcoal text-white flex flex-col h-full overflow-y-auto">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <Landmark className="w-8 h-8 text-vintage-gold" />
        <div>
          <h2 className="font-playfair font-bold text-xl tracking-wide">JPHeritage</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest text-vintage-gold/80">Admin Portal</p>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-vintage-gold/10 text-vintage-gold border-r-2 border-vintage-gold" 
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
