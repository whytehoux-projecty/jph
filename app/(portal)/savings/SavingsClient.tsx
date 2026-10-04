"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { PiggyBank, HandCoins, Gift } from "lucide-react";

export default function SavingsClient({ userPreferences }: { userPreferences?: any }) {
  const [activeTab, setActiveTab] = useState("savings");

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-900">
            Savings, Loans & Benefits
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your savings goals, apply for loans, and discover benefits.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full mb-6">
          <TabsList className="w-full md:w-auto inline-flex p-1 bg-slate-100 rounded-lg">
            <TabsTrigger value="savings" className="px-6 py-2.5 capitalize text-sm font-medium">Savings</TabsTrigger>
            <TabsTrigger value="loans" className="px-6 py-2.5 capitalize text-sm font-medium">Loans</TabsTrigger>
            <TabsTrigger value="benefits" className="px-6 py-2.5 capitalize text-sm font-medium">Benefits</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="savings" className="m-0">
          <Card className="animate-in fade-in border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-display">
                <PiggyBank className="w-5 h-5 text-vintage-gold" />
                Savings Products
              </CardTitle>
              <CardDescription>
                Grow your wealth with tailored savings accounts and term deposits.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* High-Yield Savings */}
              <div className="border border-neutral-200 rounded-xl p-5 hover:border-vintage-gold hover:shadow-md transition-all">
                <h3 className="font-semibold text-lg text-ink-900 mb-2">High-Yield Savings</h3>
                <p className="text-sm text-neutral-500 mb-4 h-10">Maximize your returns with our industry-leading APY and zero monthly maintenance fees.</p>
                <div className="bg-neutral-50 p-3 rounded-lg mb-4 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-neutral-500">Current APY</span>
                  <span className="text-lg font-bold text-vintage-gold">4.25%</span>
                </div>
                <button className="w-full py-2 bg-ink-900 text-white rounded-lg text-sm font-medium hover:bg-ink-800 transition-colors">
                  Open Account
                </button>
              </div>
              
              {/* Certificates of Deposit */}
              <div className="border border-neutral-200 rounded-xl p-5 hover:border-vintage-gold hover:shadow-md transition-all">
                <h3 className="font-semibold text-lg text-ink-900 mb-2">Certificates of Deposit (CD)</h3>
                <p className="text-sm text-neutral-500 mb-4 h-10">Lock in a guaranteed rate for a fixed term to reach your long-term savings goals.</p>
                <div className="bg-neutral-50 p-3 rounded-lg mb-4 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-neutral-500">Terms up to</span>
                  <span className="text-lg font-bold text-vintage-gold">60 Months</span>
                </div>
                <button className="w-full py-2 border border-neutral-300 text-ink-900 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                  View CD Rates
                </button>
              </div>

              {/* Money Market */}
              <div className="border border-neutral-200 rounded-xl p-5 hover:border-vintage-gold hover:shadow-md transition-all">
                <h3 className="font-semibold text-lg text-ink-900 mb-2">Money Market</h3>
                <p className="text-sm text-neutral-500 mb-4 h-10">Higher balances earn higher yields, with check-writing privileges.</p>
                <div className="bg-neutral-50 p-3 rounded-lg mb-4 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-neutral-500">Min. Balance</span>
                  <span className="text-lg font-bold text-vintage-gold">$10,000</span>
                </div>
                <button className="w-full py-2 border border-neutral-300 text-ink-900 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                  Learn More
                </button>
              </div>

              {/* Wealth Builder */}
              <div className="border border-vintage-gold bg-vintage-gold/5 rounded-xl p-5 hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-vintage-gold text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg">Popular</div>
                <h3 className="font-semibold text-lg text-ink-900 mb-2">Wealth Builder</h3>
                <p className="text-sm text-neutral-600 mb-4 h-10">Automated investing combined with high-yield cash sweep options.</p>
                <div className="bg-white p-3 rounded-lg mb-4 flex justify-between items-center border border-neutral-100">
                  <span className="text-xs font-semibold uppercase text-neutral-500">Advisory Fee</span>
                  <span className="text-lg font-bold text-vintage-gold">0.25%</span>
                </div>
                <button className="w-full py-2 bg-vintage-gold text-white rounded-lg text-sm font-medium hover:bg-vintage-gold/90 transition-colors">
                  Start Investing
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="m-0">
          <Card className="animate-in fade-in border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-display">
                <HandCoins className="w-5 h-5 text-vintage-gold" />
                Lending Solutions
              </CardTitle>
              <CardDescription>
                Access funds for your personal or business needs with competitive rates.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Loan */}
              <div className="border border-neutral-200 rounded-xl p-5 hover:border-vintage-gold hover:shadow-md transition-all">
                <h3 className="font-semibold text-lg text-ink-900 mb-2">Personal Loans</h3>
                <p className="text-sm text-neutral-500 mb-4 h-10">Unsecured loans for debt consolidation, home improvement, or unexpected expenses.</p>
                <div className="bg-neutral-50 p-3 rounded-lg mb-4 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-neutral-500">Rates as low as</span>
                  <span className="text-lg font-bold text-vintage-gold">6.99% <span className="text-xs font-normal text-neutral-500">APR</span></span>
                </div>
                <button className="w-full py-2 bg-ink-900 text-white rounded-lg text-sm font-medium hover:bg-ink-800 transition-colors">
                  Check Your Rate
                </button>
              </div>

              {/* Auto Loan */}
              <div className="border border-neutral-200 rounded-xl p-5 hover:border-vintage-gold hover:shadow-md transition-all">
                <h3 className="font-semibold text-lg text-ink-900 mb-2">Auto Loans</h3>
                <p className="text-sm text-neutral-500 mb-4 h-10">Finance a new or used vehicle with flexible terms up to 84 months.</p>
                <div className="bg-neutral-50 p-3 rounded-lg mb-4 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-neutral-500">Rates as low as</span>
                  <span className="text-lg font-bold text-vintage-gold">4.99% <span className="text-xs font-normal text-neutral-500">APR</span></span>
                </div>
                <button className="w-full py-2 border border-neutral-300 text-ink-900 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                  Apply for Auto Loan
                </button>
              </div>

              {/* Mortgage */}
              <div className="border border-neutral-200 rounded-xl p-5 hover:border-vintage-gold hover:shadow-md transition-all">
                <h3 className="font-semibold text-lg text-ink-900 mb-2">Mortgages</h3>
                <p className="text-sm text-neutral-500 mb-4 h-10">Fixed and adjustable-rate mortgages to help you secure your dream home.</p>
                <div className="bg-neutral-50 p-3 rounded-lg mb-4 flex flex-col justify-center">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase text-neutral-500">30-Year Fixed</span>
                    <span className="text-base font-bold text-vintage-gold">6.25% <span className="text-[10px] font-normal text-neutral-500">APR</span></span>
                  </div>
                </div>
                <button className="w-full py-2 border border-neutral-300 text-ink-900 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                  Explore Mortgages
                </button>
              </div>

              {/* Home Equity */}
              <div className="border border-neutral-200 rounded-xl p-5 hover:border-vintage-gold hover:shadow-md transition-all">
                <h3 className="font-semibold text-lg text-ink-900 mb-2">Home Equity (HELOC)</h3>
                <p className="text-sm text-neutral-500 mb-4 h-10">Leverage your home's equity for major purchases with a flexible credit line.</p>
                <div className="bg-neutral-50 p-3 rounded-lg mb-4 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-neutral-500">Intro Rate</span>
                  <span className="text-lg font-bold text-vintage-gold">5.99% <span className="text-xs font-normal text-neutral-500">APR</span></span>
                </div>
                <button className="w-full py-2 border border-neutral-300 text-ink-900 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                  Learn More
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="m-0">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
