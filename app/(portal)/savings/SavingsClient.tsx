"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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

      <div className="w-full mb-6">
        <SegmentedControl
          options={["savings", "loans", "benefits"]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === "savings" && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5" />
              Savings
            </CardTitle>
            <CardDescription>
              Grow your wealth with tailored savings accounts and term deposits.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-100 bg-slate-50">
            <p className="text-slate-500 font-medium">Coming Soon</p>
          </CardContent>
        </Card>
      )}

      {activeTab === "loans" && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="w-5 h-5" />
              Loans
            </CardTitle>
            <CardDescription>
              Access funds for your personal or business needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-100 bg-slate-50">
            <p className="text-slate-500 font-medium">Coming Soon</p>
          </CardContent>
        </Card>
      )}

      {activeTab === "benefits" && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Benefits
            </CardTitle>
            <CardDescription>
              Explore rewards, exclusive offers, and lifestyle benefits.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-100 bg-slate-50">
            <p className="text-slate-500 font-medium">Coming Soon</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
