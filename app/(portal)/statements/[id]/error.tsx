"use client";

import { PageError } from "@/components/layout/PageError";

export default function StatementError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Statements" title="We couldn't load this statement" reset={reset} />;
}
