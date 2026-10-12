"use client";

import Link from "next/link";
import React from "react";

function MakePaymentsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Top Right Arrow */}
      <path d="M12 22h36" strokeWidth="4.5" />
      <path d="M36 12l12 10-12 10" strokeWidth="4.5" />
      {/* Bottom Left Arrow */}
      <path d="M52 42H16" strokeWidth="4.5" />
      <path d="M28 32L16 42l12 10" strokeWidth="4.5" />
    </svg>
  );
}

function VaultCardsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Vault Body */}
      <rect x="9" y="10" width="46" height="42" rx="4" strokeWidth="3.5" />
      {/* Inner Recessed Door Frame */}
      <rect x="15" y="16" width="34" height="30" rx="2" strokeWidth="2.5" />
      {/* Corner Rivets */}
      <circle cx="19" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="45" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="42" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="45" cy="42" r="1.2" fill="currentColor" stroke="none" />
      {/* Vault Feet */}
      <path d="M15 52v3h6v-3M43 52v3h6v-3" strokeWidth="3" />
      {/* Left Side Hinges */}
      <rect x="7" y="18" width="2.5" height="5" rx="0.8" fill="currentColor" stroke="none" />
      <rect x="7" y="37" width="2.5" height="5" rx="0.8" fill="currentColor" stroke="none" />
      {/* Central Rotary Vault Dial */}
      <circle cx="32" cy="31" r="8" strokeWidth="2.8" />
      <circle cx="32" cy="31" r="2.8" fill="currentColor" stroke="none" />
      {/* Dial Handles / Spokes */}
      <path d="M26.5 25.5l-3.5-3.5M37.5 25.5l3.5-3.5M26.5 36.5l-3.5 3.5M37.5 36.5l3.5 3.5" strokeWidth="2.6" />
    </svg>
  );
}

function SavingsLoansIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Banknote / Cash in Background */}
      <rect x="23" y="14" width="33" height="22" rx="2" strokeWidth="2.6" />
      <rect x="26" y="17" width="27" height="16" rx="1" strokeWidth="1.2" strokeDasharray="2.5 2" />
      <circle cx="39.5" cy="25" r="4.2" strokeWidth="2" />
      {/* Primary Coin Stack (4 layers) */}
      <ellipse cx="20" cy="27" rx="11" ry="4" strokeWidth="2.8" />
      <path d="M9 27v6c0 2.2 4.9 4 11 4s11-1.8 11-4v-6" strokeWidth="2.8" />
      <path d="M9 33v6c0 2.2 4.9 4 11 4s11-1.8 11-4v-6" strokeWidth="2.8" />
      <path d="M9 39v6c0 2.2 4.9 4 11 4s11-1.8 11-4v-6" strokeWidth="2.8" />
      {/* Wealth Radiance Rays */}
      <path d="M20 18v-5M13 19l-3-4M27 19l3-4" strokeWidth="2.4" />
      {/* Secondary Coin Stack */}
      <ellipse cx="37" cy="41" rx="8" ry="3" strokeWidth="2.5" />
      <path d="M29 41v5c0 1.65 3.6 3 8 3s8-1.35 8-3v-5" strokeWidth="2.5" />
    </svg>
  );
}

function ActivitiesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Clock Body Face */}
      <circle cx="35" cy="33" r="14" strokeWidth="3.2" />
      {/* Clock Hands (12:00 and 3:00) */}
      <path d="M35 24v9h7" strokeWidth="3" />
      <circle cx="35" cy="33" r="1.5" fill="currentColor" stroke="none" />
      {/* Sweeping Counter-Clockwise History Arc */}
      <path d="M44 19A 18 18 0 1 0 17 33" strokeWidth="3.6" />
      {/* Arrowhead */}
      <path d="M11 25.5l6 7.5 7.5-6" strokeWidth="3.6" />
    </svg>
  );
}

interface QuickAction {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const quickActions: QuickAction[] = [
  {
    title: "Make Payments",
    href: "/transfer",
    icon: MakePaymentsIcon,
  },
  {
    title: "Vault & Cards",
    href: "/accounts",
    icon: VaultCardsIcon,
  },
  {
    title: "Savings & Loans",
    href: "/savings",
    icon: SavingsLoansIcon,
  },
  {
    title: "Activities",
    href: "/transaction",
    icon: ActivitiesIcon,
  },
];

export function QuickActions() {
  return (
    <section aria-label="Quick Actions" className="w-full">
      {/* ── 4 Action Buttons Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2.3px]">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-sm border border-paper-300 bg-paper-50 p-4 sm:p-5 min-h-[108px] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-ink-900 hover:border-ink-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600 focus-visible:ring-offset-2"
            >
              {/* Top Row: Enlarged Icon positioned almost touching the right side border */}
              <div className="flex w-full items-start justify-end -mr-1.5 -mt-1 sm:-mr-2 sm:-mt-1.5">
                <IconComponent className="h-12 w-12 sm:h-14 sm:w-14 text-ink-900 transition-all duration-200 group-hover:text-paper-50 group-hover:scale-105" />
              </div>

              {/* Bottom Row: Enlarged Title with Inverse Color on Hover */}
              <div className="mt-3">
                <h4
                  style={{
                    fontFamily:
                      '"Arial Rounded MT Bold", "Arial Rounded MT", ui-rounded, sans-serif',
                  }}
                  className="text-lg sm:text-xl font-normal tracking-tight text-ink-900 transition-colors duration-200 group-hover:text-paper-50 leading-tight"
                >
                  {action.title}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}


