import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';

export const metadata: Metadata = {
    title: `Privacy Policy | ${BRAND.shortName}`,
    description: `Privacy Policy for ${BRAND.legalName} — how we collect, use, and protect your personal information under GLBA and state laws.`,
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-paper-100 py-24 px-6">
            <div className="container mx-auto max-w-3xl">
                <p className="label-mono text-vermilion-600 mb-4">Legal</p>
                <h1 className="font-display text-display-sm text-ink-900 mb-2 text-balance">Privacy Policy</h1>
                <p className="text-small text-ink-500 mb-12">Last updated: October 1, 2026</p>

                <div className="space-y-8 text-body text-ink-700 leading-relaxed">
                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">Gramm-Leach-Bliley Act (GLBA) Notice</h2>
                        <p>Financial companies choose how they share your personal information. Federal law gives consumers the right to limit some but not all sharing. Federal law also requires us to tell you how we collect, share, and protect your personal information. Please read this notice carefully to understand what we do.</p>
                        <p className="mt-3">The types of personal information we collect and share depend on the product or service you have with us. This information can include: Social Security number, income, account balances, payment history, credit history, and credit scores.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you open an account, make a transaction, or contact us for support. This includes:</p>
                        <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
                            <li>Personal identification information (name, date of birth, SSN, EIN)</li>
                            <li>Contact information (address, phone number, email)</li>
                            <li>Financial information (account numbers, transaction history, assets, income)</li>
                            <li>Device and usage information when you use {BRAND.vault} and our digital services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">2. How We Use Your Information</h2>
                        <p>{BRAND.legalName} uses the information we collect to:</p>
                        <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
                            <li>Provide, operate, and maintain our banking services</li>
                            <li>Process transactions and send related information</li>
                            <li>Verify your identity and prevent fraudulent activity</li>
                            <li>Comply with legal and regulatory requirements (e.g., KYC/AML)</li>
                            <li>Send account notices and service updates</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">3. Information Sharing</h2>
                        <p>We do not sell your personal information to third parties. We may share your information with:</p>
                        <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
                            <li>Service providers who assist us in operating our business</li>
                            <li>Regulatory authorities and law enforcement as required by law</li>
                            <li>Financial institutions involved in processing your transactions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">4. Data Security</h2>
                        <p>We implement industry-standard security measures including 256-bit AES encryption, multi-factor authentication, and continuous monitoring to protect your personal and financial information against unauthorized access, alteration, or disclosure. We operate on a Zero Trust architecture.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">5. Data Retention</h2>
                        <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Financial records are typically retained for a minimum of 7 years as required by applicable federal and state laws.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">6. State Privacy Rights</h2>
                        <p>Depending on your state of residence (e.g., California, Virginia, Colorado), you may have additional rights regarding your personal information, including the right to know what information we collect, the right to request deletion of certain information, and the right to opt-out of certain sharing practices (though GLBA exemptions generally apply to financial institutions).</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">7. Cookies and Tracking</h2>
                        <p>Our website uses cookies and similar technologies to improve your experience, analyze usage patterns, and maintain security. You may configure your browser to refuse cookies, though this may affect the functionality of our online services.</p>
                    </section>

                    <section>
                        <h2 className="font-display text-h4 text-ink-900 mb-3">8. Contact Us</h2>
                        <p>For privacy-related inquiries, or to exercise your privacy rights, please contact our Privacy Office at <a href="mailto:privacy@heritagetrust.bank" className="text-vermilion-600 hover:underline">privacy@heritagetrust.bank</a> or visit our <Link href={ROUTES.contact} className="text-vermilion-600 hover:underline">Contact page</Link>.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
