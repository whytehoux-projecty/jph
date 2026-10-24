import type { Metadata } from 'next';
import { ROUTES } from '@/lib/constants';
import { RATES } from '@/src/content/facts';
import { PERSONAL_DEPOSITS, BUSINESS_DEPOSITS, CREDIT_AND_LOANS, SERVICE_FEES } from '@/src/content/rates';
import { PageHero, RateTable, SectionHeading, CtaBand } from '@/components/commercial-ui/Isobath';
import { DisclosureBlock } from '@/components/commercial-ui/Footnote';

export const metadata: Metadata = {
    title: 'Rates and fees',
    description: `Every Heritage Trust deposit rate, loan rate and account fee in one place, as of ${RATES.asOf}.`,
};

const asOfLine = `Rates as of ${RATES.asOf}. Annual percentage yield (APY) and annual percentage rate (APR) are variable unless stated.`;

export default function RatesAndFeesPage() {
    return (
        <>
            <PageHero
                label="Rates and fees"
                title={
                    <>
                        Every rate and fee, <span className="ht-em">in one place.</span>
                    </>
                }
                lead="One table per product family, each with the date it was set. If a fee is not on this page or in your account agreement, we do not charge it."
                breadcrumb={[
                    { href: ROUTES.home, label: 'Home' },
                    { href: ROUTES.ratesAndFees, label: 'Rates and fees' },
                ]}
                aside={
                    <nav aria-label="On this page" className="border-t border-ink-900">
                        {[
                            ['#personal', 'Personal deposit accounts'],
                            ['#business', 'Business deposit accounts'],
                            ['#credit', 'Cards and loans'],
                            ['#service', 'Service fees'],
                        ].map(([href, label]) => (
                            <a
                                key={href}
                                href={href}
                                className="flex items-center justify-between border-b border-paper-200 py-3 text-small font-semibold text-ink-900 hover:text-petrol"
                            >
                                {label}
                                <span aria-hidden="true">↓</span>
                            </a>
                        ))}
                    </nav>
                }
            />

            <section aria-labelledby="personal" className="scroll-mt-24 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading id="personal" label="01" title="Personal deposit accounts" />
                    <RateTable
                        caption="Personal deposit accounts"
                        columns={['Rate', 'To open', 'Monthly fee', 'How to avoid the fee']}
                        rows={PERSONAL_DEPOSITS.map((r) => ({
                            product: r.product,
                            href: r.href,
                            description: r.description,
                            cells: [r.rate, r.minimum, r.monthlyFee, <span key="w" className="text-small text-ink-700">{r.waiver}</span>],
                        }))}
                        asOf={asOfLine}
                    />
                </div>
            </section>

            <section aria-labelledby="business" className="scroll-mt-24 border-t border-paper-200 bg-paper-100 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading id="business" label="02" title="Business deposit accounts" />
                    <RateTable
                        caption="Business deposit accounts"
                        columns={['Rate', 'To open', 'Monthly fee', 'How to avoid the fee']}
                        rows={BUSINESS_DEPOSITS.map((r) => ({
                            product: r.product,
                            href: r.href,
                            description: r.description,
                            cells: [r.rate, r.minimum, r.monthlyFee, <span key="w" className="text-small text-ink-700">{r.waiver}</span>],
                        }))}
                        asOf={asOfLine}
                    />
                </div>
            </section>

            <section aria-labelledby="credit" className="scroll-mt-24 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading id="credit" label="03" title="Cards and loans" intro="All credit is subject to approval. Your rate depends on your credit history and the term you choose." />
                    <RateTable
                        caption="Cards and loans"
                        columns={['Rate', 'Terms']}
                        rows={CREDIT_AND_LOANS.map((r) => ({
                            product: r.product,
                            href: r.href,
                            description: r.description,
                            cells: [r.rate, <span key="t" className="text-small text-ink-700">{r.terms}</span>],
                        }))}
                        asOf={asOfLine}
                    />
                </div>
            </section>

            <section aria-labelledby="service" className="scroll-mt-24 border-t border-paper-200 bg-paper-100 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading id="service" label="04" title="Service fees" />
                    <RateTable
                        caption="Service fees"
                        columns={['Fee', 'Notes']}
                        rows={SERVICE_FEES.map((r) => ({
                            product: r.service,
                            cells: [r.fee, <span key="n" className="text-small text-ink-700">{r.note || '—'}</span>],
                        }))}
                        asOf="Bracketed values are placeholders until the bank publishes the fee."
                    />
                    <DisclosureBlock
                        items={[
                            {
                                ref: 1,
                                text: `APY is accurate as of ${RATES.asOf}. Rates on variable accounts may change after the account is opened. Fees may reduce earnings.`,
                            },
                            {
                                ref: 2,
                                text: 'A penalty may be imposed for early withdrawal from a certificate of deposit.',
                            },
                            {
                                ref: 3,
                                text: 'Deposits are insured by the FDIC up to $250,000 per depositor, for each account ownership category.',
                            },
                        ]}
                    />
                </div>
            </section>

            <CtaBand
                id="rates-cta"
                title="Not sure which account fits?"
                body="Answer five questions and see the account, its fees and what you need to open it."
                primary={{ href: '/account-finder', label: 'Start the Account Finder' }}
            />
        </>
    );
}
