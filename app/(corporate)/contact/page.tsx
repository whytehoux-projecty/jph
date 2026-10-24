'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api-client';
import { BRAND, PUBLIC_CONTACT } from '@/src/content/facts';
import { PageHero, FactList } from '@/components/commercial-ui/Isobath';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

function ContactForm() {
    const searchParams = useSearchParams();
    const initialTopic = searchParams.get('topic') || '';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        topic: initialTopic,
        message: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.topic) newErrors.topic = 'Topic is required';
        if (!formData.message) newErrors.message = 'Message is required';
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            await api.submitContactForm({
                name: formData.name,
                email: formData.email,
                subject: formData.topic,
                message: formData.message,
            });
            setIsSuccess(true);
            setFormData({ name: '', email: '', phone: '', topic: '', message: '' });
        } catch (error) {
            console.error('Contact submission error:', error);
            const err = error as { response?: { data?: { message?: string } } };
            setErrors({
                submit: err.response?.data?.message || 'Failed to submit query. Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-paper-50 p-8 rounded border border-paper-200 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 bg-paper-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-6 h-6 text-pine-700" />
                </div>
                <h2 className="text-h3 font-sans font-semibold text-ink-900 mb-2">Message sent</h2>
                <p className="text-body text-ink-700 mb-8 max-w-sm">
                    Thank you for reaching out to {BRAND.shortName}. A member of our team will respond to your inquiry shortly.
                </p>
                <Button
                    onClick={() => setIsSuccess(false)}
                    variant="secondary"
                >
                    Send another message
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-paper-50 p-8 rounded border border-paper-200 space-y-6">
            <div>
                <h2 className="text-h4 font-sans font-semibold text-ink-900 mb-1">Send a message</h2>
                <p className="text-small text-ink-500">We aim to reply within one business day. Please don’t include passwords or full card numbers.</p>
            </div>

            {errors.submit && (
                <div className="p-4 bg-vermilion-600/10 text-vermilion-700 text-small rounded border border-vermilion-600/20">
                    {errors.submit}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="topic" className="block text-small font-medium text-ink-900">Topic</label>
                    <select
                        id="topic"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.topic ? 'border-alert' : 'border-paper-300'}`}
                    >
                        <option value="" disabled>Select a topic</option>
                        <option value="personal">Personal banking</option>
                        <option value="business">Business banking</option>
                        <option value="wealth">Wealth management</option>
                        <option value="access">Online access or password reset</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.topic && <p className="text-xs text-alert">{errors.topic}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="block text-small font-medium text-ink-900">Full name</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.name ? 'border-alert' : 'border-paper-300'}`}
                        />
                        {errors.name && <p className="text-xs text-alert">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="phone" className="block text-small font-medium text-ink-900">Phone (optional)</label>
                        <input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-12 rounded border border-paper-300 bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-small font-medium text-ink-900">Email address</label>
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.email ? 'border-alert' : 'border-paper-300'}`}
                    />
                    {errors.email && <p className="text-xs text-alert">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="message" className="block text-small font-medium text-ink-900">Message</label>
                    <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        className={`w-full rounded border bg-paper-50 p-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow resize-none ${errors.message ? 'border-alert' : 'border-paper-300'}`}
                    />
                    {errors.message && <p className="text-xs text-alert">{errors.message}</p>}
                </div>
            </div>

            <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Sending...' : 'Send message'}
            </Button>
        </form>
    );
}

export default function ContactPage() {
    return (
        <>
            <PageHero
                label="Contact and locations"
                title={
                    <>
                        Reach a person, <span className="ht-em">not a queue.</span>
                    </>
                }
                lead="Tell us what you need and the right desk will reply within one business day. If you are already a client, Heritage Vault secure messages are the fastest route."
                breadcrumb={[
                    { href: ROUTES.home, label: 'Home' },
                    { href: ROUTES.contact, label: 'Contact' },
                ]}
            />

            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                        {/* Form */}
                        <div className="lg:col-span-7 lg:order-last">
                            <Suspense fallback={<div className="bg-paper-50 p-8 border border-paper-200 h-[500px] flex items-center justify-center text-ink-500">Loading form…</div>}>
                                <ContactForm />
                            </Suspense>
                        </div>

                        {/* Routing and direct contact */}
                        <div className="lg:col-span-5 space-y-12">
                            <ul className="border-t border-ink-900">
                                <li className="border-b border-paper-200 py-5">
                                    <p className="text-h4 text-ink-900 mb-1">New to {BRAND.shortName}?</p>
                                    <p className="text-body text-ink-700 mb-3">Open an account online, or find the right one first.</p>
                                    <div className="flex flex-wrap gap-x-6">
                                        <Link href={ROUTES.apply} className="inline-flex items-center gap-2 text-small font-semibold text-petrol underline underline-offset-4">
                                            Open an account <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                        </Link>
                                        <Link href="/account-finder" className="inline-flex items-center text-small font-semibold text-petrol underline underline-offset-4">
                                            Account Finder
                                        </Link>
                                    </div>
                                </li>
                                <li className="border-b border-paper-200 py-5">
                                    <p className="text-h4 text-ink-900 mb-1">Existing client</p>
                                    <p className="text-body text-ink-700 mb-3">Help with your account or Heritage Vault access.</p>
                                    <Link href={ROUTES.login} className="inline-flex items-center gap-2 text-small font-semibold text-petrol underline underline-offset-4">
                                        Sign in to Heritage Vault <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                </li>
                                <li className="border-b border-paper-200 py-5">
                                    <p className="text-h4 text-ink-900 mb-1">Suspect fraud?</p>
                                    <p className="text-body text-ink-700 mb-3">Lock your card in Heritage Vault, then call the fraud line.</p>
                                    <Link href={`${ROUTES.security}#report`} className="inline-flex items-center gap-2 text-small font-semibold text-petrol underline underline-offset-4">
                                        What to do now <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                </li>
                            </ul>

                            <div>
                                <h2 className="text-h4 font-sans font-semibold text-ink-900 mb-4">Direct contact</h2>
                                <FactList
                                    items={[
                                        { term: 'Customer service', value: PUBLIC_CONTACT.phone },
                                        { term: 'Fraud line, 24 hours', value: PUBLIC_CONTACT.fraudPhone },
                                        { term: 'Email', value: PUBLIC_CONTACT.email },
                                    ]}
                                    caption="Bracketed values are placeholders until the bank confirms its verified contact details."
                                />
                            </div>

                            <div id="locations" className="scroll-mt-24">
                                <h2 className="text-h4 font-sans font-semibold text-ink-900 mb-4">Offices</h2>
                                <div className="grid gap-4">
                                    {[
                                        { name: 'Head office', address: PUBLIC_CONTACT.address, hours: 'Mon–Fri 9:00 AM – 5:00 PM' },
                                        { name: '[Branch name]', address: '[Branch address]', hours: 'Mon–Fri 9:00 AM – 5:00 PM · Sat 9:00 AM – 1:00 PM' },
                                    ].map((o) => (
                                        <div key={o.name} className="border border-paper-200 p-5">
                                            <p className="text-body font-semibold text-ink-900">{o.name}</p>
                                            <address className="not-italic text-small text-ink-700">{o.address}</address>
                                            <p className="mt-2 text-small text-ink-500 tabular">{o.hours}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link href={ROUTES.locations} className="mt-4 inline-flex items-center gap-2 text-small font-semibold text-petrol underline underline-offset-4">
                                    All branches and ATMs <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
