"use client";

import { PageError } from "@/components/layout/PageError";

export default function BillsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Pay bills" title="We couldn't load your bills" reset={reset} />;
}
