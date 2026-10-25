/**
 * Relationship tiers staff can give a customer (User.tier). A tier is a
 * label only: no perks, rates or fees hang off it, because the bank publishes
 * none. Staff set it at online banking setup or on the customer's profile.
 */
export const CUSTOMER_TIERS = ['BASIC', 'PREMIER', 'PRIVATE_VAULT', 'WORLD_ELITE'] as const;
export type CustomerTier = (typeof CUSTOMER_TIERS)[number];

export const DEFAULT_TIER: CustomerTier = 'BASIC';

/** "PRIVATE_VAULT" → "Private vault". */
export function tierLabel(tier: string): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase().replace(/_/g, ' ');
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
