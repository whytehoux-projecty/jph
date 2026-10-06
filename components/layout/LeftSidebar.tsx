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
      className={cn("h-[30px] w-[30px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600", className)}
      onClick={onClick}
      {...props}>
      <PanelLeft className="h-[18px] w-[18px]" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

const navigation = [
  { name: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { name: "Vaults",       href: "/vaults",       icon: Wallet },
  { name: "Transfers",    href: "/transfer",     icon: ArrowLeftRight },
  { name: "Activities",   href: "/activities",   icon: Receipt },
  { name: "Savings",      href: "/savings",      icon: FileText },
  { name: "Beneficiaries",href: "/beneficiaries",icon: Users },
  { name: "Settings",     href: "/settings",     icon: Settings },
  { name: "Support",      href: "/support",      icon: HelpCircle },
];

export function LeftSidebar({ isOpen, onToggle }: LeftSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={onToggle}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 lg:sticky lg:top-0 h-screen border-r border-paper-200 bg-paper-50/95 backdrop-blur-md transition-all duration-300 ease-in-out z-60 flex flex-col shrink-0",
          isOpen ? "translate-x-0 w-64 shadow-none" : "-translate-x-full lg:translate-x-0 w-64 lg:w-16"
        )}>
      {/* Sidebar Header with Trigger */}
      <div
        className={cn(
          "flex h-[70px] items-center border-b border-paper-200 shrink-0",
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
                      "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600",
                      isActive
                        ? "bg-ink-900 text-paper-50 shadow-none"
                        : "text-ink-500 hover:bg-paper-50 hover:text-ink-900",
                      !isOpen && "justify-center px-0",
                    )}>
                    <VintageIcon
                      icon={item.icon}
                      size="sm"
                      variant={isActive ? "gold" : "ink-900"}
                      className={cn(!isOpen && "mx-auto")}
                    />
                    {isOpen && <span>{item.name}</span>}
                  </Link>

                  {/* Fix #11: tooltip when sidebar is collapsed */}
                  {!isOpen && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover/item:flex items-center pointer-events-none">
                      <div className="bg-ink-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                        {item.name}
                      </div>
                      <div className="absolute right-full border-[6px] border-transparent border-r-ink-900" />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Fix #9: Logout outside ScrollArea, properly at bottom with border separator */}
        <div className={cn("shrink-0 border-t border-paper-200 p-2", !isOpen && "flex justify-center")}>
          {/* Fix #11: Logout tooltip in collapsed mode */}
          <div className="relative group/logout">
            <button
              onClick={() => {
                import('@/app/actions/auth').then(m => m.logoutAction());
              }} // Fix #33: fallback to /login not localhost:3002
              className={cn(
                "w-full flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors text-error hover:bg-error-bg hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error",
                !isOpen && "justify-center px-0 w-auto",
              )}>
              <VintageIcon
                icon={LogOut}
                size="sm"
                variant="ink-900"
                className={cn(!isOpen && "mx-auto text-red-600")}
              />
              {isOpen && <span>Logout</span>}
            </button>
            {!isOpen && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover/logout:flex items-center pointer-events-none">
                <div className="bg-error text-paper-50 text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                  Logout
                </div>
                <div className="absolute right-full border-[6px] border-transparent border-r-error" />
              </div>
            )}
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}
