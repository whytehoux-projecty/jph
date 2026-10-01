/**
 * Heritage Trust Bank — Constants
 *
 * Marketing-facing brand strings are now sourced from `src/content/facts.ts`.
 * The BANK_INFO export below is kept for backward compatibility with portal and
 * admin components that import from this file. Do NOT use these in marketing
 * (corporate) pages — import directly from '@/src/content/facts'.
 */

import { BRAND, yearsOfService } from '@/src/content/facts';

/** @deprecated Use BRAND from '@/src/content/facts' in marketing pages */
export const BANK_INFO = {
    name: BRAND.legalName,
    shortName: BRAND.shortName,
    portalName: BRAND.vault,
    tagline: 'Trusted Since 1888. Built for Tomorrow.',
    founded: BRAND.founded,
    phone: BRAND.phoneTel,
    phoneDisplay: BRAND.phoneDisplay,
    email: BRAND.email,
    address: BRAND.address,
    fdic: BRAND.fdic,
    routing: BRAND.routing,
} as const;

export const ROUTES = {
    home: '/',
    // Corporate marketing
    personalBanking: '/personal-banking',
    businessBanking: '/business-banking',
    wealth: '/wealth',
    about: '/about',
    contact: '/contact',
    apply: '/apply',
    enroll: '/enroll',       // enrollment (formerly /signup)
    signup: '/enroll',       // permanent redirect in vercel.json
    terms: '/terms',
    privacy: '/privacy',
    security: '/security',
    help: '/help',
    status: '/status',
    locations: '/locations',
    ratesAndFees: '/rates-and-fees',
    accessibility: '/accessibility',
    careers: '/careers',
    press: '/press',
    investors: '/investors',
    // Heritage Vault (e-banking portal) routes — do not modify
    vault: '/login',
    login: '/login',
    forgotPassword: '/forgot-password',
    dashboard: '/dashboard',
    transfer: '/transfer',
    transactions: '/transactions',
    accounts: '/accounts',
    cards: '/cards',
    bills: '/bills',
    beneficiaries: '/beneficiaries',
    statements: '/statements',
    settings: '/settings',
    support: '/support',
} as const;

export const ACCOUNT_TYPES = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    credit: 'Credit Card',
    loan: 'Personal Loan',
    wealth: 'Wealth Management',
    business: 'Business Checking',
} as const;

export const TRANSACTION_TYPES = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer: 'Transfer',
    payment: 'Payment',
    fee: 'Fee',
} as const;

export const TRANSACTION_STATUS = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
} as const;

// Re-export for convenience
export { BRAND, yearsOfService };
