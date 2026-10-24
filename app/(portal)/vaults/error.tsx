"use client";

import { PageError } from "@/components/layout/PageError";

export default function AccountsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Accounts" title="We couldn't load your accounts" reset={reset} />;
}
