/** "2026-08" → "August 2026" (falls back to the raw value if it isn't YYYY-MM). */
export function periodLabel(period: string, locale = "en-US") {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return period;
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1)),
  );
}

/** First and last calendar day of a YYYY-MM period, as YYYY-MM-DD. */
export function periodRange(period: string): { from: string; to: string } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { from: `${m[1]}-${m[2]}-01`, to: `${m[1]}-${m[2]}-${String(last).padStart(2, "0")}` };
}
