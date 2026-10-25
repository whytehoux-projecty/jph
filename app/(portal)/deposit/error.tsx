"use client";

import { PageError } from "@/components/layout/PageError";

export default function DepositError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Deposit and withdraw" title="We couldn't load your deposit options" reset={reset} />;
}
