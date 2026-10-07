"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SelectorCard } from "@/components/ui/SelectorCard";
import { BillsIcon, SendIcon } from "@/components/transfer/illustrations";

export default function TransferLanding() {
  const router = useRouter();

  React.useEffect(() => {
    router.prefetch("/transfer/send");
    router.prefetch("/bills");
  }, [router]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-h2 font-bold text-ink-900">Transfers & Pay Bills</h1>
        <p className="max-w-2xl text-body text-ink-700">What would you like to do today?</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <SelectorCard
          size="md"
          layout="stack"
          icon={<SendIcon className="h-8 w-8" />}
          title="Transfers"
          description="Move money between accounts, wire or ACH to another bank, send stablecoins, or pay a friend."
          onClick={() => router.push("/transfer/send")}
        />
        <SelectorCard
          size="md"
          layout="stack"
          icon={<BillsIcon className="h-8 w-8" />}
          title="Pay Bills"
          description="Pay utilities, cards and other providers from one of your accounts."
          onClick={() => router.push("/bills")}
        />
      </div>
    </div>
  );
}
