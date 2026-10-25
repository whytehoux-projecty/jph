"use client";

import { PageError } from "@/components/layout/PageError";

export default function SettingsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Settings" title="We couldn't load your settings" reset={reset} />;
}
