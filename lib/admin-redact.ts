/**
 * Removes sign-in secrets from a customer record before it is sent to an
 * admin page. Staff never need the password or PIN hashes, and a temporary
 * password is never stored readable (see lib/temporary-credentials.ts).
 */
export function withoutCredentials<T extends { password?: unknown; transactionPin?: unknown; temporaryPassword?: unknown }>(
  user: T,
): Omit<T, 'password' | 'transactionPin' | 'temporaryPassword'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, transactionPin, temporaryPassword, ...rest } = user;
  return rest;
}

const SECRET_KEYS = new Set(['password', 'transactionPin', 'temporaryPassword']);

/**
 * The same, at any depth: for query results that include customers inside
 * other records (e.g. transaction → account → user) before they go to a
 * client component. Dates are kept as they are.
 */
export function redactCredentials<T>(value: T): T {
  if (Array.isArray(value)) return value.map(redactCredentials) as T;
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (!SECRET_KEYS.has(k)) out[k] = redactCredentials(v);
    }
    return out as T;
  }
  return value;
}
