"use client";

import { PageError } from "@/components/layout/PageError";

export default function SavingsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Savings and loans" title="We couldn't load your savings and loans" reset={reset} />;
}
