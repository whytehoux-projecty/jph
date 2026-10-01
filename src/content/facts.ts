/**
 * Heritage Trust Bank, N.A. — Facts Module
 * ─────────────────────────────────────────
 * Single source of truth for every number, brand string, rate and claim
 * shown to site visitors. Do not hard-code any of these values in JSX.
 *
 * Rules:
 * - yearsOfService() is always computed — never hard-code "138 years".
 * - All figures shown to visitors come from FACTS or RATES.
 * - Contact details come from BRAND.
 * - Domain is a placeholder until the owner confirms the real domain.
 */

export const BRAND = {
  /** Full legal name — footer only */
  legalName: 'Heritage Trust Bank, N.A.',
  /** Short name — header, page titles */
  shortName: 'Heritage Trust',
  /** Online-banking product name — the only thing "Vault" refers to */
  vault: 'Heritage Vault',
  /** Placeholder domain — confirm with owner (see OPEN_QUESTIONS Q1) */
  domain: 'heritagetrust.com',
  /** Fictional phone: 1-800-HERITAG */
  phoneDisplay: '1-800-437-4824',
  phoneTel: '+18004374824',
  /** Support email — uses placeholder domain */
  email: 'support@heritagetrust.com',
  /** Privacy email */
  privacyEmail: 'privacy@heritagetrust.com',
  /** Legal email */
  legalEmail: 'legal@heritagetrust.com',
  /** Head-office address */
  address: '1 Heritage Plaza, New York, NY 10005',
  /** Year of founding */
  founded: 1888,
  /** Routing number (fictional, for display/realism) */
  routing: '021000089',
  /** FDIC fine print */
  fdic: 'Heritage Trust Bank, N.A. Member FDIC. Equal Housing Lender.',
  /** Fictional national charter line */
  charter: 'National Bank Charter No. 4274, issued 1888.',
} as const;

/**
 * Computed years of service — always current.
 * 2026 → 138, 2027 → 139, etc.
 */
export const yearsOfService = (): number =>
  new Date().getFullYear() - BRAND.founded;

export const FACTS = {
  /** Total assets under management */
  assets: '$48B+',
  /** Total client count */
  clients: '2.4M+',
  /** States with presence */
  states: 38,
  /** Physical branch count */
  branches: '200+',
  /** ATM network size (surcharge-free) */
  atms: '55,000+',
  /** Employee count */
  employees: '3,200+',
  /**
   * Assets added through acquisitions — a subset of total assets.
   * Use this when describing acquisitions; never as the overall AUM.
   */
  acquiredAssets: '$2B+',
} as const;

export const RATES = {
  /** Date rates were last updated — show on every page that mentions a rate */
  asOf: '1 October 2026',
  /** Heritage Checking APY */
  checkingApy: '0.30%',
  /** Heritage Savings APY */
  savingsApy: '4.85%',
  /** Heritage Rewards Visa® unlimited cash back rate */
  cardCashback: '2.5%',
  /** Heritage Rewards Visa® regular APR range (required disclosure) */
  cardRegularApr: '19.99%–29.99% APR',
  /** Introductory APR period */
  cardIntroApr: '0% intro APR for 15 months',
  /** Personal loan starting rate */
  personalLoanFrom: '6.49% APR',
  /** Business checking base APY */
  businessCheckingApy: '0.10%',
} as const;

/**
 * Acquisitions only — not "partnerships".
 * Describe these as "acquired" not "partnered with" or "united".
 */
export const ACQUISITIONS = [
  { name: 'Hudson Savings & Loan', year: 2023 },
  { name: 'Colonial Financial Services', year: 2024 },
  { name: 'Liberty Savings & Loan', year: 2025 },
] as const;

/**
 * Product catalogue — one canonical list.
 * Do not add product names outside this list in JSX.
 */
export const PRODUCTS = {
  personal: [
    { slug: 'checking', name: 'Heritage Checking', path: '/products/checking' },
    { slug: 'savings', name: 'Heritage Savings', path: '/products/savings' },
    { slug: 'rewards-visa', name: 'Heritage Rewards Visa®', path: '/products/rewards-visa' },
    { slug: 'personal-loan', name: 'Personal Loan', path: '/products/personal-loan' },
    { slug: 'mortgages', name: 'Mortgages', path: '/products/mortgages' },
  ],
  business: [
    { slug: 'business-checking', name: 'Business Checking', path: '/products/business-checking' },
    { slug: 'merchant-services', name: 'Merchant Services', path: '/products/merchant-services' },
    { slug: 'business-lending', name: 'Business Lending', path: '/products/business-lending' },
    { slug: 'payroll', name: 'Payroll', path: '/products/payroll' },
    { slug: 'treasury-management', name: 'Treasury Management', path: '/products/treasury-management' },
  ],
  wealth: [
    { slug: 'private-banking', name: 'Private Banking', path: '/products/private-banking' },
  ],
} as const;

/**
 * Wealth tier names — do not use "White Glove", "Golden Years", etc.
 */
export const WEALTH_TIERS = {
  select: {
    name: 'Heritage Select',
    minimum: '$250,000',
    description: 'Dedicated advisor, priority service, curated investment options.',
  },
  private: {
    name: 'Heritage Private',
    minimum: '$1,000,000',
    description: 'Full wealth management, estate planning, and tax-optimised strategies.',
  },
  ultra: {
    name: 'Heritage Ultra',
    minimum: '$10,000,000',
    description: 'Bespoke family office services, direct deal access, and family governance.',
  },
} as const;
