"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Gift, Shield, Compass, Sparkles, Plane, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BenefitsClient() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink-900 tracking-tight">
            Benefits & Rewards
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Exclusive privileges, lifestyle rewards, and relationship benefits curated for private banking clients.
          </p>
        </div>
      </div>

      {/* Main Feature Highlight */}
      <div className="relative overflow-hidden rounded-sm border border-paper-200 bg-paper-50 p-6 sm:p-8">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-vermilion-600" />
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-sm bg-ink-900 text-paper-50 flex items-center justify-center shrink-0">
              <Gift className="h-6 w-6 text-paper-50" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-paper-200 text-ink-700 text-[11px] font-mono uppercase tracking-wider mb-2">
                <Sparkles className="h-3 w-3 text-vermilion-600" />
                Featured Tier Privilege
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink-900 mb-1">
                Heritage World Elite Rewards Program
              </h2>
              <p className="text-sm text-ink-600 max-w-2xl leading-relaxed">
                Earn unlimited 3x relationship points across worldwide dining and travel. Enjoy complimentary lounge access at 1,300+ international airports via Priority Pass™ and bespoke round-the-clock concierge support.
              </p>
            </div>
          </div>
          <Link
            href="/cards"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-ink-900 text-paper-50 text-sm font-semibold hover:bg-ink-800 transition-colors"
          >
            Manage Cards
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Grid of Privileges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Advisory */}
        <div className="relative flex flex-col justify-between rounded-sm border border-paper-200 bg-paper-50 p-5 hover:border-ink-900/40 hover:bg-white transition-all">
          <div>
            <div className="h-10 w-10 rounded-sm bg-paper-200/80 flex items-center justify-center mb-4 text-ink-900">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-ink-900 mb-1">
              Private Wealth Advisory
            </h3>
            <p className="text-xs text-ink-500 leading-relaxed">
              Complimentary annual portfolio review, fiduciary tax strategy consultations, and dedicated wealth director access.
            </p>
          </div>
          <Link
            href="/support"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-900 hover:text-vermilion-700 transition-colors"
          >
            Schedule Consultation
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Global ATM Waivers */}
        <div className="relative flex flex-col justify-between rounded-sm border border-paper-200 bg-paper-50 p-5 hover:border-ink-900/40 hover:bg-white transition-all">
          <div>
            <div className="h-10 w-10 rounded-sm bg-paper-200/80 flex items-center justify-center mb-4 text-ink-900">
              <Plane className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-ink-900 mb-1">
              Global ATM & FX Fee Waivers
            </h3>
            <p className="text-xs text-ink-500 leading-relaxed">
              Automatic monthly statement reimbursement for all out-of-network and international ATM surcharges with zero foreign transaction fees.
            </p>
          </div>
          <span className="mt-6 inline-block text-[11px] font-mono text-emerald-700 font-semibold uppercase">
            Active on your accounts
          </span>
        </div>

        {/* Lifestyle Concierge */}
        <div className="relative flex flex-col justify-between rounded-sm border border-paper-200 bg-paper-50 p-5 hover:border-ink-900/40 hover:bg-white transition-all">
          <div>
            <div className="h-10 w-10 rounded-sm bg-paper-200/80 flex items-center justify-center mb-4 text-ink-900">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-ink-900 mb-1">
              Lifestyle & Dining Concierge
            </h3>
            <p className="text-xs text-ink-500 leading-relaxed">
              Direct access to reserved seating at Michelin-starred restaurants, premier event hospitality suites, and bespoke travel bookings.
            </p>
          </div>
          <Link
            href="/support"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-900 hover:text-vermilion-700 transition-colors"
          >
            Access Concierge Desk
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
