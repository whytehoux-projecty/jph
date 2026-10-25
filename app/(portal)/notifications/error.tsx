"use client";

import { PageError } from "@/components/layout/PageError";

export default function NotificationsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError pageTitle="Notifications" title="We couldn't load your notifications" reset={reset} />;
}
