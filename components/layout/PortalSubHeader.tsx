"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PortalSubHeaderProps {
  profile?: {
    firstName?: string;
    lastName?: string;
    tier?: string;
  } | null;
}

const subpageLinks = [
  { name: "Overview", href: "/dashboard" },
  { name: "Accounts", href: "/accounts" },
  { name: "Transfers", href: "/transfer" },
  { name: "Cards", href: "/cards" },
  { name: "Statements", href: "/statements" },
];

export function PortalSubHeader({ profile }: PortalSubHeaderProps) {
  const pathname = usePathname();

  const firstName = profile?.firstName || "Client";
  const tier = profile?.tier ? `${profile.tier} Member` : "Private Client";

  return (
    <div className="w-full border-b border-paper-200 bg-paper-50/90 backdrop-blur-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 md:px-6 lg:px-8 py-2">
        {/* Left: Personalized greeting & security status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-ink-900">
              Welcome back, {firstName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-sm border border-paper-200 bg-paper-100 px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider text-ink-700">
              <Sparkles className="h-2.5 w-2.5 text-vermilion-600" />
              {tier}
            </span>
          </div>
          <span className="hidden md:inline text-paper-300">·</span>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-ink-500 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            <span>256-Bit Encrypted · Member FDIC</span>
          </div>
        </div>

        {/* Right: Portal subpage navigation links */}
        <nav className="flex items-center gap-1 overflow-x-auto py-0.5" aria-label="Portal subpages">
          {subpageLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "shrink-0 px-2.5 py-1 rounded-sm text-xs transition-all duration-150 font-medium",
                  isActive
                    ? "bg-white text-ink-900 border border-paper-200 shadow-xs font-semibold"
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
