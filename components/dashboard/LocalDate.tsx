"use client";

import { useEffect, useState } from "react";

/**
 * Formats a timestamp in the customer's own time zone. The server renders the
 * ISO date (stable, no hydration mismatch); the browser then swaps in the
 * local, human form.
 */
export function LocalDate({ iso, locale = "en-US" }: { iso: string; locale?: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    if (same(d, today)) setText("Today");
    else if (same(d, yesterday)) setText("Yesterday");
    else
      setText(
        new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
        }).format(d),
      );
  }, [iso, locale]);

  return <time dateTime={iso}>{text ?? iso.slice(0, 10)}</time>;
}
