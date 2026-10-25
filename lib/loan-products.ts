import { CREDIT_AND_LOANS } from '@/src/content/rates';
import type { LoanMethodsOverrides } from '@/lib/feature-overrides';

/**
 * Loans a customer can apply for in the portal. Rates and terms are the
 * bank's published figures (src/content/rates.ts, also shown on the Rates and
 * fees page), so the portal can never quote something different. Every
 * application goes to staff; nothing here is an offer or a decision.
 */
export interface LoanProduct {
  id: 'personal-loan' | 'auto-loan' | 'mortgage-loan';
  /** The admin permission that turns this product on or off for a customer. */
  permission: keyof LoanMethodsOverrides;
  name: string;
  rate: string;
  terms: string;
  description: string;
  /** Learn-more page on the commercial site. */
  href: string;
  /** Published limits, where the bank publishes them. */
  minAmount?: number;
  maxAmount?: number;
}

const published = (product: string) => {
  const row = CREDIT_AND_LOANS.find((r) => r.product === product);
  if (!row) throw new Error(`Published rates have no "${product}" row`);
  return row;
};

const personal = published('Personal loan');
const auto = published('Auto loan');
const mortgage = published('Mortgages and home equity');

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'personal-loan',
    permission: 'personal',
    name: 'Personal loan',
    rate: personal.rate,
    terms: personal.terms,
    description: personal.description,
    href: personal.href,
    // "$2,000 to $50,000" in the published description.
    minAmount: 2000,
    maxAmount: 50000,
  },
  {
    id: 'auto-loan',
    permission: 'auto',
    name: 'Auto loan',
    rate: auto.rate,
    terms: auto.terms,
    description: auto.description,
    href: auto.href,
  },
  {
    id: 'mortgage-loan',
    permission: 'mortgage',
    name: 'Mortgage or home equity',
    rate: mortgage.rate,
    terms: mortgage.terms,
    description: mortgage.description,
    href: mortgage.href,
  },
];

export function loanProduct(id: string): LoanProduct | undefined {
  return LOAN_PRODUCTS.find((p) => p.id === id);
}
