"use client";

import { PageError } from "@/components/layout/PageError";

export default function StatementsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Statements" title="We couldn't load your statements" reset={reset} />;
}
