"use client";

import Link from "next/link";
import {
  CreditCard,
  Wallet,
  PiggyBank,
  Receipt,
  ArrowUpRight,
  ArrowRight,
  LucideIcon,
} from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  railCode: string;
  actionPrompt: string;
  image: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  {
    title: "Make Payment",
    description: "Domestic wires, ACH & instant rails",
    href: "/transfer",
    railCode: "01",
    actionPrompt: "Execute Rail",
    image: "/images/dashboard/actions/make-payment.webp",
    icon: CreditCard,
  },
  {
    title: "Vaults & Cards",
    description: "Multi-currency reserves & debit cards",
    href: "/accounts",
    railCode: "02",
    actionPrompt: "Manage Vaults",
    image: "/images/dashboard/actions/vaults-cards.webp",
    icon: Wallet,
  },
  {
    title: "Savings & Loans",
    description: "High-yield goals & credit facilities",
    href: "/savings",
    railCode: "03",
    actionPrompt: "Manage Yield",
    image: "/images/dashboard/actions/savings-loans.webp",
    icon: PiggyBank,
  },
  {
    title: "Activities",
    description: "Real-time ledger & settled records",
    href: "/transaction",
    railCode: "04",
    actionPrompt: "Inspect Ledger",
    image: "/images/dashboard/actions/activities.webp",
    icon: Receipt,
  },
];

export function QuickActions() {
  return (
    <section aria-labelledby="executive-actions-heading" className="w-full">
      {/* ── Executive Header Bar ── */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-paper-200/80 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
          </span>
          <h3
            id="executive-actions-heading"
            className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink-900"
          >
            Executive Actions
          </h3>
          <span className="hidden sm:inline-block border border-paper-300 bg-paper-100 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-700">
            Direct Rails
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-ink-500">
          <span className="hidden md:inline text-ink-400">INSTANT RAIL EXECUTION</span>
          <span className="hidden md:inline text-paper-300">•</span>
          <span className="font-semibold text-emerald-700">ONLINE</span>
        </div>
      </div>

      {/* ── 4 Executive Action Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-paper-200 bg-white p-4.5 sm:p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-ink-900 hover:shadow-[0_12px_24px_-8px_rgba(20,24,31,0.09)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600 focus-visible:ring-offset-2"
            >
              {/* Top Dynamic Accent Line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px] bg-paper-200 transition-colors duration-300 group-hover:bg-vermilion-600"
                aria-hidden="true"
              />

              {/* Subtle Ambient Hover Gradient */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper-50/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />

              {/* Card Top: 3D Visual Render & Rail Index */}
              <div className="relative z-10 flex w-full items-start justify-between">
                {/* 3D Action Emblem Container with Icon Fallback */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-none border border-paper-200 bg-paper-50/80 p-1 transition-all duration-300 group-hover:border-ink-900 group-hover:bg-white group-hover:scale-105 group-hover:shadow-md">
                  <img
                    src={action.image}
                    alt={action.title}
                    className="h-full w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="hidden h-full w-full items-center justify-center text-ink-800">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                {/* Rail Index Tag & Arrow */}
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-semibold tracking-widest text-ink-400 transition-colors duration-300 group-hover:text-ink-700">
                    {action.railCode}
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center border border-transparent transition-all duration-300 group-hover:border-paper-200 group-hover:bg-paper-50">
                    <ArrowUpRight className="h-3.5 w-3.5 text-ink-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-vermilion-600" />
                  </div>
                </div>
              </div>

              {/* Card Middle: Title & Description */}
              <div className="relative z-10 mt-4">
                <h4 className="font-display text-[15px] sm:text-base font-semibold tracking-tight text-ink-900 transition-colors duration-300 group-hover:text-vermilion-700">
                  {action.title}
                </h4>
                <p className="mt-1 text-xs text-ink-500 line-clamp-1 transition-colors duration-300 group-hover:text-ink-700">
                  {action.description}
                </p>
              </div>

              {/* Card Footer: Micro Action Prompt */}
              <div className="relative z-10 mt-4 border-t border-paper-100 pt-2.5 flex items-center justify-between text-[11px] font-mono text-ink-400 transition-colors duration-300 group-hover:border-paper-200 group-hover:text-ink-700">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 transition-colors duration-300 group-hover:text-vermilion-700">
                  {action.actionPrompt}
                </span>
                <ArrowRight className="h-3 w-3 text-ink-400 opacity-60 transition-all duration-300 group-hover:translate-x-1 group-hover:text-vermilion-600 group-hover:opacity-100" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
