"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
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
  Landmark,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  Globe,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminBadge } from "./AdminBadge";

type SubNavItem = {
  name: string;
  href: string;
  badgeCount?: number;
  badgeVariant?: "pending" | "urgent" | "neutral";
};

type NavCategory = {
  name: string;
  icon: any;
  href?: string;
  subItems?: SubNavItem[];
};

export type AdminSidebarProps = {
  badgeCounts?: {
    pendingApps?: number;
    pendingRequests?: number;
    pendingTxns?: number;
    openTickets?: number;
  };
};

export function AdminSidebar({ badgeCounts = {} }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const NAV_TREE: NavCategory[] = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      name: "Customer Mgmt",
      icon: Users,
      subItems: [
        { name: "Account Holders", href: "/admin/customers/account-holders" },
        { name: "Application Mgmt Hub", href: "/admin/customers/application-management", badgeCount: (badgeCounts.pendingApps || 0) + (badgeCounts.pendingRequests || 0), badgeVariant: "urgent" },
      ]
    },
    {
      name: "Transaction Mgmt",
      icon: ArrowRightLeft,
      subItems: [
        { name: "All Transactions", href: "/admin/transactions", badgeCount: badgeCounts.pendingTxns, badgeVariant: "urgent" },
      ]
    },
    {
      name: "e-Bank Mgmt",
      icon: Building2,
      subItems: [
        { name: "e-Bank Hub", href: "/admin/ebank" },
        { name: "Bill Services", href: "/admin/ebank/bill-services" },
        { name: "Push Notifications", href: "/admin/ebank/notifications" },
        { name: "Support Inbox", href: "/admin/ebank/support", badgeCount: badgeCounts.openTickets, badgeVariant: "pending" },
      ]
    },
    {
      name: "Site & CMS",
      icon: Globe,
      subItems: [
        { name: "Corporate Website", href: "/admin/cms/corporate" },
        { name: "e-Portal Settings", href: "/admin/cms/portal" },
      ]
    },
    {
      name: "System",
      icon: Settings,
      subItems: [
        { name: "Roles & Access", href: "/admin/system/roles" },
        { name: "Settings", href: "/admin/system/settings" },
      ]
    }
  ];

  // Initialize from local storage
  useEffect(() => {
    const stored = localStorage.getItem("adminSidebarCollapsed");
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  // Auto-expand category based on pathname
  useEffect(() => {
    if (pathname && !isCollapsed) {
      const activeCat = NAV_TREE.find(cat => 
        cat.subItems?.some(sub => pathname.startsWith(sub.href))
      );
      if (activeCat && !openCategories[activeCat.name]) {
        setOpenCategories(prev => ({ ...prev, [activeCat.name]: true }));
      }
    }
  }, [pathname, isCollapsed]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("adminSidebarCollapsed", String(newState));
  };

  const toggleCategory = (catName: string) => {
    if (isCollapsed) {
      toggleSidebar();
    }
    setOpenCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  return (
    <aside className={cn(
      "bg-charcoal text-white flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out shrink-0",
      isCollapsed ? "w-[72px]" : "w-[280px]"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center h-16 border-b border-white/10 shrink-0",
        isCollapsed ? "justify-center px-0" : "justify-between px-4"
      )}>
        <div className={cn("flex items-center gap-3 overflow-hidden", isCollapsed && "hidden")}>
          <Landmark className="w-6 h-6 text-vintage-gold shrink-0" />
          <div className="truncate">
            <h2 className="font-playfair font-bold text-lg tracking-wide truncate">JPHeritage</h2>
          </div>
        </div>
        
        <button 
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-white/5 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <nav className="space-y-1 px-3">
          {NAV_TREE.map((category) => {
            const isCatActive = category.href === pathname || category.subItems?.some(sub => pathname.startsWith(sub.href));
            const isOpen = openCategories[category.name];
            
            // Total badge count for collapsed view
            const totalBadges = category.subItems?.reduce((acc, sub) => acc + (sub.badgeCount || 0), 0) || 0;
            const hasUrgent = category.subItems?.some(sub => sub.badgeVariant === "urgent" && (sub.badgeCount || 0) > 0);

            if (category.href && !category.subItems) {
              return (
                <Link
                  key={category.name}
                  href={category.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
                    isCatActive 
                      ? "bg-vintage-gold/10 text-vintage-gold border-l-2 border-vintage-gold font-bold" 
                      : "text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                  )}
                  title={isCollapsed ? category.name : undefined}
                >
                  <category.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{category.name}</span>}
                </Link>
              );
            }

            return (
              <div key={category.name} className="space-y-1">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group relative",
                    isCatActive && !isOpen
                      ? "text-vintage-gold"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                  title={isCollapsed ? category.name : undefined}
                >
                  <category.icon className="w-5 h-5 shrink-0" />
                  
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{category.name}</span>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-transform duration-200 opacity-50 group-hover:opacity-100",
                        isOpen && "rotate-90"
                      )} />
                    </>
                  )}

                  {isCollapsed && totalBadges > 0 && (
                    <div className={cn(
                      "absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-charcoal",
                      hasUrgent ? "bg-red-500" : "bg-amber-500"
                    )} />
                  )}
                </button>

                {!isCollapsed && (
                  <div className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100 mb-2" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden flex flex-col space-y-1 pl-11 pr-2">
                      {category.subItems?.map((sub) => {
                        const isSubActive = pathname.startsWith(sub.href);
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={cn(
                              "flex items-center justify-between py-1.5 px-2 rounded text-[13px] transition-colors relative before:absolute before:left-[-15px] before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:transition-colors",
                              isSubActive 
                                ? "text-vintage-gold font-semibold before:bg-vintage-gold" 
                                : "text-gray-400 hover:text-white hover:bg-white/5 before:bg-transparent"
                            )}
                          >
                            <span className="truncate">{sub.name}</span>
                            {sub.badgeCount ? (
                              <AdminBadge count={sub.badgeCount} variant={sub.badgeVariant} />
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-white/10 shrink-0",
        isCollapsed ? "px-2 flex justify-center" : ""
      )}>
        <button 
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className={cn(
            "flex items-center rounded-md text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors w-full",
            isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2"
          )}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </aside>
  );
}
