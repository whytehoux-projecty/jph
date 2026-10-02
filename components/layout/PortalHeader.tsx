
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Globe, Menu, Shield, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "@/components/NotificationCenter";
import { signOut } from "next-auth/react";
import { updatePreferences } from "@/app/actions/profile";

export interface HeaderProps {
  onToggleRightSidebar?: () => void;
  onToggleNotifications?: () => void;
  isRightSidebarOpen?: boolean;
  profile?: any;
}

export function PortalHeader({
  onToggleRightSidebar,
  onToggleNotifications,
  isRightSidebarOpen,
  profile,
}: HeaderProps) {
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : "Loading...";
  const [timeStr, setTimeStr] = useState<string>("");
  const [locationStr, setLocationStr] = useState<string>("Detecting location...");

  useEffect(() => {
    // Clock
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleString());
    }, 1000);
    setTimeStr(new Date().toLocaleString());

    // Geo Location
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.city && data.country_name) {
          setLocationStr(`${data.city}, ${data.country_name}`);
        } else {
          setLocationStr("Location unavailable");
        }
      })
      .catch(() => setLocationStr("Location unavailable"));

    return () => clearInterval(timer);
  }, []);

  // Fix #23: language selector state (persists for UI only; full i18n requires server-side preference save)
  const handleLanguageChange = async (lang: string) => {
    // Store in localStorage for now as a client-side preference
    localStorage.setItem("preferredLanguage", lang);
    // Call server action to save to DB
    await updatePreferences({ preferredLanguage: lang });
    // Reload to apply language preference
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-none flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-ink-900 text-paper-50 w-full h-10 px-4 md:px-6 flex items-center justify-between text-xs tracking-wide border-b-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap overflow-hidden whitespace-nowrap opacity-90">
          <span>Logged in: <span className="font-semibold text-white">{userName}</span></span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="tabular-nums font-mono">{timeStr}</span>
          <span className="hidden md:inline opacity-40">|</span>
          <span className="hidden sm:inline">{locationStr}</span>
        </div>
        
        <div className="shrink-0 flex items-center">
          <Select defaultValue="en" onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-auto gap-1 sm:gap-2 bg-transparent border-0 text-white hover:bg-white/10 focus:ring-0 focus:ring-offset-0 px-2 h-7 rounded transition-colors text-xs">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">
                <SelectValue placeholder="EN" />
              </span>
            </SelectTrigger>
            <SelectContent
              align="end"
              className="bg-paper-50/95 backdrop-blur-md border-paper-200 rounded text-ink-900">
              <SelectItem value="en">English (EN)</SelectItem>
              <SelectItem value="fr">Français (FR)</SelectItem>
              <SelectItem value="de">Deutsch (DE)</SelectItem>
              <SelectItem value="es">Español (ES)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Logo Header */}
      <div className="w-full border-b border-paper-200 bg-paper-50/95 backdrop-blur-md flex h-[70px] items-center px-4 md:px-6 justify-between">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2 h-full">

          <Link href="/dashboard" className="flex items-center gap-2 h-full ml-1 md:ml-0 min-w-0">
            <div className="flex items-center ml-1 min-w-0">
              <img src="/images/logos/heritage-trust-logo.svg" alt="Heritage Trust Logo" className="h-6 md:h-7 w-auto" />
            </div>
          </Link>
        </div>

        {/* Right Side: Support, Notifications & User Profile */}
        <div className="flex items-center gap-2">
          {/* Live Support Button */}
          <Link 
            href="/support"
            title="Live Support"
            className="flex items-center w-auto gap-1.5 sm:gap-2 bg-transparent border border-paper-200 text-ink-900 hover:bg-paper-50 px-2 sm:px-2.5 h-8 rounded transition-colors text-sm"
          >
            <div className="relative h-4 w-4 overflow-hidden opacity-80 saturate-0 contrast-125 shrink-0">
              <Image 
                src="/images/icons/service.png" 
                alt="Support" 
                fill
                className="object-contain"
              />
            </div>
            <span className="hidden sm:inline">Live Support</span>
          </Link>

          {/* Fix #22: Notifications use onToggleNotifications (separate handler) */}
          <NotificationCenter onClick={onToggleNotifications ?? onToggleRightSidebar} />

          {/* User Profile & Security Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                title="Account Settings"
                className="flex h-8 w-8 items-center justify-center rounded text-ink-900 transition-colors hover:bg-paper-100/50 outline-none focus-visible:ring-2 focus-visible:ring-paper-300"
              >
                <div className="relative h-4 w-4 overflow-hidden opacity-80 hover:opacity-100 transition-opacity saturate-0 contrast-125 pointer-events-none">
                  <Image 
                    src="/images/icons/control.png" 
                    alt="Settings" 
                    fill
                    className="object-contain"
                  />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-paper-50 border border-paper-200 text-ink-900 shadow-xl rounded-md p-1">
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-paper-100 focus:bg-paper-100 p-2 rounded-sm text-sm">
                <Link href="/settings" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4 opacity-70" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-paper-100 focus:bg-paper-100 p-2 rounded-sm text-sm">
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4 opacity-70" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-paper-200 my-1 h-px" />
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="cursor-pointer text-error hover:bg-error-bg hover:text-error focus:bg-error-bg focus:text-error p-2 rounded-sm text-sm"
              >
                <div className="flex items-center w-full">
                  <LogOut className="mr-2 h-4 w-4 opacity-70" />
                  Logout
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
