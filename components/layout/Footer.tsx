import Link from 'next/link';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';
import { BANK_INFO, ROUTES } from '@/lib/constants';

// Social icons — inline SVGs (lucide-react dropped brand icons in v0.400+)
function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
        </svg>
    );
}
function InstagramIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
        </svg>
    );
}
function TwitterIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
    );
}
function LinkedinIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
    );
}

const footerSections = [
    {
        heading: 'Personal Banking',
        links: [
            { name: 'Checking Accounts', href: ROUTES.personalBanking },
            { name: 'Savings Accounts', href: ROUTES.personalBanking },
            { name: 'Credit Cards', href: ROUTES.personalBanking },
            { name: 'Personal Loans', href: ROUTES.personalBanking },
            { name: 'Mortgages', href: ROUTES.personalBanking },
        ],
    },
    {
        heading: 'Business Banking',
        links: [
            { name: 'Business Checking', href: ROUTES.businessBanking },
            { name: 'Merchant Services', href: ROUTES.businessBanking },
            { name: 'Business Loans', href: ROUTES.businessBanking },
            { name: 'Payroll Services', href: ROUTES.businessBanking },
            { name: 'Treasury Management', href: ROUTES.businessBanking },
        ],
    },
    {
        heading: 'Heritage Vault',
        links: [
            { name: 'Sign In', href: ROUTES.vault },
            { name: 'Open Account', href: ROUTES.apply },
            { name: 'Mobile Banking', href: ROUTES.vault },
            { name: 'Wire Transfers', href: ROUTES.vault },
            { name: 'Account Statements', href: ROUTES.vault },
        ],
    },
    {
        heading: 'Company',
        links: [
            { name: 'About JP Heritage', href: ROUTES.about },
            { name: 'Leadership', href: `${ROUTES.about}#leadership` },
            { name: 'Careers', href: '/careers' },
            { name: 'Press & Media', href: '/press' },
            { name: 'Investor Relations', href: '/investors' },
        ],
    },
];

const legalLinks = [
    { name: 'Privacy Policy', href: ROUTES.privacy },
    { name: 'Terms of Use', href: ROUTES.terms },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Cookie Preferences', href: '/cookies' },
    { name: 'Security Center', href: '/security' },
];

const socialLinks = [
    { icon: FacebookIcon, label: 'Facebook', href: '#' },
    { icon: InstagramIcon, label: 'Instagram', href: '#' },
    { icon: TwitterIcon, label: 'X (Twitter)', href: '#' },
    { icon: LinkedinIcon, label: 'LinkedIn', href: '#' },
];

export function Footer({ isAbsolute }: { isAbsolute?: boolean } = {}) {
    if (isAbsolute) {
        return (
            <footer className="absolute bottom-0 left-0 right-0 z-20 bg-[#091C38]/80 backdrop-blur-sm text-white py-3">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 max-w-7xl">
                    <p className="text-xs text-white/40 text-center">
                        &copy; {new Date().getFullYear()} JP Heritage Bank N.A. All rights reserved. Member FDIC.
                    </p>
                    <div className="flex gap-4">
                        <a href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors">Privacy</a>
                        <a href="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">Terms</a>
                        <a href="/security" className="text-xs text-white/40 hover:text-white/70 transition-colors">Security</a>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-[#091C38] text-white">
            {/* Main footer content */}
            <div className="container mx-auto px-6 py-16 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
                    {/* Brand column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#B8960C] flex items-center justify-center shadow-gold-glow flex-shrink-0">
                                <Shield className="w-5 h-5 text-white" strokeWidth={2} />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] font-medium text-[#B8960C] tracking-[0.2em] uppercase">JP Heritage</span>
                                <span className="text-lg font-bold text-white tracking-wide font-playfair">BANK</span>
                            </div>
                        </div>

                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            Serving generations of families and businesses since {BANK_INFO.founded}. Your prosperity is our purpose.
                        </p>

                        {/* Contact info */}
                        <div className="space-y-3">
                            <a href={`tel:${BANK_INFO.phone}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-[#D4AF7A] transition-colors group">
                                <Phone className="w-4 h-4 text-[#B8960C] flex-shrink-0" />
                                <span>{BANK_INFO.phone}</span>
                            </a>
                            <a href={`mailto:${BANK_INFO.email}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-[#D4AF7A] transition-colors">
                                <Mail className="w-4 h-4 text-[#B8960C] flex-shrink-0" />
                                <span>{BANK_INFO.email}</span>
                            </a>
                            <div className="flex items-start gap-3 text-sm text-white/60">
                                <MapPin className="w-4 h-4 text-[#B8960C] flex-shrink-0 mt-0.5" />
                                <span>{BANK_INFO.address}</span>
                            </div>
                        </div>

                        {/* Social links */}
                        <div className="flex gap-3">
                            {socialLinks.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-none bg-white/10 hover:bg-[#B8960C] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav columns */}
                    {footerSections.map((section) => (
                        <div key={section.heading} className="space-y-4">
                            <h3 className="text-xs font-semibold text-[#B8960C] uppercase tracking-widest">{section.heading}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="container mx-auto px-6 py-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-white/40 text-center md:text-left">
                            &copy; {new Date().getFullYear()} JP Heritage Bank N.A. All rights reserved. {BANK_INFO.fdic}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 justify-center">
                            {legalLinks.map((link) => (
                                <Link key={link.name} href={link.href} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
