"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PortalSubHeaderProps {
  profile?: {
    firstName?: string;
    lastName?: string;
    tier?: string;
    email?: string;
    phone?: string | null;
    profilePhotoUrl?: string | null;
    profileType?: string;
  } | null;
  accountNumber?: string;
}

const subpageLinks = [
  { name: "Overview", href: "/dashboard" },
  { name: "Vaults", href: "/vaults" },
  { name: "Transfers & Payments", href: "/transfer" },
  { name: "Savings, Loans & Benefits", href: "/savings" },
  { name: "Activities", href: "/activities" },
  { name: "Deposit Cash & Cheques", href: "#", disabled: true, tooltip: "Upcoming Feature" },
];

export function PortalSubHeader({ profile }: PortalSubHeaderProps) {
  const pathname = usePathname();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loginTimeStr = sessionStorage.getItem("portal_login_time");
      const now = Date.now();
      let loginTime: number;

      if (!loginTimeStr) {
        loginTime = now;
        sessionStorage.setItem("portal_login_time", loginTime.toString());
      } else {
        loginTime = parseInt(loginTimeStr, 10);
      }

      const elapsed = now - loginTime;
      const displayDuration = 30 * 1000;

      if (elapsed < displayDuration) {
        setShowWelcome(true);
        const timeout = setTimeout(() => {
          setShowWelcome(false);
        }, displayDuration - elapsed);
        return () => clearTimeout(timeout);
      } else {
        setShowWelcome(false);
      }
    }
  }, []);

  const firstName = profile?.firstName || "Client";
  const fullNameRaw = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Client";
  const fullName = fullNameRaw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const tier = profile?.tier ? `${profile.tier} Member` : "Private Client";

  return (
    <div className="w-full border-b border-paper-200 bg-paper-50/90 backdrop-blur-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 md:px-6 lg:px-8 py-2">
        {/* Left: Personalized greeting or Page Title */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            {pathname === "/dashboard" || pathname === "/" ? (
              <span className="text-sm tracking-tight text-ink-900 leading-snug">
                {showWelcome ? (
                  <>
                    <span className="font-semibold">Welcome back, {firstName}.</span> <span className="hidden lg:inline text-ink-600">Know that Heritage Trust will never ask for your password, PIN, or OTP via email or phone. <Link href="/security" className="underline hover:text-vermilion-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600 rounded-sm">Learn more about staying safe</Link></span>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="font-semibold tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1 focus:outline-none">
                        {fullName}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 p-4 mt-2 border border-paper-200 bg-paper-50 shadow-md rounded-md">
                      <div className="flex flex-col gap-3">
                        {profile?.profilePhotoUrl ? (
                          <img src={profile.profilePhotoUrl} alt={fullName} className="w-24 h-32 object-cover rounded-md border border-paper-200" />
                        ) : (
                          <div className="w-24 h-32 bg-paper-200 rounded-md flex items-center justify-center text-ink-400 font-medium text-4xl">
                            <User className="h-10 w-10 opacity-40" />
                          </div>
                        )}
                        <div className="space-y-1">
                          <h4 className="font-semibold text-ink-900 text-lg">{fullName}</h4>
                          {profile?.profileType && <p className="text-xs uppercase tracking-wider text-ink-400 font-bold">{profile.profileType} Profile</p>}
                        </div>
                        <div className="space-y-1.5 pt-3 border-t border-paper-200 text-sm">
                          {profile?.email && <p className="text-ink-600 truncate">{profile.email}</p>}
                          {profile?.phone && <p className="text-ink-600">{profile.phone}</p>}
                          {tier && <p className="text-ink-600 font-medium">{tier}</p>}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </span>
            ) : (
              <span className="text-sm tracking-tight text-ink-900 leading-snug font-semibold">
                {pathname?.startsWith("/transfer") && "Transfers & Payments"}
                {pathname?.startsWith("/vaults") && "Vaults"}
                {pathname?.startsWith("/savings") && "Savings, Loans & Benefits"}
                {pathname?.startsWith("/settings") && "Settings & Preferences"}
                {pathname?.startsWith("/support") && "Support Center"}
                {pathname?.startsWith("/activities") && "Activities"}
              </span>
            )}
          </div>
        </div>

        {/* Right: Portal subpage navigation links */}
        <nav className="flex items-center gap-1 overflow-x-auto py-0.5" aria-label="Portal subpages">
          {subpageLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(link.href);

            if (link.disabled) {
              return (
                <div key={link.name} className="relative group cursor-not-allowed">
                  <span
                    className="shrink-0 px-2.5 py-1 rounded-sm text-xs transition-all duration-150 font-medium text-ink-400 opacity-60"
                  >
                    {link.name}
                  </span>
                  {link.tooltip && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-ink-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                      {link.tooltip}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "shrink-0 px-2.5 py-1 rounded-sm text-xs transition-all duration-150 font-medium",
                  isActive
                    ? "bg-paper-50 text-ink-900 border border-paper-200 shadow-xs font-semibold"
                    : "text-ink-500 hover:text-ink-900 hover:bg-paper-100 border border-transparent"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
