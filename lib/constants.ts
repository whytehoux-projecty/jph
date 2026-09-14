/**
 * JP Heritage Bank — Constants
 * Central location for all application constants
 */

export const BANK_INFO = {
    name: 'JP Heritage Bank',
    shortName: 'JP Heritage',
    portalName: 'Heritage Vault',
    tagline: 'Trusted for Generations. Built for Tomorrow.',
    founded: 1888,
    phone: '1-800-574-3748',
    phoneDisplay: '1-800-JPH-ERIT',
    email: 'support@jpheritage.com',
    address: '1 Heritage Plaza, New York, NY 10005',
    fdic: 'Member FDIC. Equal Housing Lender.',
    routing: '021000089',
} as const;

export const ROUTES = {
    home: '/',
    personalBanking: '/personal-banking',
    businessBanking: '/business-banking',
    about: '/about',
    contact: '/contact',
    apply: '/apply',
    signup: '/signup',
    terms: '/terms',
    privacy: '/privacy',
    // Heritage Vault (e-banking portal) routes
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
