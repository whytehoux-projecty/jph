import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';

export const metadata: Metadata = {
    title: `Terms and Conditions | ${BRAND.shortName}`,
    description: `Terms and Conditions for ${BRAND.legalName} E-Banking and ${BRAND.vault} digital services.`,
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-paper-100 py-24 px-6">
            <div className="container mx-auto max-w-3xl">
                <p className="label-mono text-vermilion-600 mb-4">Legal</p>
                <h1 className="font-display text-display-sm text-ink-900 mb-2 text-balance">Terms and Conditions</h1>
                <p className="text-small text-ink-500 mb-12">Digital Banking Agreement — Effective October 1, 2026</p>

                <div className="space-y-8 text-body text-ink-700 leading-relaxed">
                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">1. Acceptance of Terms</h2>
                        <p>By registering for and using {BRAND.legalName} digital services, including {BRAND.vault}, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use our online banking services.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">2. Account Access and Security</h2>
                        <p>You are responsible for maintaining the confidentiality of your account credentials, including your username and password. You agree to notify {BRAND.shortName} immediately upon discovering any unauthorized use of your account or any security breach.</p>
                        <p className="mt-3">{BRAND.shortName} will never ask for your password or one-time passcode (OTP) via email, telephone, or text message. Report any such requests immediately to our security team.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">3. Electronic Transactions</h2>
                        <p>All transactions initiated through {BRAND.vault} are subject to verification and may be delayed, suspended, or rejected in our sole discretion for security purposes. Transfer limits and cutoff times apply as specified in your account agreement.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">4. FDIC Insurance</h2>
                        <p>Deposits held at {BRAND.legalName} are insured by the Federal Deposit Insurance Corporation (FDIC) up to $250,000 per depositor, per insured bank, for each account ownership category. Investment products are not FDIC insured, not bank guaranteed, and may lose value.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">5. Limitation of Liability</h2>
                        <p>{BRAND.legalName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of digital banking services, including but not limited to loss of profits, data, or goodwill.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">6. Modifications to Terms</h2>
                        <p>We reserve the right to modify these terms at any time. We will provide notice of material changes by email or through a prominent notice on our website. Continued use of our digital services after such changes constitutes your acceptance of the new terms.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">7. Governing Law</h2>
                        <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">8. Contact</h2>
                        <p>For questions about these terms, contact us at <a href="mailto:legal@heritagetrust.bank" className="text-vermilion-600 hover:underline">legal@heritagetrust.bank</a> or visit our <Link href={ROUTES.contact} className="text-vermilion-600 hover:underline">Contact page</Link>.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
