"use client";

import { PageError } from "@/components/layout/PageError";

export default function PayeesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Payees" title="We couldn't load your payees" reset={reset} />;
}
