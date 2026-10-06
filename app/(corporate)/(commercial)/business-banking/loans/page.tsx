import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, Briefcase, FileText, Building2, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Business Loans & Lines | Business Banking',
    description: `Get the capital you need to scale your operations with ${BRAND.legalName} Business Loans, Lines of Credit, and Commercial Mortgages.`,
};

export default function BusinessLoansPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/business-loans.jpg" alt="Business Loans" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Business Lending</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Capital when and where you need it most
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            From SBA loans to commercial real estate mortgages and equipment financing, our dedicated business lenders will help structure the right credit facility to scale your operations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.contact} variant="primary" size="lg">
                                Speak with a lender
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINANCING OPTIONS */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Financing to fit your goals</h2>
                        <p className="text-body-lg text-ink-700">Whether it's managing cash flow or purchasing real estate, we have a solution.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Lines of Credit */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <FileText className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Lines of Credit</h3>
                                <p className="text-body text-ink-700 h-24">Manage short-term cash flow and handle unexpected expenses with a revolving line of credit you can draw from at any time.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Lines starting at $10,000 up to $2M</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Only pay interest on the amount you draw</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Unsecured and secured options available</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.contact} variant="primary" className="w-full justify-center">Learn more</Button>
                        </div>

                        {/* Term Loans */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-pine-100 flex items-center justify-center mb-6">
                                <Briefcase className="w-6 h-6 text-pine-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Term Loans & Equipment</h3>
                                <p className="text-body text-ink-700 h-24">Finance the purchase of vehicles, heavy machinery, or fund long-term business expansion with predictable fixed payments.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Up to 100% financing for equipment</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Predictable monthly payments</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Terms up to 84 months depending on collateral</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.contact} variant="primary" className="w-full justify-center">Learn more</Button>
                        </div>

                        {/* Real Estate */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-ink-200 flex items-center justify-center mb-6">
                                <Building2 className="w-6 h-6 text-ink-900" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Commercial Real Estate</h3>
                                <p className="text-body text-ink-700 h-24">Purchase, refinance, or expand your owner-occupied or investment properties with competitive commercial mortgage rates.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Loans starting at $250,000</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Terms up to 10 years with longer amortizations</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">SBA 504 and 7(a) loan programs</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.contact} variant="primary" className="w-full justify-center">Learn more</Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
