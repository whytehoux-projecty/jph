/**
 * Relationship tiers staff can give a customer (User.tier). A tier is a
 * label only: no perks, rates or fees hang off it, because the bank publishes
 * none. Staff set it at online banking setup or on the customer's profile.
 *
 * Stored values: BASIC (the schema default, shown as "Standard"), PREMIUM and
 * PRIVATE. STANDARD appears in older records from the seed and means the same
 * as BASIC.
 */
export const CUSTOMER_TIERS = ['BASIC', 'PREMIUM', 'PRIVATE'] as const;
export type CustomerTier = (typeof CUSTOMER_TIERS)[number];

export const DEFAULT_TIER: CustomerTier = 'BASIC';

const LABELS: Record<string, string> = {
  BASIC: 'Standard',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  PRIVATE: 'Private client',
};

export function tierLabel(tier: string): string {
  return LABELS[tier] ?? tier.charAt(0) + tier.slice(1).toLowerCase().replace(/_/g, ' ');
}

/** True for the everyday tier, which the portal doesn't call out. */
export function isStandardTier(tier: string | null | undefined): boolean {
  return !tier || tier === 'BASIC' || tier === 'STANDARD';
}

/**
 * Options for a tier picker. A customer's current tier is always included,
 * even if it isn't in the list (older records use other values), so saving a
 * form never changes it silently.
 */
export function tierOptions(current?: string | null): string[] {
  return current && !isCustomerTier(current) ? [current, ...CUSTOMER_TIERS] : [...CUSTOMER_TIERS];
}

export function isCustomerTier(value: unknown): value is CustomerTier {
  return typeof value === 'string' && (CUSTOMER_TIERS as readonly string[]).includes(value);
}
