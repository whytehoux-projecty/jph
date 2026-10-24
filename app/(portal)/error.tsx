"use client";

import { PageError } from "@/components/layout/PageError";

/** Fallback for any signed-in page without its own error.tsx. */
export default function PortalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Something went wrong" title="This page didn't load" reset={reset} />;
}
