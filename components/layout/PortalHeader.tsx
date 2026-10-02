
"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Globe, Menu, Shield } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b border-paper-200 bg-white/95 backdrop-blur-md shadow-none text-ink-900">
      <div className="flex h-[70px] items-center px-4 md:px-6 justify-between">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2 h-full">
          {/* Fix #34: Hamburger menu for mobile */}
          <Button
            variant="ghost"
            size="small"
            className="md:hidden text-ink-900 hover:bg-paper-50 px-2 h-9 rounded"
            onClick={onToggleLeftSidebar}>
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/dashboard" className="flex items-center gap-2 h-full ml-1 md:ml-0 min-w-0">
            <div className="flex items-center ml-1 min-w-0">
              <img src="/images/logos/heritage-trust-logo.svg" alt="Heritage Trust Logo" className="h-6 md:h-7 w-auto" />
            </div>
          </Link>
        </div>

        {/* Right Side: Notifications & User Profile */}
        <div className="flex items-center gap-2">
          <div className="mr-1 shrink-0">
            <Select defaultValue="en" onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-auto gap-0 sm:gap-2 bg-transparent border border-paper-200 text-ink-900 hover:bg-paper-50 focus:ring-0 focus:ring-offset-0 px-1 sm:px-2 h-8 rounded transition-colors">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">
                  <SelectValue placeholder="EN" />
                </span>
              </SelectTrigger>
              <SelectContent
                align="end"
                className="bg-white/95 backdrop-blur-md border-paper-200 rounded text-ink-900">
                <SelectItem value="en">English (EN)</SelectItem>
                <SelectItem value="fr">Français (FR)</SelectItem>
                <SelectItem value="de">Deutsch (DE)</SelectItem>
                <SelectItem value="es">Español (ES)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fix #22: Notifications use onToggleNotifications (separate handler) */}
          <NotificationCenter onClick={onToggleNotifications ?? onToggleRightSidebar} />

          {/* User Profile & Security Settings */}
          <Link
            href="/settings"
            title="Account & Security Settings"
            className="flex h-8 w-8 items-center justify-center rounded text-ink-900 transition-colors hover:bg-paper-50 hover:text-ink-900"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
