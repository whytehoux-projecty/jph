"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationCenter } from "@/components/NotificationCenter";

export interface HeaderProps {
  onToggleRightSidebar?: () => void;
  onToggleNotifications?: () => void;
  onToggleLeftSidebar?: () => void; // Fix #34: Mobile nav toggle
  isRightSidebarOpen?: boolean;
}

export function PortalHeader({
  onToggleRightSidebar,
  onToggleNotifications,
  onToggleLeftSidebar,
  isRightSidebarOpen,
}: HeaderProps) {

  // Fix #23: language selector state (persists for UI only; full i18n requires server-side preference save)
  const handleLanguageChange = (lang: string) => {
    // Store in localStorage for now as a client-side preference
    localStorage.setItem("preferredLanguage", lang);
    // Reload to apply language preference (the server reads from DB; 
    // a full solution would call a server action to save to DB)
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#0B1B30] bg-[color:var(--heritage-navy)]/95 backdrop-blur-md shadow-sm text-white">
      <div className="flex h-[70px] items-center px-4 md:px-6 justify-between">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2 h-full">
          {/* Fix #34: Hamburger menu for mobile */}
          <Button
            variant="ghost"
            size="small"
            className="md:hidden text-white hover:bg-white/10 px-2 h-9"
            onClick={onToggleLeftSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/dashboard" className="flex items-center gap-3 h-full ml-1 md:ml-0">
            <div className="relative h-12 w-40 md:w-48">
              <Image
                src="/portal-logo.svg"
                alt="JP Heritage"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Right Side: Notifications & User Profile */}
        <div className="flex items-center gap-2">
          {/* Fix #23: Language Selector now has an onChange handler */}
          <div className="mr-1">
            <Select defaultValue="en" onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-auto gap-2 bg-transparent border border-white/20 text-white hover:bg-white/10 focus:ring-0 focus:ring-offset-0 px-2 h-8 rounded-md transition-colors">
                <Globe className="h-4 w-4" />
                <SelectValue placeholder="EN" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="bg-[color:var(--heritage-surface)]/95 backdrop-blur-md border-[color:var(--heritage-navy)]/20 rounded-sm text-[color:var(--heritage-navy)]">
                <SelectItem value="en">English (EN)</SelectItem>
                <SelectItem value="fr">Français (FR)</SelectItem>
                <SelectItem value="de">Deutsch (DE)</SelectItem>
                <SelectItem value="es">Español (ES)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fix #22: Notifications use onToggleNotifications (separate handler) */}
          <NotificationCenter onClick={onToggleNotifications ?? onToggleRightSidebar} />

          {/* User Profile — opens profile / right sidebar */}
          <Button
            variant="ghost"
            size="small"
            onClick={onToggleRightSidebar}
            title="Your Profile"
            className={cn(
              "text-white hover:bg-white/10 hover:text-white transition-colors",
              isRightSidebarOpen && "bg-white/10 ring-1 ring-white/30",
            )}>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
