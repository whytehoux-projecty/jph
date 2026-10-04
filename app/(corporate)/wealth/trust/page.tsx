import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, Shield, FileText, Scale, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Trust Services | Wealth Management',
    description: `Protect your legacy with ${BRAND.legalName} Trust Services. Corporate trustee services and fiduciary management.`,
};

export default function TrustServicesPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/personal-hero.webp" alt="Trust Services" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Trust Services</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Protect what you've built
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            Heritage Trust serves as a steadfast corporate trustee, working impartially to manage your trust assets, carry out your wishes, and provide continuity for future generations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.contact} variant="primary" size="lg">
                                Connect with a trust officer
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Fiduciary excellence</h2>
                        <p className="text-body-lg text-ink-700">Impartial execution of your wishes with professional oversight.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Revocable */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Revocable Trusts</h3>
                                <p className="text-body text-ink-700 h-24">Maintain control over your assets while alive, with a seamless transition of management to us upon your passing or incapacitation.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Avoid the probate process</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Maintain privacy of your estate</span></li>
                            </ul>
                        </div>

                        {/* Irrevocable */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-pine-100 flex items-center justify-center mb-6">
                                <FileText className="w-6 h-6 text-pine-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Irrevocable Trusts</h3>
                                <p className="text-body text-ink-700 h-24">Remove assets from your taxable estate while providing for beneficiaries under specific terms you dictate.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Potential tax minimization strategies</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Asset protection for heirs</span></li>
                            </ul>
                        </div>

                        {/* Special Needs */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-ink-200 flex items-center justify-center mb-6">
                                <Scale className="w-6 h-6 text-ink-900" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Special Needs Trusts</h3>
                                <p className="text-body text-ink-700 h-24">Ensure a loved one with disabilities is financially supported without jeopardizing their eligibility for government assistance programs.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Preserve SSI and Medicaid eligibility</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Professional ongoing administration</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
