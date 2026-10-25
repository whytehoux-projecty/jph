/**
 * Turns an error from a server action into text a customer can read.
 *
 * In production Next.js replaces server-action error messages with a generic
 * notice (and a digest). Showing that to a customer is unhelpful, so it is
 * swapped for the caller's plain-language fallback. Messages written for
 * customers in the actions themselves are passed through.
 */
export function userFacingError(err: unknown, fallback: string): string {
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  if (!message) return fallback;
  if (/Server Components render|omitted in production|digest|NEXT_|fetch failed|Unauthorized/i.test(message)) return fallback;
  return message;
}
