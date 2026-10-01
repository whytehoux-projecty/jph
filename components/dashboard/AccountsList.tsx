"use client";

import Link from "next/link";
import { Wallet, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { formatCurrency, languageToLocale } from "@/lib/utils";
import { VintageIcon } from "@/components/ui/vintage-icon";

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  balance: number;
  status: string;
}

export function AccountsList({ accounts, language = "en" }: { accounts: Account[], language?: string }) {
  if (!accounts || accounts.length === 0) {
    return (
      <Card className="h-full border border-(--ink-900)/10 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>No active accounts found.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <VintageIcon icon={Wallet} variant="ink-900" size="lg" className="mb-4" />
          <p className="text-sm text-muted-foreground mb-4">Open an account to get started.</p>
          <Link href="/apply" className="text-sm font-medium text-(--heritage-gold) hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ink-900) rounded-md px-1">
            Apply Now
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-(--ink-900)/10 bg-white shadow-sm hover-lift">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>Quick overview of your balances</CardDescription>
        </div>
        <Link href="/accounts" className="text-sm font-medium text-(--heritage-gold) hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ink-900) rounded-md px-1">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => {
            const maskedNumber = `•••• ${account.accountNumber.slice(-4)}`;
            return (
              <Link
                key={account.id}
                href={`/accounts/${account.id}`}
                className="group flex items-center justify-between rounded-lg border border-transparent hover:bg-muted/50 p-2 -mx-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ink-900)"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--ink-900)/5 text-(--ink-900) group-hover:bg-(--ink-900)/10 transition-colors">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-(--ink-900)">
                      {account.accountType.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {maskedNumber}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-(--ink-900) font-inter tabular-nums lining-nums">
                    {formatCurrency(account.balance, account.currency, languageToLocale(language))}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
