"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { UpcomingBillsWidget, CreditScoreWidget } from "@/components/dashboard/RightSidebarWidgets";
import { Card } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardIntelligenceSidebarProps {
  user?: any;
}

export function DashboardIntelligenceSidebar({ user }: DashboardIntelligenceSidebarProps) {
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "JD";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "Valued Client";
  const memberId = user?.id
    ? (user.id.length > 8 ? user.id.slice(-8).toUpperCase() : user.id)
    : "8801-9421";
  const tier = user?.tier ? `${user.tier} Member` : "Private Client";

  return (
    <div className="space-y-4">
      {/* 1. Private Client Relationship & Concierge Card */}
      <Card className="rounded-sm border border-paper-200 bg-white p-5 shadow-none">
        <div className="flex items-center justify-between border-b border-paper-200/80 pb-3.5 mb-3.5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-sm border border-paper-200 bg-paper-100">
              <AvatarImage src={user?.profilePhotoUrl || ""} alt={fullName} />
              <AvatarFallback className="font-display font-semibold text-xs text-ink-900 bg-paper-100">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-semibold text-ink-900 leading-tight">
                {fullName}
              </h4>
              <p className="text-[11px] font-mono text-ink-500 uppercase tracking-wider mt-0.5">
                ID: HTB-{memberId}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-sm border border-paper-200 bg-paper-50 px-2 py-0.5 text-[10px] font-mono font-medium text-ink-700">
            <Sparkles className="h-2.5 w-2.5 text-vermilion-600" />
            {tier}
          </span>
        </div>

        {/* Dedicated Relationship Manager */}
        <div className="rounded-sm border border-paper-200/70 bg-paper-50/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500 font-medium">
              Private Client Advisory
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Available
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-900">Eleanor Vance, CFA</p>
            <p className="text-[11px] text-ink-500">VP, Private Client Advisory</p>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-paper-200/60">
            <a
              href="tel:18004374824"
              className="inline-flex items-center gap-1 rounded-sm border border-paper-200 bg-white px-2 py-0.5 text-[11px] font-medium text-ink-700 hover:text-ink-900 hover:bg-paper-100 transition-colors"
            >
              <Phone className="h-3 w-3 text-ink-500" />
              Direct Line
            </a>
            <Link
              href="/support"
              className="inline-flex items-center gap-1 rounded-sm border border-paper-200 bg-white px-2 py-0.5 text-[11px] font-medium text-ink-700 hover:text-ink-900 hover:bg-paper-100 transition-colors"
            >
              <Mail className="h-3 w-3 text-ink-500" />
              Secure Dispatch
            </Link>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-paper-200/80 text-ink-500">
          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
            <Lock className="h-3 w-3 text-emerald-600" />
            PIN & 2FA Active
          </span>
          <Link
            href="/settings"
            className="font-medium text-vermilion-600 hover:underline inline-flex items-center gap-0.5 text-xs"
          >
            Settings <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </Card>

      {/* 2. Credit & Liquidity Health */}
      <CreditScoreWidget />

      {/* 3. Upcoming Obligations & Bills */}
      <UpcomingBillsWidget />
    </div>
  );
}
