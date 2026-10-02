"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Lock,
  Building,
  Cpu,
  Shield,
  Fingerprint
} from "lucide-react";
import { UpcomingBillsWidget, CreditScoreWidget } from "@/components/dashboard/RightSidebarWidgets";
import { Card } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardIntelligenceSidebarProps {
  user?: any;
}

function SecurityTrustBadges() {
  return (
    <div className="mt-6 pt-4 border-t border-paper-200/80 space-y-3 pb-2">
      <h5 className="text-[10px] font-mono text-ink-500 uppercase tracking-widest px-1">Security & Trust Protocol</h5>
      <div className="grid grid-cols-2 gap-2">
        
        {/* FDIC Member */}
        <div className="flex flex-col items-center justify-center p-3 rounded-sm border border-paper-200 bg-paper-50 hover:border-paper-300 transition-colors group text-center">
          <Building className="h-4 w-4 text-ink-400 group-hover:text-ink-600 mb-1.5 transition-colors" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-ink-800">FDIC Member</span>
          <span className="text-[8px] text-ink-400 font-mono mt-0.5">Cert #34291</span>
        </div>

        {/* 256-bit Encryption */}
        <div className="flex flex-col items-center justify-center p-3 rounded-sm border border-paper-200 bg-paper-50 hover:border-paper-300 transition-colors group text-center">
          <Lock className="h-4 w-4 text-emerald-600/70 group-hover:text-emerald-600 mb-1.5 transition-colors" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-ink-800">AES-256</span>
          <span className="text-[8px] text-ink-400 font-mono mt-0.5">End-to-End</span>
        </div>

        {/* AI Vault */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-sm border border-paper-200 bg-paper-50 hover:border-paper-300 transition-colors group text-center col-span-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Cpu className="h-3.5 w-3.5 text-vermilion-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-900">AI Vault Standard™</span>
          </div>
          <span className="text-[9px] text-ink-500">Continuous anomaly detection & threat prevention</span>
        </div>

        {/* Zero Liability */}
        <div className="flex flex-col items-center justify-center p-3 rounded-sm border border-paper-200 bg-paper-50 hover:border-paper-300 transition-colors group text-center">
          <Shield className="h-4 w-4 text-blue-500/70 group-hover:text-blue-500 mb-1.5 transition-colors" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-ink-800">Zero Liability</span>
          <span className="text-[8px] text-ink-400 font-mono mt-0.5">Fraud Protection</span>
        </div>

        {/* Biometrics */}
        <div className="flex flex-col items-center justify-center p-3 rounded-sm border border-paper-200 bg-paper-50 hover:border-paper-300 transition-colors group text-center">
          <Fingerprint className="h-4 w-4 text-purple-500/70 group-hover:text-purple-500 mb-1.5 transition-colors" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-ink-800">Biometric</span>
          <span className="text-[8px] text-ink-400 font-mono mt-0.5">Hardware Auth</span>
        </div>

      </div>
    </div>
  );
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
      <Card className="rounded-sm border border-paper-200 bg-paper-50 p-5 shadow-none">
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
              className="inline-flex items-center gap-1 rounded-sm border border-paper-200 bg-paper-50 px-2 py-0.5 text-[11px] font-medium text-ink-700 hover:text-ink-900 hover:bg-paper-100 transition-colors"
            >
              <Phone className="h-3 w-3 text-ink-500" />
              Direct Line
            </a>
            <Link
              href="/support"
              className="inline-flex items-center gap-1 rounded-sm border border-paper-200 bg-paper-50 px-2 py-0.5 text-[11px] font-medium text-ink-700 hover:text-ink-900 hover:bg-paper-100 transition-colors"
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

      {/* 4. Security & Trust Badges */}
      <SecurityTrustBadges />
    </div>
  );
}
