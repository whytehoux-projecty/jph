import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { BRAND, RATES } from '@/src/content/facts';
import { PERSONAL_DEPOSITS, CREDIT_AND_LOANS } from '@/src/content/rates';
import {
    PageHero,
    SectionHeading,
    FactList,
    RateTable,
    DoorwayGrid,
    StepTimeline,
    QuestionList,
    CtaBand,
} from '@/components/commercial-ui/Isobath';
import { DisclosureBlock } from '@/components/commercial-ui/Footnote';

export const metadata: Metadata = {
    title: 'Personal banking',
    description: `${BRAND.shortName} personal banking — checking, savings, credit cards and loans, with every rate and fee shown up front.`,
    openGraph: {
        images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: BRAND.shortName }],
    },
    twitter: { card: 'summary_large_image' },
};

export default function PersonalBankingPage() {
    return (
        <>
            <PageHero
                label="Personal banking"
                title={
                    <>
                        Your everyday money, <span className="ht-em">simply kept.</span>
                    </>
                }
                lead={`From a first savings account to the family mortgage, ${BRAND.shortName} accounts are built around how you live — with every rate and fee on one page.`}
                primary={{ href: ROUTES.apply, label: 'Open an account' }}
                secondary={{ href: '/account-finder', label: 'Find the right account' }}
                breadcrumb={[
                    { href: ROUTES.home, label: 'Home' },
                    { href: ROUTES.personalBanking, label: 'Personal banking' },
                ]}
                aside={
                    <FactList
                        items={[
                            { term: 'Heritage Savings', value: `${RATES.savingsApy} APY¹` },
                            { term: 'Relationship checking', value: `${RATES.checkingApy} APY¹` },
                            { term: 'Minimum to open checking', value: '$0' },
                            { term: 'Online and mobile banking', value: 'Included' },
                            { term: 'Deposit insurance', value: 'FDIC, to $250,000²' },
                        ]}
                        caption={`Rates as of ${RATES.asOf}.`}
                    />
                }
            />

            {/* Products */}
            <section aria-labelledby="products-heading" className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="products-heading"
                        label="Accounts"
                        title="Four ways we can help"
                        intro="Each account page sets out who it suits, what it costs and how to avoid the fee."
                    />
                    <DoorwayGrid
                        doors={[
                            {
                                number: '01',
                                label: 'Checking',
                                title: 'Heritage Checking',
                                body: 'Three settings, one account. Switch between them in Heritage Vault as your needs change.',
                                href: `${ROUTES.personalBanking}/checking`,
                                linkLabel: 'Compare checking settings',
                                figure: { value: 'From $4.95', label: 'Monthly fee, waivable on every setting' },
                            },
                            {
                                number: '02',
                                label: 'Savings',
                                title: 'Savings and CDs',
                                body: 'Variable-rate savings with automatic transfers, and fixed-term CDs from 3 months to 5 years.',
                                href: `${ROUTES.personalBanking}/savings`,
                                linkLabel: 'See savings and CDs',
                                figure: { value: `${RATES.savingsApy} APY`, label: 'Heritage Savings¹' },
                            },
                            {
                                number: '03',
                                label: 'Cards',
                                title: 'Heritage Rewards Visa®',
                                body: `${RATES.cardCashback} unlimited cash back, no annual fee and ${RATES.cardIntroApr}.`,
                                href: `${ROUTES.personalBanking}/credit-cards`,
                                linkLabel: 'Compare credit cards',
                                figure: { value: RATES.cardCashback, label: 'Cash back on every purchase³' },
                            },
                            {
                                number: '04',
                                label: 'Borrowing',
                                title: 'Loans and mortgages',
                                body: 'Home loans, auto loans and personal loans from 12 to 84 months, with a lending specialist.',
                                href: `${ROUTES.personalBanking}/loans`,
                                linkLabel: 'See loans and mortgages',
                                figure: { value: RATES.personalLoanFrom, label: 'Personal loans from⁴' },
                            },
                        ]}
                    />
                </div>
            </section>

            {/* Comparison */}
            <section aria-labelledby="compare-heading" className="border-t border-paper-200 bg-paper-100 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="compare-heading"
                        label="Compare"
                        title="Rates and fees, side by side"
                        link={{ href: ROUTES.ratesAndFees, label: 'All rates and fees' }}
                    />
                    <RateTable
                        caption="Personal deposit accounts compared"
                        columns={['Rate¹', 'To open', 'Monthly fee', 'How to avoid the fee']}
                        rows={PERSONAL_DEPOSITS.map((r) => ({
                            product: r.product,
                            href: r.href,
                            description: r.description,
                            cells: [r.rate, r.minimum, r.monthlyFee, <span key="w" className="text-small text-ink-700">{r.waiver}</span>],
                        }))}
                        asOf={`Rates as of ${RATES.asOf}. Bracketed values are placeholders until published.`}
                    />
                    <div className="mt-12">
                        <RateTable
                            caption="Cards and loans compared"
                            columns={['Rate', 'Terms']}
                            rows={CREDIT_AND_LOANS.map((r) => ({
                                product: r.product,
                                href: r.href,
                                description: r.description,
                                cells: [r.rate, <span key="t" className="text-small text-ink-700">{r.terms}</span>],
                            }))}
                        />
                    </div>
                </div>
            </section>

            {/* Opening */}
            <section aria-labelledby="opening-heading" className="border-t border-paper-200 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="opening-heading"
                        label="Opening"
                        title="From first question to open account"
                        intro="Typical steps. Your banker confirms timings when your request is reviewed."
                    />
                    <StepTimeline
                        steps={[
                            { when: 'Step 1', title: 'Account Finder', body: 'Five questions, a straight answer on which account fits.' },
                            { when: 'Step 2', title: 'Request', body: 'Tell us where you live and which IDs you hold.' },
                            { when: 'Step 3', title: 'Review', body: 'Our onboarding team checks your request.' },
                            { when: 'Step 4', title: 'Register', body: 'Complete identity checks, then fund your account securely.' },
                            { when: 'Step 5', title: 'Online access', body: 'Set up Heritage Vault and your debit card.' },
                        ]}
                    />
                </div>
            </section>

            {/* Questions */}
            <section aria-labelledby="questions-heading" className="border-t border-paper-200 py-16 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
                    <div className="lg:col-span-4">
                        <p className="ht-label text-petrol mb-4">Questions</p>
                        <h2 id="questions-heading" className="text-h2 text-ink-900">
                            Questions people ask before they open
                        </h2>
                    </div>
                    <div className="lg:col-span-8">
                        <QuestionList
                            items={[
                                {
                                    q: 'Can I open an account online?',
                                    a: (
                                        <>
                                            Yes. Start an{' '}
                                            <Link href={ROUTES.apply} className="ht-link">
                                                account request
                                            </Link>
                                            ; you will need a photo ID, your Social Security number or ITIN, and proof of
                                            address.
                                        </>
                                    ),
                                },
                                {
                                    q: 'Are my deposits insured?',
                                    a: 'Yes. Deposits are insured by the FDIC up to $250,000 per depositor, for each account ownership category.',
                                },
                                {
                                    q: 'How do I avoid the monthly fee?',
                                    a: 'Every checking and savings setting has a way to waive it, shown in the table above — usually a direct deposit or a minimum balance.',
                                },
                                {
                                    q: 'I already bank with you. How do I get online access?',
                                    a: (
                                        <>
                                            Request{' '}
                                            <Link href={ROUTES.enroll} className="ht-link">
                                                online access
                                            </Link>{' '}
                                            and we will set up Heritage Vault for your existing accounts.
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* One disclosure block */}
            <section aria-label="Disclosures" className="border-t border-paper-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
                    <DisclosureBlock
                        items={[
                            {
                                ref: 1,
                                text: `Annual percentage yield (APY) is accurate as of ${RATES.asOf}. Rates are variable and may change after the account is opened. Fees may reduce earnings.`,
                            },
                            {
                                ref: 2,
                                text: 'Deposits are insured by the FDIC up to $250,000 per depositor, for each account ownership category.',
                            },
                            {
                                ref: 3,
                                text: `Subject to credit approval. ${RATES.cardIntroApr}; after that, a variable ${RATES.cardRegularApr} applies.`,
                            },
                            {
                                ref: 4,
                                text: `Personal loan rates and terms are subject to credit approval. The lowest rate, ${RATES.personalLoanFrom}, includes a discount for automatic payments from a ${BRAND.shortName} account.`,
                            },
                        ]}
                    />
                </div>
            </section>

            <CtaBand
                id="personal-cta"
                title="Find out in a minute which account fits you."
                primary={{ href: '/account-finder', label: 'Start the Account Finder' }}
                secondary={{ href: `${ROUTES.contact}?topic=personal`, label: 'Speak with a personal banker' }}
            />
        </>
    );
}
