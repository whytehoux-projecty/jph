"use client";

import { PageError } from "@/components/layout/PageError";

export default function SupportError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Help and support" title="We couldn't load help and support" reset={reset} />;
}
