"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Gift } from "lucide-react";

export default function BenefitsClient() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-900">
            Benefits & Rewards
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore rewards, exclusive offers, and lifestyle benefits curated for you.
          </p>
        </div>
      </div>

      <Card className="animate-in fade-in border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-display">
            <Gift className="w-5 h-5 text-vintage-gold" />
            Heritage Benefits
          </CardTitle>
          <CardDescription>
            Explore rewards, exclusive offers, and lifestyle benefits curated for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Travel Rewards */}
          <div className="col-span-1 md:col-span-3 border border-vintage-gold/30 bg-gradient-to-r from-vintage-gold/10 to-transparent rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-vintage-gold text-white p-4 rounded-xl flex-shrink-0">
              <Gift className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Heritage World Elite Rewards</h3>
              <p className="text-neutral-600 mb-4">Earn 3x points on dining and travel. Access 1,300+ airport lounges worldwide with Priority Pass™ and enjoy global concierge services 24/7.</p>
              <button className="px-6 py-2 bg-ink-900 text-white rounded-lg text-sm font-medium hover:bg-ink-800 transition-colors">
                View Credit Cards
              </button>
            </div>
          </div>

          {/* Advisory */}
          <div className="border border-neutral-200 rounded-xl p-5 hover:border-vintage-gold hover:shadow-md transition-all">
            <h3 className="font-semibold text-lg text-ink-900 mb-2">Private Wealth Advisory</h3>
            <p className="text-sm text-neutral-500 mb-4 h-16">Complimentary portfolio review and access to dedicated wealth managers for qualifying accounts.</p>
            <button className="w-full py-2 border border-neutral-300 text-ink-900 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
              Schedule Consultation
            </button>
          </div>

          {/* Fee Waivers */}
          <div className="border border-neutral-200 rounded-xl p-5 hover:border-vintage-gold hover:shadow-md transition-all">
            <h3 className="font-semibold text-lg text-ink-900 mb-2">Global ATM Fee Waivers</h3>
            <p className="text-sm text-neutral-500 mb-4 h-16">We reimburse all out-of-network and international ATM fees automatically at the end of each statement cycle.</p>
            <button className="w-full py-2 border border-neutral-300 text-ink-900 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
              View Terms
            </button>
          </div>

          {/* Lifestyle */}
          <div className="border border-neutral-200 rounded-xl p-5 hover:border-vintage-gold hover:shadow-md transition-all">
            <h3 className="font-semibold text-lg text-ink-900 mb-2">Lifestyle Concierge</h3>
            <p className="text-sm text-neutral-500 mb-4 h-16">Get exclusive access to dining reservations, event tickets, and curated travel experiences.</p>
            <button className="w-full py-2 border border-neutral-300 text-ink-900 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
              Access Concierge
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
