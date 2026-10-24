"use client";

import { PageError } from "@/components/layout/PageError";

export default function AccountDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Account details" title="We couldn't load this account" reset={reset} />;
}
