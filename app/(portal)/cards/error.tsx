"use client";

import { PageError } from "@/components/layout/PageError";

export default function CardsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Cards" title="We couldn't load your cards" reset={reset} />;
}
