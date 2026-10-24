"use client";

import { PageError } from "@/components/layout/PageError";

/** Shown when the dashboard's data can't be loaded. Nothing is guessed. */
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Overview" title="We couldn't load your accounts" reset={reset} />;
}
