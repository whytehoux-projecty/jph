"use client";

import { PageError } from "@/components/layout/PageError";

export default function RelationshipError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Your relationship" title="We couldn't load your relationship details" reset={reset} />;
}
