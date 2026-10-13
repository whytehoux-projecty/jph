"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SelectorCard } from "@/components/ui/SelectorCard";
import { VaultsIcon, CardsIcon } from "./illustrations";

export default function VaultsLanding() {
  const router = useRouter();

  React.useEffect(() => {
    router.prefetch("/vaults/accounts");
    router.prefetch("/cards");
  }, [router]);

  return (
    <div className="mx-auto w-full max-w-5xl rounded-sm border border-paper-300 bg-white shadow-sm overflow-hidden">
      <header className="border-b border-paper-300 bg-paper-100 p-6 sm:p-8 space-y-2">
        <h1 className="font-display text-h2 font-bold text-ink-900">Vaults & Cards</h1>
        <p className="max-w-2xl text-body text-ink-700">What would you like to do today?</p>
      </header>

      <div className="p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <SelectorCard
            size="md"
            layout="row"
            icon={<VaultsIcon className="h-8 w-8" />}
            title="Vaults"
            description="Manage checking, high-yield savings, digital assets, and offshore treasury reserves."
            onClick={() => router.push("/vaults/accounts")}
          />
          <SelectorCard
            size="md"
            layout="row"
            icon={<CardsIcon className="h-8 w-8" />}
            title="Cards"
            description="Review active debit and credit cards, adjust spending limits, or apply for new cards."
            onClick={() => router.push("/cards")}
          />
        </div>
      </div>
    </div>
  );
}
