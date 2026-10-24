import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, RATES } from '@/src/content/facts';
import { BUSINESS_DEPOSITS } from '@/src/content/rates';
import {
    PageHero,
    SectionHeading,
    RateTable,
    BankerCard,
    CtaBand,
} from '@/components/commercial-ui/Isobath';
import { DisclosureBlock } from '@/components/commercial-ui/Footnote';

export const metadata: Metadata = {
    title: 'Business banking',
    description: `${BRAND.shortName} business banking — checking, merchant services, loans and treasury, with accounts sized to your business and a named banker.`,
    openGraph: {
        images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: BRAND.shortName }],
    },
    twitter: { card: 'summary_large_image' },
};

const bySize = [
    {
        size: 'Starting out',
        who: 'Sole proprietors and new businesses',
        account: 'Business Fundamentals checking',
        fee: '$16.00 a month, waived with a $5,000 average balance',
        includes: ['200 fee-free transactions a month', 'Up to $7,500 cash deposits a month', 'Business debit card'],
        href: `${ROUTES.businessBanking}/checking`,
    },
    {
        size: 'Established',
        who: 'Small businesses with staff and regular payroll',
        account: 'Business Advantage checking',
        fee: '$29.95 a month, waived with a $15,000 average balance',
        includes: ['500 fee-free transactions a month', 'Employee cards with limits', 'Positive Pay fraud protection'],
        href: `${ROUTES.businessBanking}/checking`,
    },
    {
        size: 'Mid-sized and growing',
        who: 'Companies with revenues from $50M to $2B',
        account: 'Commercial banking',
        fee: 'Priced for your relationship',
        includes: ['A relationship manager and team', 'Treasury and liquidity services', 'Credit facilities and trade finance'],
        href: '/corporate/commercial',
    },
];

const services = [
    { name: 'Business checking', body: 'Same-day ACH, wires and QuickBooks® integration.', href: `${ROUTES.businessBanking}/checking` },
    { name: 'Savings and CDs', body: 'Reserves for seasonal costs or expansion; CDs from 3 months to 5 years.', href: `${ROUTES.businessBanking}/savings` },
    { name: 'Business credit cards', body: 'Cash back, employee cards and expense-software integration.', href: `${ROUTES.businessBanking}/credit-cards` },
    { name: 'Loans and financing', body: 'Lines of credit up to $2M, SBA 7(a) and 504 loans, equipment finance.', href: `${ROUTES.businessBanking}/loans` },
    { name: 'Merchant services', body: 'In-person, online and mobile payments with next-day funding.', href: `${ROUTES.businessBanking}/merchant` },
    { name: 'Treasury services', body: 'Liquidity, payments and trade for larger operations.', href: '/corporate/treasury' },
];

const industries = [
    'Logistics and distribution',
    'Import, export and trade',
    'Real estate and construction',
    'Professional services',
    'Technology and growth companies',
    'Non-profit organizations',
];

export default function BusinessBankingPage() {
    return (
        <>
            <PageHero
                label="Business banking"
                title={
                    <>
                        A banking partner, <span className="ht-em">not just a bank.</span>
                    </>
                }
                lead={`From sole proprietors to mid-sized companies, ${BRAND.shortName} gives every business a named banker, accounts sized to how it trades, and fees you can see before you apply.`}
                primary={{ href: ROUTES.apply, label: 'Open a business account' }}
                secondary={{ href: `${ROUTES.contact}?topic=business`, label: 'Speak with a business banker' }}
                breadcrumb={[
                    { href: ROUTES.home, label: 'Home' },
                    { href: ROUTES.businessBanking, label: 'Business banking' },
                ]}
                aside={
                    <figure>
                        <div className="relative aspect-[4/3] overflow-hidden bg-paper-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/ht/business-bakery-1600.webp"
                                srcSet="/images/ht/business-bakery-800.webp 800w, /images/ht/business-bakery-1600.webp 1600w"
                                sizes="(min-width: 1024px) 40vw, 100vw"
                                alt="A bakery owner holds up a framed sign at her shop window in the early morning"
                                className="absolute inset-0 h-full w-full object-cover"
                                fetchPriority="high"
                            />
                        </div>
                    </figure>
                }
            />

            {/* By size */}
            <section aria-labelledby="size-heading" className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="size-heading"
                        label="Account types"
                        title="Sized to your business"
                        intro="Start where you are today. Your banker moves you to the next setting when you outgrow it — no new application."
                    />
                    <ol className="grid gap-px border-y border-paper-200 bg-paper-200 md:grid-cols-3">
                        {bySize.map((b, i) => (
                            <li key={b.size} className="flex flex-col bg-paper-50 p-6 lg:p-8">
                                <p className="ht-label text-ink-500 mb-4 tabular">
                                    0{i + 1} · {b.size}
                                </p>
                                <h3 className="text-h3 text-ink-900 mb-1">{b.account}</h3>
                                <p className="text-small text-ink-500 mb-6">{b.who}</p>
                                <p className="border-t border-paper-200 pt-4 text-body text-ink-900 tabular">{b.fee}</p>
                                <ul className="mt-4 grow space-y-2">
                                    {b.includes.map((inc) => (
                                        <li key={inc} className="flex gap-3 text-small text-ink-700">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden="true" />
                                            {inc}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={b.href}
                                    className="mt-8 inline-flex items-center gap-2 text-small font-semibold text-petrol underline underline-offset-4"
                                >
                                    {b.account}
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Rates */}
            <section aria-labelledby="business-rates-heading" className="border-t border-paper-200 bg-paper-100 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="business-rates-heading"
                        label="Compare"
                        title="Business accounts, side by side"
                        link={{ href: `${ROUTES.ratesAndFees}#business`, label: 'All rates and fees' }}
                    />
                    <RateTable
                        caption="Business deposit accounts compared"
                        columns={['Rate¹', 'To open', 'Monthly fee', 'How to avoid the fee']}
                        rows={BUSINESS_DEPOSITS.map((r) => ({
                            product: r.product,
                            href: r.href,
                            description: r.description,
                            cells: [r.rate, r.minimum, r.monthlyFee, <span key="w" className="text-small text-ink-700">{r.waiver}</span>],
                        }))}
                        asOf={`Rates as of ${RATES.asOf}. Bracketed values are placeholders until published.`}
                    />
                </div>
            </section>

            {/* Services */}
            <section aria-labelledby="services-heading" className="border-t border-paper-200 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading id="services-heading" label="Services" title="Everything a business account needs" />
                    <ul className="grid border-t border-ink-900 md:grid-cols-2 md:gap-x-16">
                        {services.map((s) => (
                            <li key={s.href + s.name} className="border-b border-paper-200">
                                <Link href={s.href} className="group flex items-start justify-between gap-6 py-5">
                                    <span>
                                        <span className="block text-h4 text-ink-900 group-hover:text-petrol">{s.name}</span>
                                        <span className="block text-small text-ink-700">{s.body}</span>
                                    </span>
                                    <ArrowRight className="mt-1.5 h-5 w-5 shrink-0 text-petrol transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Illustrative client story */}
            <section aria-labelledby="story-heading" className="border-t border-paper-200 bg-paper-100 py-16 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
                    <figure className="lg:col-span-5">
                        <div className="relative aspect-[4/3] overflow-hidden bg-paper-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/ht/business-shop-800.webp"
                                alt="A shop owner folds a sweater at the counter of her clothing store, a card reader beside her"
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                    </figure>
                    <div className="lg:col-span-7">
                        <p className="ht-label text-ink-500 mb-4">Illustrative client story</p>
                        <h2 id="story-heading" className="text-h2 text-ink-900 mb-6">
                            One banker for the shop, the payroll and the second location.
                        </h2>
                        <div className="space-y-4 text-body text-ink-700 ht-measure">
                            <p>
                                A clothing retailer opens Business Fundamentals checking and card acceptance in its first
                                year. As staff join, its banker moves the account to Business Advantage, adds employee
                                cards with spending limits and sets up Positive Pay.
                            </p>
                            <p>
                                When the owner signs a lease on a second shop, the same banker arranges an equipment loan
                                and a line of credit — one relationship, no new application.
                            </p>
                        </div>
                        <p className="mt-6 text-xs text-ink-500 ht-measure">
                            This is an illustrative example of how our accounts work together, not the experience of a
                            named client. Lending is subject to credit approval.
                        </p>
                    </div>
                </div>
            </section>

            {/* Bankers */}
            <section aria-labelledby="bankers-heading" className="border-t border-paper-200 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="bankers-heading"
                        label="Your banker"
                        title="Choose a person, not a queue."
                        intro={`We know your industry: ${industries.join(', ').toLowerCase()}.`}
                        link={{ href: `${ROUTES.contact}?topic=business`, label: 'All business contacts' }}
                    />
                    <div className="grid gap-6 md:grid-cols-3">
                        <BankerCard
                            banker={{
                                role: '[Business banker]',
                                desk: 'Small business desk',
                                languages: 'English, Spanish',
                                hours: '[9:00 AM – 5:00 PM] ET',
                                href: `${ROUTES.contact}?topic=business`,
                            }}
                        />
                        <BankerCard
                            banker={{
                                role: '[Business lending specialist]',
                                desk: 'Loans and financing',
                                languages: 'English',
                                hours: '[8:30 AM – 5:30 PM] ET',
                                href: `${ROUTES.contact}?topic=business`,
                            }}
                        />
                        <BankerCard
                            banker={{
                                role: '[Merchant services specialist]',
                                desk: 'Card acceptance',
                                languages: 'English',
                                hours: '[9:00 AM – 6:00 PM] ET',
                                href: `${ROUTES.contact}?topic=business`,
                            }}
                        />
                    </div>
                </div>
            </section>

            <section aria-label="Disclosures" className="border-t border-paper-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
                    <DisclosureBlock
                        items={[
                            {
                                ref: 1,
                                text: `APY as of ${RATES.asOf}. Monthly maintenance fees apply as shown unless the waiver is met. Deposits are insured by the FDIC up to $250,000 per depositor, for each account ownership category.`,
                            },
                        ]}
                    />
                </div>
            </section>

            <CtaBand
                id="business-cta"
                title="Open a business account, or talk it through first."
                primary={{ href: ROUTES.apply, label: 'Open a business account' }}
                secondary={{ href: '/account-finder', label: 'Use the Account Finder' }}
            />
        </>
    );
}
