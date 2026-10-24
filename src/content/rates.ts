/**
 * Heritage Trust — rate and fee tables
 * ─────────────────────────────────────
 * One source for every product row shown on the Personal, Business and
 * Rates and fees pages, so a fee can never read differently on two pages.
 * Headline rates come from RATES in facts.ts. Values in [brackets] are
 * placeholders until the bank publishes the figure.
 */

import { RATES } from './facts';

export type ProductRow = {
    product: string;
    href: string;
    description: string;
    rate: string;
    minimum: string;
    monthlyFee: string;
    waiver: string;
};

export const PERSONAL_DEPOSITS: ProductRow[] = [
    {
        product: 'Checking — SafeBalance',
        href: '/personal-banking/checking',
        description: 'Spend only what you have; no overdraft fees',
        rate: '—',
        minimum: '$0',
        monthlyFee: '$4.95',
        waiver: 'Waived for students under 25',
    },
    {
        product: 'Checking — Advantage Plus',
        href: '/personal-banking/checking',
        description: 'Everyday checking with paper checks and Zelle®',
        rate: '—',
        minimum: '$0',
        monthlyFee: '$12.00',
        waiver: 'Waived with one direct deposit of $250 or more',
    },
    {
        product: 'Checking — Relationship',
        href: '/personal-banking/checking',
        description: 'Interest-earning checking with fee-free wires',
        rate: `${RATES.checkingApy} APY`,
        minimum: '$0',
        monthlyFee: '$25.00',
        waiver: 'Waived with $10,000 in combined balances',
    },
    {
        product: 'Heritage Savings',
        href: '/personal-banking/savings',
        description: 'Variable-rate savings with automatic transfers',
        rate: `${RATES.savingsApy} APY`,
        minimum: '$0',
        monthlyFee: '$8.00',
        waiver: 'Waived with a $500 minimum daily balance',
    },
    {
        product: 'Certificates of deposit',
        href: '/personal-banking/savings',
        description: 'Fixed terms from 3 months to 5 years',
        rate: '[0.00]% APY',
        minimum: '$1,000',
        monthlyFee: '$0',
        waiver: '—',
    },
];

export const BUSINESS_DEPOSITS: ProductRow[] = [
    {
        product: 'Business Fundamentals checking',
        href: '/business-banking/checking',
        description: '200 fee-free transactions a month',
        rate: '—',
        minimum: '$0',
        monthlyFee: '$16.00',
        waiver: 'Waived with a $5,000 average monthly balance',
    },
    {
        product: 'Business Advantage checking',
        href: '/business-banking/checking',
        description: '500 fee-free transactions a month',
        rate: `${RATES.businessCheckingApy} APY`,
        minimum: '$0',
        monthlyFee: '$29.95',
        waiver: 'Waived with a $15,000 average monthly balance',
    },
    {
        product: 'Business Advantage savings',
        href: '/business-banking/savings',
        description: 'Reserves beside your operating account',
        rate: '[0.00]% APY',
        minimum: '$0',
        monthlyFee: '$10.00',
        waiver: 'Waived with a $2,500 minimum daily balance',
    },
    {
        product: 'Business CDs',
        href: '/business-banking/savings',
        description: 'Fixed terms from 3 months to 5 years',
        rate: '[0.00]% APY',
        minimum: '[$0,000]',
        monthlyFee: '$0',
        waiver: '—',
    },
];

export const CREDIT_AND_LOANS = [
    {
        product: 'Heritage Rewards Visa®',
        href: '/personal-banking/credit-cards',
        description: `${RATES.cardCashback} unlimited cash back; $0 annual fee`,
        rate: RATES.cardRegularApr,
        terms: `${RATES.cardIntroApr}, then variable APR`,
    },
    {
        product: 'Personal loan',
        href: '/personal-banking/loans',
        description: '$2,000 to $50,000; no origination fee',
        rate: `From ${RATES.personalLoanFrom}`,
        terms: '12 to 84 months',
    },
    {
        product: 'Auto loan',
        href: '/personal-banking/loans',
        description: 'New and used vehicles up to 10 years old',
        rate: 'From 5.49% APR',
        terms: 'Rate lock for 30 days',
    },
    {
        product: 'Mortgages and home equity',
        href: '/personal-banking/loans',
        description: 'Fixed, adjustable, FHA, VA and jumbo',
        rate: 'Quoted on application',
        terms: 'Speak with a lending specialist',
    },
] as const;

export const SERVICE_FEES = [
    { service: 'Overdraft item', fee: '$35.00', note: 'Not charged on SafeBalance' },
    { service: 'Domestic wire, outgoing', fee: '$15.00', note: 'Free on Relationship checking' },
    { service: 'International wire, outgoing', fee: '[$00.00]', note: 'Plus any correspondent bank charges' },
    { service: 'Incoming wire', fee: '[$0.00]', note: '' },
    { service: 'Stop payment', fee: '[$00.00]', note: '' },
    { service: 'Replacement debit card', fee: '$0', note: 'Expedited delivery [$00.00]' },
] as const;
