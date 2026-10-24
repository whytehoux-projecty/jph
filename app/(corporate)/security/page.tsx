import type { Metadata } from 'next';
import Link from 'next/link';
import { X, Check } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, PUBLIC_CONTACT } from '@/src/content/facts';
import { PageHero, SectionHeading, FactList, CtaBand } from '@/components/commercial-ui/Isobath';

export const metadata: Metadata = {
    title: 'Security and how to verify us',
    description: `How ${BRAND.shortName} protects your accounts, what we will never ask you for, and how to check that a call, email or website is really us.`,
};

const neverAsk = [
    'Your Heritage Vault password or PIN',
    'A one-time passcode sent to your phone',
    'To move money to a “safe account” to protect it',
    'To install remote-access software on your computer or phone',
    'To pay a fee in gift cards, crypto or a wire to release a payment',
    'To read your full card number and security code to us on a call we made',
];

export default function SecurityPage() {
    return (
        <>
            <PageHero
                label="Security"
                title={
                    <>
                        Security, and how to verify <span className="ht-em">it’s really us.</span>
                    </>
                }
                lead="Most fraud starts with someone pretending to be a bank. Here is exactly how we contact you, what we will never ask, and what to do if something feels wrong."
                primary={{ href: '#verify', label: 'Verify a call or email' }}
                secondary={{ href: '#report', label: 'Report suspected fraud' }}
                breadcrumb={[
                    { href: ROUTES.home, label: 'Home' },
                    { href: ROUTES.security, label: 'Security' },
                ]}
            />

            {/* Verify */}
            <section id="verify" aria-labelledby="verify-heading" className="scroll-mt-24 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="verify-heading"
                        label="Verify it’s us"
                        title="Hang up, then call us back on a number you trust."
                        intro="If a call, text or email asks you to act quickly, stop. Contact us using the number on the back of your card or on this page — never a number given to you in the message."
                    />
                    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-6">
                            <h3 className="text-h4 text-ink-900 mb-4">Our official channels</h3>
                            <FactList
                                items={[
                                    { term: 'Website', value: BRAND.domain },
                                    { term: 'Customer service', value: PUBLIC_CONTACT.phone },
                                    { term: 'Fraud line, 24 hours', value: PUBLIC_CONTACT.fraudPhone },
                                    { term: 'Email from us ends in', value: `@${BRAND.domain}` },
                                    { term: 'Secure messages', value: 'Inside Heritage Vault only' },
                                ]}
                                caption="Bracketed values are placeholders until the bank confirms its verified contact details."
                            />
                        </div>
                        <div className="lg:col-span-6">
                            <h3 className="text-h4 text-ink-900 mb-4">We will never ask you for</h3>
                            <ul className="border-t border-ink-900">
                                {neverAsk.map((item) => (
                                    <li key={item} className="flex gap-3 border-b border-paper-200 py-3 text-body text-ink-900">
                                        <X className="mt-1 h-4 w-4 shrink-0 text-alert" aria-hidden="true" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Report */}
            <section id="report" aria-labelledby="report-heading" className="scroll-mt-24 border-y border-paper-200 bg-paper-100 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="report-heading"
                        label="Report fraud"
                        title="If you think you’ve been targeted"
                    />
                    <ol className="grid gap-px border-y border-paper-200 bg-paper-200 md:grid-cols-3">
                        {[
                            {
                                t: 'Lock your card',
                                b: 'In Heritage Vault, open Cards and switch on Lock. You can unlock it again at any time.',
                            },
                            {
                                t: 'Call the fraud line',
                                b: `Call ${PUBLIC_CONTACT.fraudPhone}, any time. Tell us what happened and which accounts are affected.`,
                            },
                            {
                                t: 'Change your password',
                                b: 'Sign in from a device you trust and change your Heritage Vault password.',
                            },
                        ].map((s, i) => (
                            <li key={s.t} className="bg-paper-100 p-6 lg:p-8">
                                <p className="ht-label text-ink-500 mb-3 tabular">Step 0{i + 1}</p>
                                <h3 className="text-h4 text-ink-900 mb-2">{s.t}</h3>
                                <p className="text-body text-ink-700">{s.b}</p>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-6 text-small text-ink-700">
                        You can also send us a message through the{' '}
                        <Link href={`${ROUTES.contact}?topic=other`} className="ht-link">
                            contact form
                        </Link>
                        . Do not include passwords or full card numbers.
                    </p>
                </div>
            </section>

            {/* Protection */}
            <section aria-labelledby="protect-heading" className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="protect-heading"
                        label="How we protect you"
                        title="What we do, stated plainly"
                        intro="No system is perfect, so we tell you what we do and what you can do — rather than promising that nothing can go wrong."
                    />
                    <dl className="grid gap-px border-y border-paper-200 bg-paper-200 md:grid-cols-2">
                        {[
                            {
                                t: 'Deposit insurance',
                                b: 'Deposits are insured by the FDIC up to $250,000 per depositor, for each account ownership category. Investment products are not FDIC insured.',
                            },
                            {
                                t: 'Encryption',
                                b: 'Heritage Vault sessions are encrypted with TLS, and sensitive data is encrypted when it is stored.',
                            },
                            {
                                t: 'Sign-in protection',
                                b: 'Heritage Vault signs you out after a short period of inactivity, so an unattended device does not stay open.',
                            },
                            {
                                t: 'Monitoring',
                                b: 'We watch for unusual card and payment activity and contact you through official channels when something looks wrong.',
                            },
                        ].map((p) => (
                            <div key={p.t} className="bg-paper-50 p-6 lg:p-8">
                                <dt className="flex items-center gap-2 text-h4 text-ink-900 mb-2">
                                    <Check className="h-5 w-5 text-petrol" aria-hidden="true" />
                                    {p.t}
                                </dt>
                                <dd className="text-body text-ink-700">{p.b}</dd>
                            </div>
                        ))}
                    </dl>
                    <p className="mt-6 text-small text-ink-500">
                        Learn how FDIC coverage works at{' '}
                        <a href="https://www.fdic.gov/resources/deposit-insurance" className="ht-link font-normal" rel="noopener noreferrer" target="_blank">
                            fdic.gov
                        </a>
                        .
                    </p>
                </div>
            </section>

            <CtaBand
                id="security-cta"
                title="Questions about a message you received?"
                body="Our team can confirm whether a call, letter or email came from us."
                primary={{ href: `${ROUTES.contact}?topic=other`, label: 'Contact us' }}
                secondary={{ href: '/transparency', label: 'Read the transparency page' }}
            />
        </>
    );
}
