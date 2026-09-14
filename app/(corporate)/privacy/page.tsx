import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | JP Heritage Bank',
    description: 'Privacy Policy for JP Heritage Bank — how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-off-white py-20 px-4">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-4xl font-playfair font-bold text-charcoal mb-2">Privacy Policy</h1>
                <p className="text-sm text-charcoal-light mb-10">Last updated: January 1, 2024</p>

                <div className="prose prose-slate max-w-none space-y-8 text-charcoal-light leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you open an account, make a transaction, or contact us for support. This includes:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Personal identification information (name, date of birth, SSN)</li>
                            <li>Contact information (address, phone number, email)</li>
                            <li>Financial information (account numbers, transaction history)</li>
                            <li>Device and usage information when you use our digital services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">2. How We Use Your Information</h2>
                        <p>JP Heritage Bank uses the information we collect to:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Provide, operate, and maintain our banking services</li>
                            <li>Process transactions and send related information</li>
                            <li>Verify your identity and prevent fraudulent activity</li>
                            <li>Comply with legal and regulatory requirements</li>
                            <li>Send account notices and service updates</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">3. Information Sharing</h2>
                        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Service providers who assist us in operating our business</li>
                            <li>Regulatory authorities and law enforcement as required by law</li>
                            <li>Financial institutions involved in processing your transactions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">4. Data Security</h2>
                        <p>We implement industry-standard security measures including 256-bit AES encryption, multi-factor authentication, and continuous monitoring to protect your personal and financial information against unauthorized access, alteration, or disclosure.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">5. Data Retention</h2>
                        <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Financial records are typically retained for a minimum of 7 years as required by applicable law.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">6. Your Rights</h2>
                        <p>You have the right to access, correct, or request deletion of your personal information subject to applicable law and our regulatory obligations. To exercise these rights, contact us at <a href="mailto:privacy@jpheritage.com" className="text-heritage-navy hover:underline">privacy@jpheritage.com</a>.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">7. Cookies and Tracking</h2>
                        <p>Our website uses cookies and similar technologies to improve your experience, analyze usage patterns, and maintain security. You may configure your browser to refuse cookies, though this may affect the functionality of our online services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-charcoal mb-3">8. Contact Us</h2>
                        <p>For privacy-related inquiries, contact our Data Protection Officer at <a href="mailto:privacy@jpheritage.com" className="text-heritage-navy hover:underline">privacy@jpheritage.com</a> or visit our <Link href="/contact" className="text-heritage-navy hover:underline">Contact page</Link>.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
