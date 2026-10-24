'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

/**
 * ConsentBanner — non-blocking cookie notice (replaces the CookieModal).
 *
 * UI/UX review, "Cookie dialog": no overlay, no blur, Accept and Decline as
 * equal buttons, a settings link, and non-essential cookies off until the
 * visitor chooses. The banner sits at the bottom of the viewport and never
 * covers the header or the primary action.
 *
 * Stored under the same key the old modal used. A legacy value of "true"
 * (the old "Accept all") is read as consent to everything.
 */

const STORAGE_KEY = 'heritage_cookie_consent';

export type ConsentChoice = {
    essential: true;
    analytics: boolean;
    marketing: boolean;
    decidedAt: string;
};

export function readConsent(): ConsentChoice | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        if (raw === 'true') {
            return { essential: true, analytics: true, marketing: true, decidedAt: '' };
        }
        return JSON.parse(raw) as ConsentChoice;
    } catch {
        return null;
    }
}

function saveConsent(analytics: boolean, marketing: boolean) {
    const choice: ConsentChoice = {
        essential: true,
        analytics,
        marketing,
        decidedAt: new Date().toISOString(),
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
    } catch {
        // Storage blocked: the choice still applies for this page view.
    }
    window.dispatchEvent(new CustomEvent('ht:consent', { detail: choice }));
}

export function ConsentBanner() {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [marketing, setMarketing] = useState(false);

    useEffect(() => {
        if (!readConsent()) setOpen(true);
        const reopen = () => {
            const current = readConsent();
            setAnalytics(!!current?.analytics);
            setMarketing(!!current?.marketing);
            setSettings(true);
            setOpen(true);
        };
        window.addEventListener('ht:open-consent', reopen);
        return () => window.removeEventListener('ht:open-consent', reopen);
    }, []);

    if (!open) return null;

    const decide = (a: boolean, m: boolean) => {
        saveConsent(a, m);
        setOpen(false);
        setSettings(false);
    };

    return (
        <section
            aria-label="Cookie choices"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900 bg-paper-50 ht-no-print"
        >
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                    <p className="text-small text-ink-700 ht-measure">
                        We use essential cookies to keep you signed in and secure. With your permission we would
                        also use analytics cookies to improve this site. Nothing non-essential is set until you choose.{' '}
                        <Link href={ROUTES.privacy} className="ht-link">
                            Privacy notice
                        </Link>
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center shrink-0">
                        <button
                            type="button"
                            onClick={() => decide(true, true)}
                            className="inline-flex items-center justify-center px-6 text-small font-semibold border border-petrol bg-petrol text-white hover:bg-petrol-700 transition-colors"
                        >
                            Accept
                        </button>
                        <button
                            type="button"
                            onClick={() => decide(false, false)}
                            className="inline-flex items-center justify-center px-6 text-small font-semibold border border-petrol bg-petrol text-white hover:bg-petrol-700 transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            type="button"
                            aria-expanded={settings}
                            aria-controls="consent-settings"
                            onClick={() => setSettings((s) => !s)}
                            className="inline-flex items-center justify-center px-2 text-small font-semibold text-petrol underline underline-offset-4"
                        >
                            Cookie settings
                        </button>
                    </div>
                </div>

                {settings && (
                    <div id="consent-settings" className="mt-4 border-t border-paper-200 pt-4">
                        <fieldset>
                            <legend className="ht-label text-ink-500 mb-3">Choose cookies</legend>
                            <div className="grid gap-3 md:grid-cols-3">
                                <label className="flex items-start gap-3 border border-paper-200 p-3 min-h-[44px]">
                                    <input type="checkbox" checked disabled className="mt-1 h-5 w-5 accent-[#0E4A55]" />
                                    <span>
                                        <span className="block text-small font-semibold text-ink-900">Essential</span>
                                        <span className="block text-small text-ink-500">Security and sign-in. Always on.</span>
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 border border-paper-200 p-3 min-h-[44px] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={analytics}
                                        onChange={(e) => setAnalytics(e.target.checked)}
                                        className="mt-1 h-5 w-5 accent-[#0E4A55]"
                                    />
                                    <span>
                                        <span className="block text-small font-semibold text-ink-900">Analytics</span>
                                        <span className="block text-small text-ink-500">First-party, aggregated visit counts.</span>
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 border border-paper-200 p-3 min-h-[44px] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={marketing}
                                        onChange={(e) => setMarketing(e.target.checked)}
                                        className="mt-1 h-5 w-5 accent-[#0E4A55]"
                                    />
                                    <span>
                                        <span className="block text-small font-semibold text-ink-900">Marketing</span>
                                        <span className="block text-small text-ink-500">Measuring our own campaigns.</span>
                                    </span>
                                </label>
                            </div>
                        </fieldset>
                        <button
                            type="button"
                            onClick={() => decide(analytics, marketing)}
                            className="mt-4 inline-flex items-center justify-center px-6 text-small font-semibold border border-ink-900 text-ink-900 hover:bg-paper-100 transition-colors"
                        >
                            Save choices
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

/** Small client button for the footer: reopens the banner in settings mode. */
export function CookieSettingsLink({ className }: { className?: string }) {
    return (
        <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('ht:open-consent'))}
            className={className}
        >
            Cookie settings
        </button>
    );
}
