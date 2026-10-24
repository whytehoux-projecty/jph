'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Printer } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { RATES, WEALTH_TIERS } from '@/src/content/facts';

/**
 * Account Finder — the Isobath Passage Planner, renamed for Heritage Trust.
 *
 * Five questions lead to one recommended account and a call with a banker.
 * Answers stay in this browser tab (sessionStorage) and are never sent
 * anywhere; the visitor chooses to apply (the existing /apply flow) or to
 * book a call (the existing /contact form, pre-set to the right desk).
 */

type Who = 'me' | 'joint' | 'business' | 'wealth';
type Answers = {
    who?: Who;
    goal?: string;
    style?: 'app' | 'mix' | 'banker';
    balance?: 'lt10k' | '10k-250k' | '250k-1m' | 'gt1m';
    timing?: 'now' | 'month' | 'exploring';
};
type Option = { value: string; label: string; hint?: string };
type Question = { key: keyof Answers; title: string; help: string; options: (a: Answers) => Option[] };

const STORAGE_KEY = 'ht_account_finder';

const QUESTIONS: Question[] = [
    {
        key: 'who',
        title: 'Who is the account for?',
        help: 'It decides which accounts, documents and banking desk apply to you.',
        options: () => [
            { value: 'me', label: 'Just me' },
            { value: 'joint', label: 'Me and someone else', hint: 'A joint account with a partner or family member' },
            { value: 'business', label: 'My business', hint: 'Sole proprietor, partnership or company' },
            { value: 'wealth', label: 'My family’s wealth', hint: 'Investments, trusts or an estate' },
        ],
    },
    {
        key: 'goal',
        title: 'What should it do first?',
        help: 'Choose the main job. Your banker can add the rest later.',
        options: (a) => {
            if (a.who === 'business') {
                return [
                    { value: 'operate', label: 'Run day-to-day payments', hint: 'Payroll, suppliers, deposits' },
                    { value: 'reserve', label: 'Hold reserves and earn interest' },
                    { value: 'finance', label: 'Borrow or finance equipment' },
                    { value: 'accept', label: 'Accept card payments' },
                ];
            }
            if (a.who === 'wealth') {
                return [
                    { value: 'invest', label: 'Invest and grow' },
                    { value: 'trust', label: 'Set up or manage a trust' },
                    { value: 'estate', label: 'Plan what I pass on' },
                    { value: 'all', label: 'All of these, with one adviser' },
                ];
            }
            return [
                { value: 'everyday', label: 'Pay bills and spend day to day' },
                { value: 'save', label: 'Save and earn interest' },
                { value: 'borrow', label: 'Borrow', hint: 'A home, car or personal loan' },
                { value: 'credit', label: 'A credit card' },
            ];
        },
    },
    {
        key: 'style',
        title: 'How do you like to bank?',
        help: 'Every account includes Heritage Vault online and mobile banking.',
        options: () => [
            { value: 'app', label: 'Mostly on my phone' },
            { value: 'mix', label: 'Online, with a branch when I need one' },
            { value: 'banker', label: 'With a named banker I can call' },
        ],
    },
    {
        key: 'balance',
        title: 'Roughly how much would you keep with us?',
        help: 'A band is enough. We use it to suggest the right setting, not to assess you.',
        options: () => [
            { value: 'lt10k', label: 'Under $10,000' },
            { value: '10k-250k', label: '$10,000 to $250,000' },
            { value: '250k-1m', label: '$250,000 to $1 million' },
            { value: 'gt1m', label: 'Over $1 million' },
        ],
    },
    {
        key: 'timing',
        title: 'How soon would you like to open it?',
        help: 'There is no pressure either way. Nothing is stored unless you apply or book a call.',
        options: () => [
            { value: 'now', label: 'This week' },
            { value: 'month', label: 'Within a month' },
            { value: 'exploring', label: 'Just exploring' },
        ],
    },
];

type Result = {
    account: string;
    summary: string;
    href: string;
    figures: { label: string; value: string }[];
    needs: string[];
    desk: { name: string; topic: string };
    primary: { label: string; href: string };
    note?: string;
};

function recommend(a: Answers): Result {
    const personalNeeds = [
        'A valid government-issued photo ID',
        'Your Social Security number or ITIN',
        'Proof of your current address, dated within three months',
    ];
    const businessNeeds = [
        'Your business EIN (or owner’s SSN for a sole proprietor)',
        'Formation documents, such as articles of organization',
        'Photo ID for each owner with 25% or more and one controlling person',
    ];
    const wealthNeeds = [
        'A valid government-issued photo ID',
        'A summary of the assets you would place with us',
        'Evidence of where your wealth came from, such as a business sale or inheritance',
    ];
    const largeBalance = a.balance === '250k-1m' || a.balance === 'gt1m';
    const wealthNote = largeBalance
        ? `With a balance in this band you may also qualify for ${a.balance === 'gt1m' ? WEALTH_TIERS.private.name : WEALTH_TIERS.select.name}, which adds a dedicated adviser.`
        : undefined;

    if (a.who === 'business') {
        const desk = { name: 'Business banking desk', topic: 'business' };
        switch (a.goal) {
            case 'reserve':
                return {
                    account: 'Business savings and CDs',
                    summary: 'An interest-earning reserve beside your operating account, with CD terms from 3 months to 5 years.',
                    href: `${ROUTES.businessBanking}/savings`,
                    figures: [{ label: 'CD terms', value: '3 months – 5 years' }],
                    needs: businessNeeds,
                    desk,
                    primary: { label: 'Open a business account', href: ROUTES.apply },
                };
            case 'finance':
                return {
                    account: 'Business loans and financing',
                    summary: 'Lines of credit, SBA 7(a) and 504 loans and equipment financing, structured with a business lender.',
                    href: `${ROUTES.businessBanking}/loans`,
                    figures: [{ label: 'Lines of credit', value: 'Up to $2M' }],
                    needs: [...businessNeeds, 'Your last two years of business tax returns'],
                    desk,
                    primary: { label: 'Talk to a business lender', href: `${ROUTES.contact}?topic=business` },
                };
            case 'accept':
                return {
                    account: 'Merchant services',
                    summary: 'In-person, online and mobile card acceptance with next-day funding for approved transactions.',
                    href: `${ROUTES.businessBanking}/merchant`,
                    figures: [{ label: 'Funding', value: 'Next business day' }],
                    needs: businessNeeds,
                    desk,
                    primary: { label: 'Set up card acceptance', href: `${ROUTES.contact}?topic=business` },
                };
            default:
                return {
                    account: 'Business checking',
                    summary: 'An operating account with ACH, wires, employee debit cards and Positive Pay fraud protection.',
                    href: `${ROUTES.businessBanking}/checking`,
                    figures: [{ label: 'Annual percentage yield', value: `${RATES.businessCheckingApy} APY` }],
                    needs: businessNeeds,
                    desk,
                    primary: { label: 'Open a business account', href: ROUTES.apply },
                };
        }
    }

    if (a.who === 'wealth') {
        const desk = { name: 'Wealth management desk', topic: 'wealth' };
        const tier = a.balance === 'gt1m' ? WEALTH_TIERS.private : WEALTH_TIERS.select;
        const belowMinimum = a.balance === 'lt10k' || a.balance === '10k-250k';
        const service = {
            invest: { name: 'Portfolio management', href: '/wealth/portfolio' },
            trust: { name: 'Trust services', href: '/wealth/trust' },
            estate: { name: 'Estate planning', href: '/wealth/estate' },
            all: { name: 'Private wealth', href: '/wealth/private' },
        }[a.goal ?? 'all'] ?? { name: 'Private wealth', href: '/wealth/private' };
        return {
            account: belowMinimum ? 'Heritage Savings, with a wealth conversation' : `${tier.name}: ${service.name.toLowerCase()}`,
            summary: belowMinimum
                ? `Wealth relationships start at ${WEALTH_TIERS.select.minimum}. Until then, Heritage Savings earns interest and an adviser can plan the next step with you.`
                : tier.description,
            href: belowMinimum ? `${ROUTES.personalBanking}/savings` : service.href,
            figures: belowMinimum
                ? [
                      { label: 'Heritage Savings', value: `${RATES.savingsApy} APY` },
                      { label: 'Wealth minimum', value: WEALTH_TIERS.select.minimum },
                  ]
                : [{ label: 'Minimum investable assets', value: tier.minimum }],
            needs: wealthNeeds,
            desk,
            primary: { label: 'Book a call with an adviser', href: `${ROUTES.contact}?topic=wealth` },
        };
    }

    // Personal (just me / joint)
    const desk = { name: 'Personal banking desk', topic: 'personal' };
    const needs = a.who === 'joint' ? [...personalNeeds, 'The same three items for the second account holder'] : personalNeeds;
    switch (a.goal) {
        case 'save':
            return {
                account: 'Heritage Savings',
                summary: 'Variable-rate savings with no minimum to open, automatic transfers and goals in Heritage Vault.',
                href: `${ROUTES.personalBanking}/savings`,
                figures: [
                    { label: 'Annual percentage yield', value: `${RATES.savingsApy} APY` },
                    { label: 'Minimum to open', value: '$0' },
                ],
                needs,
                desk,
                primary: { label: 'Open Heritage Savings', href: ROUTES.apply },
                note: wealthNote,
            };
        case 'borrow':
            return {
                account: 'Home, auto and personal loans',
                summary: 'Fixed and adjustable mortgages, auto loans and personal loans from 12 to 84 months.',
                href: `${ROUTES.personalBanking}/loans`,
                figures: [{ label: 'Personal loans from', value: RATES.personalLoanFrom }],
                needs: [...needs, 'Recent pay stubs or tax returns'],
                desk,
                primary: { label: 'Talk to a lending specialist', href: `${ROUTES.contact}?topic=personal` },
                note: 'Rates and terms are subject to credit approval.',
            };
        case 'credit':
            return {
                account: 'Heritage Rewards Visa®',
                summary: `${RATES.cardCashback} unlimited cash back, ${RATES.cardIntroApr} and no annual fee.`,
                href: `${ROUTES.personalBanking}/credit-cards`,
                figures: [
                    { label: 'Cash back', value: RATES.cardCashback },
                    { label: 'After the intro period', value: RATES.cardRegularApr },
                ],
                needs,
                desk,
                primary: { label: 'Apply for the card', href: ROUTES.apply },
                note: 'Subject to credit approval.',
            };
        default: {
            const setting = a.balance === 'lt10k' ? 'Advantage Plus' : 'Relationship';
            return {
                account: `Heritage Checking — ${setting} setting`,
                summary:
                    setting === 'Relationship'
                        ? 'Earns interest on your balance; the monthly fee is waived with $10,000 in combined balances.'
                        : 'Everyday checking; the monthly fee is waived with one direct deposit of $250 or more.',
                href: `${ROUTES.personalBanking}/checking`,
                figures: [
                    { label: 'Annual percentage yield', value: `${RATES.checkingApy} APY` },
                    { label: 'Monthly fee', value: setting === 'Relationship' ? '$25.00, waivable' : '$12.00, waivable' },
                ],
                needs,
                desk,
                primary: { label: 'Open Heritage Checking', href: ROUTES.apply },
                note: wealthNote,
            };
        }
    }
}

export function AccountFinder() {
    const [answers, setAnswers] = useState<Answers>({});
    const [step, setStep] = useState(0);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const firstRender = useRef(true);

    // Restore from this tab only
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw) as { answers: Answers; step: number };
                setAnswers(saved.answers ?? {});
                setStep(Math.min(saved.step ?? 0, QUESTIONS.length));
            }
        } catch {
            // Storage unavailable: start fresh
        }
    }, []);

    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }));
        } catch {
            // ignore
        }
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        headingRef.current?.focus();
    }, [answers, step]);

    const done = step >= QUESTIONS.length;
    const question = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
    const options = question.options(answers);
    const current = answers[question.key] as string | undefined;
    const result = useMemo(() => (done ? recommend(answers) : null), [done, answers]);

    const choose = (value: string) => {
        setAnswers((prev) => {
            const next = { ...prev, [question.key]: value } as Answers;
            // A different "who" changes the goal options, so clear the old goal
            if (question.key === 'who' && prev.who !== value) delete next.goal;
            return next;
        });
    };

    const restart = () => {
        setAnswers({});
        setStep(0);
    };

    return (
        <div className="border-b border-paper-200">
            <div className="mx-auto grid max-w-7xl lg:grid-cols-12">
                {/* Progress rail */}
                <aside className="border-b border-paper-200 bg-paper-100 px-4 py-6 sm:px-6 lg:col-span-4 lg:border-b-0 lg:border-r lg:px-8 lg:py-14 ht-no-print">
                    <p className="ht-label text-ink-500 mb-6">Account Finder</p>
                    <ol className="hidden lg:block">
                        {QUESTIONS.map((q, i) => {
                            const state = i < step ? 'done' : i === step ? 'current' : 'todo';
                            return (
                                <li key={q.key} className="relative flex gap-4 pb-6 last:pb-0">
                                    {i < QUESTIONS.length - 1 && (
                                        <span className="absolute left-[7px] top-5 bottom-0 w-px bg-paper-300" aria-hidden="true" />
                                    )}
                                    <span
                                        className={`relative mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                            state === 'todo' ? 'border-ink-500 bg-paper-100' : 'border-petrol bg-petrol'
                                        }`}
                                        aria-hidden="true"
                                    >
                                        {state === 'done' && <Check className="h-3 w-3 text-white" />}
                                    </span>
                                    <span>
                                        <span className="block text-xs text-ink-500 tabular">0{i + 1}</span>
                                        {state === 'done' ? (
                                            <button
                                                type="button"
                                                onClick={() => setStep(i)}
                                                className="text-left text-small text-ink-900 underline underline-offset-4 hover:text-petrol min-h-0"
                                            >
                                                {q.title}
                                                <span className="sr-only"> — change answer</span>
                                            </button>
                                        ) : (
                                            <span
                                                className={`block text-small ${state === 'current' ? 'font-semibold text-ink-900' : 'text-ink-500'}`}
                                                aria-current={state === 'current' ? 'step' : undefined}
                                            >
                                                {q.title}
                                            </span>
                                        )}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                    {/* Mobile progress */}
                    <div className="lg:hidden">
                        <div className="h-0.5 w-full bg-paper-200" aria-hidden="true">
                            <div className="h-0.5 bg-petrol transition-all" style={{ width: `${(Math.min(step, 5) / 5) * 100}%` }} />
                        </div>
                        <p className="mt-2 text-small text-ink-500 tabular">
                            {done ? 'Your answer' : `Question ${step + 1} of ${QUESTIONS.length}`}
                        </p>
                    </div>
                    <p className="mt-8 hidden text-small text-ink-500 lg:block">
                        Your answers stay in this browser tab. Leaving the tab clears them. Nothing is sent to us unless
                        you choose to apply or book a call.
                    </p>
                </aside>

                {/* Question or answer */}
                <div className="px-4 py-10 sm:px-6 lg:col-span-8 lg:px-16 lg:py-14" aria-live="polite">
                    {!done ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (current) setStep((s) => s + 1);
                            }}
                        >
                            <fieldset>
                                <legend className="contents">
                                    <span className="ht-label block text-petrol mb-4 tabular">
                                        Question 0{step + 1} of 0{QUESTIONS.length}
                                    </span>
                                    <h1 ref={headingRef} tabIndex={-1} className="block text-display-lg text-ink-900 mb-4 outline-none">
                                        {question.title}
                                    </h1>
                                </legend>
                                <p className="text-lead text-ink-700 ht-measure mb-10">{question.help}</p>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {options.map((o) => {
                                        const checked = current === o.value;
                                        return (
                                            <label
                                                key={o.value}
                                                className={`flex cursor-pointer items-start gap-4 border p-4 min-h-[64px] transition-colors ${
                                                    checked ? 'border-petrol bg-shallows' : 'border-paper-300 hover:border-ink-900'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={question.key}
                                                    value={o.value}
                                                    checked={checked}
                                                    onChange={() => choose(o.value)}
                                                    className="mt-1 h-5 w-5 shrink-0 accent-[#0E4A55]"
                                                />
                                                <span>
                                                    <span className="block text-body font-semibold text-ink-900">{o.label}</span>
                                                    {o.hint && <span className="block text-small text-ink-500">{o.hint}</span>}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>

                            <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-paper-200 pt-8">
                                <button
                                    type="submit"
                                    disabled={!current}
                                    className="inline-flex items-center justify-center gap-2 bg-petrol px-6 text-small font-semibold text-white hover:bg-petrol-700 disabled:cursor-not-allowed disabled:bg-paper-200 disabled:text-ink-500"
                                >
                                    {step === QUESTIONS.length - 1 ? 'See my answer' : 'Continue'}
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </button>
                                {step > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep((s) => s - 1)}
                                        className="inline-flex items-center gap-2 px-2 text-small font-semibold text-ink-900 underline underline-offset-4"
                                    >
                                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                        Back
                                    </button>
                                )}
                                <span className="text-small text-ink-500 tabular">
                                    Step {step + 1} of {QUESTIONS.length}
                                </span>
                            </div>
                        </form>
                    ) : (
                        result && (
                            <div>
                                <p className="ht-label text-petrol mb-4">Your answer</p>
                                <h1 ref={headingRef} tabIndex={-1} className="text-display-lg text-ink-900 mb-4 outline-none">
                                    {result.account}
                                </h1>
                                <p className="text-lead text-ink-700 ht-measure mb-10">{result.summary}</p>

                                <dl className="grid border-t border-ink-900 sm:grid-cols-2">
                                    {result.figures.map((f) => (
                                        <div key={f.label} className="border-b border-paper-200 py-4 sm:pr-6">
                                            <dt className="text-small text-ink-500">{f.label}</dt>
                                            <dd className="text-data text-ink-900 tabular">{f.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <p className="mt-3 text-xs text-ink-500">
                                    Rates as of {RATES.asOf}. Variable rates may change. See{' '}
                                    <Link href={ROUTES.ratesAndFees} className="ht-link font-normal">
                                        rates and fees
                                    </Link>
                                    .
                                </p>
                                {result.note && <p className="mt-6 bg-paper-100 p-4 text-small text-ink-700">{result.note}</p>}

                                <div className="mt-12 grid gap-10 md:grid-cols-2">
                                    <div>
                                        <h2 className="text-h4 font-sans font-semibold text-ink-900 mb-4">What you will need</h2>
                                        <ul className="border-t border-paper-200">
                                            {result.needs.map((n) => (
                                                <li key={n} className="flex gap-3 border-b border-paper-200 py-3 text-small text-ink-700">
                                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden="true" />
                                                    {n}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h2 className="text-h4 font-sans font-semibold text-ink-900 mb-4">What happens next</h2>
                                        <ol className="border-t border-paper-200">
                                            {[
                                                ['Request', 'Tell us where you live and which IDs you hold.'],
                                                ['Review', 'Our onboarding team checks your request.'],
                                                ['Register', 'Complete identity checks and fund your account securely.'],
                                            ].map(([t, b], i) => (
                                                <li key={t} className="flex gap-3 border-b border-paper-200 py-3">
                                                    <span className="text-small text-ink-500 tabular">0{i + 1}</span>
                                                    <span className="text-small text-ink-700">
                                                        <span className="font-semibold text-ink-900">{t}.</span> {b}
                                                    </span>
                                                </li>
                                            ))}
                                        </ol>
                                        <p className="mt-4 text-small text-ink-500">
                                            You would speak to the <span className="text-ink-900">{result.desk.name}</span>
                                            {answers.style === 'banker' ? ', and a named banker would call you back.' : '.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-12 flex flex-col items-start gap-4 border-t border-paper-200 pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 ht-no-print">
                                    <Link
                                        href={result.primary.href}
                                        className="inline-flex items-center justify-center gap-2 bg-petrol px-6 text-small font-semibold text-white hover:bg-petrol-700"
                                    >
                                        {result.primary.label}
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    {!result.primary.href.startsWith(ROUTES.contact) && (
                                        <Link
                                            href={`${ROUTES.contact}?topic=${result.desk.topic}`}
                                            className="inline-flex items-center justify-center border border-ink-900 px-6 text-small font-semibold text-ink-900 hover:bg-paper-100"
                                        >
                                            Book a call with a banker
                                        </Link>
                                    )}
                                    <Link href={result.href} className="inline-flex items-center text-small font-semibold text-petrol underline underline-offset-4">
                                        Read about this account
                                    </Link>
                                </div>
                                <div className="mt-6 flex flex-wrap items-center gap-6 ht-no-print">
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="inline-flex items-center gap-2 text-small text-ink-700 underline underline-offset-4"
                                    >
                                        <Printer className="h-4 w-4" aria-hidden="true" /> Print or save as PDF
                                    </button>
                                    <button type="button" onClick={() => setStep(QUESTIONS.length - 1)} className="text-small text-ink-700 underline underline-offset-4">
                                        Change my answers
                                    </button>
                                    <button type="button" onClick={restart} className="text-small text-ink-700 underline underline-offset-4">
                                        Start again
                                    </button>
                                </div>
                                <p className="mt-10 text-xs text-ink-500 ht-measure">
                                    This is guidance, not an offer of credit or an account. Opening any account is subject
                                    to identity verification and our account terms.
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
