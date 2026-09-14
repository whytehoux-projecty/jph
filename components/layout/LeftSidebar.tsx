"use client";

import Link from "next/link";
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
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transfer", href: "/transfer", icon: ArrowLeftRight },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Cards", href: "/cards", icon: CreditCard },
  { name: "Bills", href: "/bills", icon: FileText },
  { name: "Beneficiaries", href: "/beneficiaries", icon: Users },
  { name: "Statements", href: "/statements", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: HelpCircle },
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
          "flex h-[70px] items-center border-b border-[color:var(--heritage-navy)]/15",
          isOpen ? "px-3 justify-start" : "justify-center px-0",
        )}>
        <SidebarTrigger onClick={onToggle} />
        {isOpen && (
          <Separator orientation="vertical" className="mr-2 ml-2 h-4" />
        )}
      </div>

      <ScrollArea className="flex-1 py-6">
        <nav className="space-y-2 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
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
            );
          })}
        </nav>

        {/* Logout Separate Section */}
        <div className="absolute bottom-4 left-0 w-full px-2">
          <Link
            href={
              process.env.NEXT_PUBLIC_CORPORATE_URL || "http://localhost:3002"
            }
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive",
              "text-muted-foreground",
              !isOpen && "justify-center px-0",
            )}>
            <VintageIcon
              icon={LogOut}
              size="sm"
              variant="charcoal"
              className={cn(!isOpen && "mx-auto")}
            />
            {isOpen && <span>Logout</span>}
          </Link>
        </div>
      </ScrollArea>
    </aside>
  );
}
