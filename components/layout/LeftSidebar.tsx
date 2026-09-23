"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Wallet,
  CreditCard,
  FileText,
  BarChart2,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  PanelLeft,
} from "lucide-react";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/Button";

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-[30px] w-[30px]", className)}
      onClick={onClick}
      {...props}>
      <PanelLeft className="h-[18px] w-[18px]" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

const navigation = [
  { name: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { name: "Overview",     href: "/overview",     icon: BarChart2 },       // Fix #8/#24: add Overview to sidebar
  { name: "Transfer",     href: "/transfer",     icon: ArrowLeftRight },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Accounts",     href: "/accounts",     icon: Wallet },
  { name: "Cards",        href: "/cards",        icon: CreditCard },
  { name: "Bills",        href: "/bills",        icon: FileText },
  { name: "Beneficiaries",href: "/beneficiaries",icon: Users },
  { name: "Statements",   href: "/statements",   icon: BarChart2 },        // Fix #12: use BarChart2 for Statements, FileText stays for Bills only
  { name: "Settings",     href: "/settings",     icon: Settings },
  { name: "Support",      href: "/support",      icon: HelpCircle },
];

export function LeftSidebar({ isOpen, onToggle }: LeftSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative h-screen border-r border-[color:var(--heritage-navy)]/15 bg-[color:var(--heritage-surface)]/95 backdrop-blur-md transition-all duration-300 ease-in-out z-[60] flex flex-col",
        isOpen ? "w-64" : "w-16"
      )}>
      {/* Sidebar Header with Trigger */}
      <div
        className={cn(
          "flex h-[70px] items-center border-b border-[color:var(--heritage-navy)]/15 shrink-0",
          isOpen ? "px-3 justify-start" : "justify-center px-0",
        )}>
        <SidebarTrigger onClick={onToggle} />
        {isOpen && (
          <Separator orientation="vertical" className="mr-2 ml-2 h-4" />
        )}
      </div>

      {/* Fix #9: wrap nav + logout together so logout stays at bottom without absolute positioning */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <div key={item.name} className="relative group/item">
                  <Link
                    href={item.href}
                    className={cn(
                      // Fix #3: Replace gold accent-foreground active state with a clear navy highlight
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[color:var(--heritage-navy)] text-white shadow-sm"
                        : "text-[color:var(--heritage-navy)]/70 hover:bg-[color:var(--heritage-navy)]/10 hover:text-[color:var(--heritage-navy)]",
                      !isOpen && "justify-center px-0",
                    )}>
                    <VintageIcon
                      icon={item.icon}
                      size="sm"
                      variant={isActive ? "green" : "charcoal"}
                      className={cn(!isOpen && "mx-auto")}
                    />
                    {isOpen && <span>{item.name}</span>}
                  </Link>

                  {/* Fix #11: tooltip when sidebar is collapsed */}
                  {!isOpen && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover/item:flex items-center pointer-events-none">
                      <div className="bg-[color:var(--heritage-navy)] text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                        {item.name}
                      </div>
                      <div className="absolute right-full border-[6px] border-transparent border-r-[color:var(--heritage-navy)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Fix #9: Logout outside ScrollArea, properly at bottom with border separator */}
        <div className={cn("shrink-0 border-t border-[color:var(--heritage-navy)]/10 p-2", !isOpen && "flex justify-center")}>
          {/* Fix #11: Logout tooltip in collapsed mode */}
          <div className="relative group/logout">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })} // Fix #33: fallback to /login not localhost:3002
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-red-600/80 hover:bg-red-50 hover:text-red-700",
                !isOpen && "justify-center px-0 w-auto",
              )}>
              <VintageIcon
                icon={LogOut}
                size="sm"
                variant="charcoal"
                className={cn(!isOpen && "mx-auto text-red-600")}
              />
              {isOpen && <span>Logout</span>}
            </button>
            {!isOpen && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover/logout:flex items-center pointer-events-none">
                <div className="bg-red-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                  Logout
                </div>
                <div className="absolute right-full border-[6px] border-transparent border-r-red-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
