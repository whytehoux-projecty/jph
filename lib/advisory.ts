/** Topics a customer can ask to discuss with their relationship team. */
export const ADVISORY_TOPICS = [
  'Investments and portfolio',
  'Retirement planning',
  'Estate and trust planning',
  'Borrowing and mortgages',
  'Business banking',
  'Something else',
] as const;

export type AdvisoryFormat = 'PHONE' | 'VIDEO' | 'IN_PERSON';

export const ADVISORY_FORMATS: Record<AdvisoryFormat, string> = {
  PHONE: 'Phone call',
  VIDEO: 'Video call',
  IN_PERSON: 'In person',
};
