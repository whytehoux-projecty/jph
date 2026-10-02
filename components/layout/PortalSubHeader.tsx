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
        {/* Left: Personalized greeting or Page Title */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            {pathname === "/dashboard" || pathname === "/" ? (
              <span className="text-sm tracking-tight text-ink-900 leading-snug">
                <span className="font-semibold">Welcome back, {firstName}.</span> <span className="hidden lg:inline text-ink-600">Know that Heritage Trust will never ask for your password, PIN, or OTP via email or phone. <Link href="/security" className="underline hover:text-vermilion-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600 rounded-sm">Learn more about staying safe</Link></span>
              </span>
            ) : (
              <span className="text-sm tracking-tight text-ink-900 leading-snug font-semibold">
                {pathname?.startsWith("/transfer") && "Transfers & Payments"}
                {pathname?.startsWith("/accounts") && "Account Management"}
                {pathname?.startsWith("/cards") && "Card Management"}
                {pathname?.startsWith("/statements") && "Statements & Documents"}
                {pathname?.startsWith("/settings") && "Settings & Preferences"}
                {pathname?.startsWith("/support") && "Support Center"}
                {pathname?.startsWith("/transactions") && "Transaction History"}
                {pathname?.startsWith("/bills") && "Bill Pay"}
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
