import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, CreditCard, Smartphone, ShieldCheck, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Merchant Services | Business Banking',
    description: `Accept payments seamlessly online, in-store, or on the go with ${BRAND.legalName} Merchant Services. Next-day funding and secure processing.`,
};

export default function MerchantServicesPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/merchant.jpg" alt="Merchant Services" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Merchant Services</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Accept every payment. Never miss a sale.
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            Heritage Trust Merchant Services provides comprehensive point-of-sale and online gateway solutions with next-day funding to keep your cash flowing smoothly.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.contact} variant="primary" size="lg">
                                Talk to a specialist
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOLUTIONS */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Payment solutions for how you do business</h2>
                        <p className="text-body-lg text-ink-700">From a single terminal to complex eCommerce integrations.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Point of Sale */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <CreditCard className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">In-Store Terminals & POS</h3>
                                <p className="text-body text-ink-700 h-24">Process payments securely at the counter with modern smart terminals that accept EMV chips and contactless (NFC) payments.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Accept Apple Pay® and Google Pay™</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Integration with major POS software</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Next-day funding for approved transactions</span></li>
                            </ul>
                        </div>

                        {/* Online & eCommerce */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-pine-100 flex items-center justify-center mb-6">
                                <CheckCircle className="w-6 h-6 text-pine-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Online & eCommerce</h3>
                                <p className="text-body text-ink-700 h-24">Power your online store with a secure payment gateway. Process recurring billing, virtual terminal payments, and online orders seamlessly.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Robust APIs for custom web integrations</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Secure card-on-file tokenization</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Automated invoicing and recurring billing</span></li>
                            </ul>
                        </div>

                        {/* Mobile */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-ink-200 flex items-center justify-center mb-6">
                                <Smartphone className="w-6 h-6 text-ink-900" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Mobile Processing</h3>
                                <p className="text-body text-ink-700 h-24">Take your business anywhere. Turn your smartphone or tablet into a secure point-of-sale device.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Bluetooth card readers for iOS and Android</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Digital receipts via email or SMS</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Inventory and tip tracking included</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
