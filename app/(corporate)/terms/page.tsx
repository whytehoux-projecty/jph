import Link from 'next/link';

export const metadata = {
    title: 'Terms and Conditions | JP Heritage Bank',
    description: 'Terms and Conditions for JP Heritage Bank E-Banking services.',
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-off-white py-20 px-4">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-4xl font-playfair font-bold text-charcoal mb-2">Terms and Conditions</h1>
                <p className="text-sm text-charcoal-light mb-10">E-Banking Agreement — Effective January 1, 2024</p>

                <div className="prose prose-slate max-w-none space-y-8 text-charcoal-light leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">1. Acceptance of Terms</h2>
                        <p>By registering for and using JP Heritage Bank E-Banking services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use our online banking services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">2. Account Access and Security</h2>
                        <p>You are responsible for maintaining the confidentiality of your account credentials, including your username and password. You agree to notify JP Heritage Bank immediately upon discovering any unauthorized use of your account or any security breach.</p>
                        <p className="mt-3">JP Heritage Bank will never ask for your password via email, telephone, or text message. Report any such requests immediately to our security team.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">3. Electronic Transactions</h2>
                        <p>All transactions initiated through E-Banking are subject to verification and may be delayed, suspended, or rejected in our sole discretion for security purposes. Transfer limits apply as specified in your account agreement.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">4. FDIC Insurance</h2>
                        <p>Deposits held at JP Heritage Bank are insured by the Federal Deposit Insurance Corporation (FDIC) up to $250,000 per depositor, per insured bank, for each account ownership category.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">5. Limitation of Liability</h2>
                        <p>JP Heritage Bank shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of E-Banking services, including but not limited to loss of profits, data, or goodwill.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">6. Modifications to Terms</h2>
                        <p>JP Heritage Bank reserves the right to modify these terms at any time. We will provide notice of material changes by email or through a prominent notice on our website. Continued use of E-Banking services after such changes constitutes your acceptance of the new terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">7. Governing Law</h2>
                        <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">8. Contact</h2>
                        <p>For questions about these terms, contact us at <a href="mailto:legal@jpheritage.com" className="text-heritage-navy hover:underline">legal@jpheritage.com</a> or visit our <Link href="/contact" className="text-heritage-navy hover:underline">Contact page</Link>.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
