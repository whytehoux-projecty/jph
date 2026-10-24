"use client";

import { PageError } from "@/components/layout/PageError";

export default function ActivityError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Activity" title="We couldn't load your transactions" reset={reset} />;
}
