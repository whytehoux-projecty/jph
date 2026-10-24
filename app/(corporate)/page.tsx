import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, FACTS, RATES, WEALTH_TIERS, yearsOfService } from '@/src/content/facts';
import {
    Action,
    DoorwayGrid,
    LedgerStrip,
    SectionHeading,
    TrustBand,
    CtaBand,
    type Doorway,
    type LedgerFigure,
} from '@/components/commercial-ui/Isobath';
import { auth } from '@/auth';

export const metadata: Metadata = {
    title: `${BRAND.shortName} — banking since ${BRAND.founded}`,
    description:
        `${BRAND.shortName} has served families, businesses and institutions since ${BRAND.founded}. ` +
        `Member FDIC. Heritage Savings earns ${RATES.savingsApy} APY (as of ${RATES.asOf}).`,
    openGraph: {
        images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: BRAND.shortName }],
    },
    twitter: { card: 'summary_large_image' },
};

// ─── Doorways — one figure each, named links ──────────────────────────────────
const doorways: Doorway[] = [
    {
        number: '01',
        label: 'Personal',
        title: 'Yourself and your household',
        body: 'Checking, savings, the Heritage Rewards Visa® and home loans, managed in Heritage Vault.',
        href: ROUTES.personalBanking,
        linkLabel: 'Personal banking',
        figure: { value: `${RATES.savingsApy} APY`, label: `Heritage Savings, as of ${RATES.asOf}` },
        image: {
            src: '/images/ht/door-personal-800.webp',
            alt: 'A hand setting house keys and a notebook on a wooden kitchen table beside a red mug',
        },
    },
    {
        number: '02',
        label: 'Business',
        title: 'Your business',
        body: 'Operating accounts, card acceptance and lending, with a named banker from the first call.',
        href: ROUTES.businessBanking,
        linkLabel: 'Business banking',
        figure: { value: `${RATES.businessCheckingApy} APY`, label: `Business checking, as of ${RATES.asOf}` },
        image: {
            src: '/images/ht/door-business-800.webp',
            alt: 'A café owner hands a customer a coffee across the counter, a card terminal beside the till',
        },
    },
    {
        number: '03',
        label: 'Wealth',
        title: 'Your family’s wealth',
        body: 'Investment advice, trusts and estate planning through one adviser who knows the whole picture.',
        href: '/wealth',
        linkLabel: 'Wealth management',
        figure: { value: WEALTH_TIERS.select.minimum, label: 'Minimum to open a wealth relationship' },
        image: {
            src: '/images/ht/door-wealth-800.webp',
            alt: 'A desk lamp lights a leather folio and a pen in a book-lined study',
        },
    },
    {
        number: '04',
        label: 'Corporate',
        title: 'Your institution',
        body: 'Commercial banking, treasury and capital markets for corporations and institutions.',
        href: '/corporate',
        linkLabel: 'Corporations and institutions',
        image: {
            src: '/images/ht/door-corporate-800.webp',
            alt: 'Two engineers in hard hats review plans in front of a building under construction at sunset',
        },
    },
];

// ─── Ledger strip — every figure with an as-of date and a source ──────────────
const ledger: LedgerFigure[] = [
    {
        label: 'In service since',
        value: `${BRAND.founded}`,
        note: `${yearsOfService()} years of continuous operation`,
        asOf: FACTS.asOf,
        source: { label: 'Charter', href: '/transparency#license' },
    },
    {
        label: 'Total assets',
        value: FACTS.assets,
        note: 'Balance sheet, not assets under management',
        asOf: FACTS.asOf,
        source: { label: FACTS.source, href: '/transparency#documents' },
    },
    {
        label: 'Clients',
        value: FACTS.clients,
        note: 'Personal, business and wealth clients',
        asOf: FACTS.asOf,
        source: { label: FACTS.source, href: '/transparency#documents' },
    },
    {
        label: 'Surcharge-free ATMs',
        value: FACTS.atms,
        note: 'Our own and partner network',
        asOf: FACTS.asOf,
        source: { label: 'Network list', href: ROUTES.locations },
    },
];

export default async function Home() {
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const vaultHref = isLoggedIn ? ROUTES.dashboard : ROUTES.login;

    return (
        <>
            {/* ── HERO — static, one primary action ─────────────────────── */}
            <section aria-labelledby="hero-heading" className="border-b border-paper-200">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24">
                    <div className="lg:col-span-6 lg:pt-8 animate-fade-in-up">
                        <p className="ht-label text-petrol mb-6">
                            Since {BRAND.founded} · Member FDIC
                        </p>
                        <h1 id="hero-heading" className="text-display-xl text-ink-900 mb-8">
                            Banking kept <span className="ht-em">in good order.</span>
                        </h1>
                        <p className="text-lead text-ink-700 ht-measure mb-10">
                            Personal, business and wealth banking from a bank that shows its figures, its people and
                            its fees before it asks for your details.
                        </p>
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
                            <Action href={ROUTES.apply}>Open an account</Action>
                            <Action href="/account-finder" variant="link">
                                Find the right account
                            </Action>
                        </div>

                        {/* Rate card with its disclosure */}
                        <div className="mt-12 max-w-md border-t border-ink-900 pt-4">
                            <div className="flex items-baseline justify-between gap-6">
                                <p className="text-small text-ink-500">Heritage Savings</p>
                                <p className="text-data text-ink-900 tabular">
                                    {RATES.savingsApy} <span className="text-small text-ink-500">APY</span>
                                </p>
                            </div>
                            <p className="mt-2 text-xs text-ink-500">
                                Annual percentage yield as of {RATES.asOf}. Variable rate; may change after the account is
                                opened. No minimum to open. Fees may reduce earnings.{' '}
                                <Link href={ROUTES.ratesAndFees} className="ht-link font-normal">
                                    All rates and fees
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-6">
                        <figure className="relative aspect-[4/5] w-full overflow-hidden bg-paper-100 sm:aspect-[4/3] lg:aspect-[4/5]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/ht/home-family-1600.webp"
                                srcSet="/images/ht/home-family-800.webp 800w, /images/ht/home-family-1600.webp 1600w"
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                alt="A couple and their toddler climb the steps of a brownstone at dusk, the front door glowing warmly"
                                width={1600}
                                height={900}
                                fetchPriority="high"
                                className="absolute inset-0 h-full w-full object-cover object-[60%_center]"
                            />
                        </figure>
                    </div>
                </div>
            </section>

            {/* ── DOORWAYS ──────────────────────────────────────────────── */}
            <section aria-labelledby="doorways-heading" className="py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="doorways-heading"
                        label="Who we serve"
                        title="Who are you banking for?"
                        intro="Each door says what we offer, who it suits and what it takes to open — before you share a single detail."
                    />
                    <DoorwayGrid doors={doorways} />
                </div>
            </section>

            {/* ── LEDGER STRIP ──────────────────────────────────────────── */}
            <LedgerStrip
                id="ledger-heading"
                title="We show our strength before we ask about yours."
                intro="Every figure on this site carries the date it was measured and the document it came from."
                figures={ledger}
                action={{ href: '/transparency', label: 'Open the transparency page' }}
                footnote="Bracketed values are placeholders until the bank confirms the figure and its source."
            />

            {/* ── HERITAGE VAULT — real interface states, one action ────── */}
            <section aria-labelledby="vault-heading" className="border-b border-paper-200 bg-paper-100">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 py-20 lg:py-28">
                    <div className="lg:col-span-5">
                        <p className="ht-label text-petrol mb-4">Digital banking</p>
                        <h2 id="vault-heading" className="text-h2 text-ink-900 mb-6">
                            {BRAND.vault}, on the web and on your phone.
                        </h2>
                        <p className="text-body text-ink-700 ht-measure mb-8">
                            See balances, move money between accounts, pay bills and lock a card in seconds. Every
                            transfer is shown in full for you to review before it is sent.
                        </p>
                        <Action href={vaultHref}>{isLoggedIn ? 'Go to Heritage Vault' : 'Sign in to Heritage Vault'}</Action>
                        {!isLoggedIn && (
                            <p className="mt-6 text-small text-ink-500">
                                Already a client without online access?{' '}
                                <Link href={ROUTES.enroll} className="ht-link">
                                    Get online access
                                </Link>
                            </p>
                        )}
                    </div>

                    {/* Interface states, drawn in HTML — not a stock phone render */}
                    <div className="lg:col-span-7" aria-hidden="true">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="border border-paper-200 bg-paper-50 p-5">
                                <p className="ht-label text-ink-500 mb-4">Accounts</p>
                                {[
                                    ['Heritage Checking', '•••• 4821', '$0,000.00'],
                                    ['Heritage Savings', '•••• 9035', '$00,000.00'],
                                    ['Rewards Visa®', '•••• 1170', '$000.00'],
                                ].map(([name, num, bal]) => (
                                    <div key={name} className="flex items-baseline justify-between border-t border-paper-200 py-3">
                                        <span>
                                            <span className="block text-small font-semibold text-ink-900">{name}</span>
                                            <span className="block text-xs text-ink-500 tabular">{num}</span>
                                        </span>
                                        <span className="text-body text-ink-900 tabular">{bal}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col border border-paper-200 bg-paper-50 p-5">
                                <p className="ht-label text-ink-500 mb-4">Review transfer</p>
                                <dl className="text-small">
                                    {[
                                        ['From', 'Heritage Checking •••• 4821'],
                                        ['To', 'Heritage Savings •••• 9035'],
                                        ['Amount', '$000.00'],
                                        ['Arrives', 'Today'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between gap-4 border-t border-paper-200 py-2">
                                            <dt className="text-ink-500">{k}</dt>
                                            <dd className="text-ink-900 tabular text-right">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <span className="mt-auto pt-4">
                                    <span className="flex h-11 items-center justify-center bg-petrol text-small font-semibold text-white">
                                        Send transfer
                                    </span>
                                </span>
                            </div>
                            <div className="border border-paper-200 bg-paper-50 p-5 sm:col-span-2">
                                <div className="flex items-center justify-between">
                                    <p className="ht-label text-ink-500">Card controls</p>
                                    <span className="text-xs text-ink-500">Debit •••• 4821</span>
                                </div>
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    {[
                                        ['Card locked', true],
                                        ['Online purchases', true],
                                        ['Use abroad', false],
                                    ].map(([label, on]) => (
                                        <div key={label as string} className="flex items-center justify-between border-t border-paper-200 pt-3">
                                            <span className="text-small text-ink-900">{label}</span>
                                            <span className={`relative h-6 w-10 rounded-full ${on ? 'bg-petrol' : 'bg-paper-200'}`}>
                                                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white ${on ? 'right-1' : 'left-1'}`} />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-ink-500">Illustrative screens. Balances shown are placeholders.</p>
                    </div>
                </div>
            </section>

            {/* ── TRUST BAND — one link, a proper Security page ─────────── */}
            <TrustBand
                items={[
                    {
                        title: 'Deposits insured by the FDIC',
                        body: 'Up to $250,000 per depositor, per ownership category. The FDIC explains the rules on fdic.gov.',
                    },
                    {
                        title: 'Encrypted in transit and at rest',
                        body: 'Sessions are encrypted with TLS, and sensitive data is encrypted when it is stored.',
                    },
                    {
                        title: 'Fraud monitoring and alerts',
                        body: 'Unusual card or payment activity is flagged, and you are alerted so you can confirm or stop it.',
                    },
                ]}
            />

            {/* ── GUIDES ────────────────────────────────────────────────── */}
            <section aria-labelledby="guides-heading" className="py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="guides-heading"
                        label="Guides"
                        title="Plain answers before you decide."
                        link={{ href: ROUTES.help, label: 'Help and support' }}
                    />
                    <ul className="grid gap-px border-y border-paper-200 bg-paper-200 md:grid-cols-3">
                        {[
                            {
                                kicker: 'Security · 4 min read',
                                title: 'How to tell a real call from a scam',
                                body: 'What we will and will never ask, and the one number to call back on.',
                                href: `${ROUTES.security}#verify`,
                            },
                            {
                                kicker: 'Rates · 3 min read',
                                title: 'Reading our rates and fees in one table',
                                body: 'Every deposit rate and account fee, with the date it was set.',
                                href: ROUTES.ratesAndFees,
                            },
                            {
                                kicker: 'Accounts · 1 minute',
                                title: 'Five questions to the right account',
                                body: 'Answer five questions and see which account fits, what you need and what happens next.',
                                href: '/account-finder',
                            },
                        ].map((g) => (
                            <li key={g.href} className="bg-paper-50">
                                <Link href={g.href} className="group flex h-full flex-col p-6 lg:p-8">
                                    <p className="ht-label text-ink-500 mb-4">{g.kicker}</p>
                                    <h3 className="text-h4 text-ink-900 mb-3 group-hover:text-petrol">{g.title}</h3>
                                    <p className="text-body text-ink-700 grow">{g.body}</p>
                                    <span className="mt-6 inline-flex items-center gap-2 text-small font-semibold text-petrol underline underline-offset-4">
                                        Read
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ── ACCOUNT FINDER ────────────────────────────────────────── */}
            <CtaBand
                id="finder-heading"
                title={
                    <>
                        Five questions. <span className="ht-em">About a minute.</span>
                    </>
                }
                body="A straight answer on which account fits, what it costs, what you will need and who you would speak to. Nothing is stored unless you choose to apply or book a call."
                primary={{ href: '/account-finder', label: 'Start the Account Finder' }}
            />

            <p className="sr-only">{BRAND.fdicShort}</p>
        </>
    );
}
