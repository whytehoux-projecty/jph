'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { Mail, Phone, MapPin, CheckCircle, ArrowRight, Building2, User } from 'lucide-react';
import { api } from '@/lib/api-client';
import { BRAND } from '@/src/content/facts';
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
                <h3 className="font-display text-h3 text-ink-900 mb-2">Message Sent</h3>
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
                <h3 className="font-display text-h4 text-ink-900 mb-1">Send a message</h3>
                <p className="text-small text-ink-500">We aim to respond to all inquiries within 1 business day.</p>
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
                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.topic ? 'border-vermilion-600' : 'border-paper-300'}`}
                    >
                        <option value="" disabled>Select a topic</option>
                        <option value="personal">Personal Banking Inquiry</option>
                        <option value="business">Business Banking Inquiry</option>
                        <option value="wealth">Wealth Management Inquiry</option>
                        <option value="access">Digital Access / Password Reset</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.topic && <p className="text-xs text-vermilion-600">{errors.topic}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="block text-small font-medium text-ink-900">Full name</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.name ? 'border-vermilion-600' : 'border-paper-300'}`}
                        />
                        {errors.name && <p className="text-xs text-vermilion-600">{errors.name}</p>}
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
                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.email ? 'border-vermilion-600' : 'border-paper-300'}`}
                    />
                    {errors.email && <p className="text-xs text-vermilion-600">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="message" className="block text-small font-medium text-ink-900">Message</label>
                    <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        className={`w-full rounded border bg-paper-50 p-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow resize-none ${errors.message ? 'border-vermilion-600' : 'border-paper-300'}`}
                    />
                    {errors.message && <p className="text-xs text-vermilion-600">{errors.message}</p>}
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
        <main className="bg-paper-100 min-h-screen">
            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section className="py-24 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="max-w-2xl">
                        <p className="label-mono text-vermilion-600 mb-4">Contact Us</p>
                        <h1 className="font-display text-display-lg text-ink-900 leading-tight mb-6">
                            How can we help?
                        </h1>
                        <p className="text-body-lg text-ink-700">
                            Our dedicated team is available to assist you with your banking needs. Whether you&apos;re a new or existing client, we&apos;re here to provide exceptional support.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── CONTENT ───────────────────────────────────────────────── */}
            <section className="py-24">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
                        
                        {/* Left Column: Direct Contact & Routing */}
                        <div className="space-y-12">
                            {/* Two blocks: New / Existing */}
                            <div className="space-y-6">
                                <div className="p-6 bg-paper-50 border border-paper-200 rounded group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded bg-paper-200 flex items-center justify-center shrink-0">
                                            <Building2 className="w-5 h-5 text-ink-900" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-h4 text-ink-900 mb-1">New to {BRAND.shortName}?</h3>
                                            <p className="text-body text-ink-700 mb-4">Ready to open an account or learn more about our services?</p>
                                            <Link
                                                href={ROUTES.apply}
                                                className="inline-flex items-center gap-2 text-small font-medium text-ink-900 underline underline-offset-2 hover:text-vermilion-600 transition-colors"
                                            >
                                                Open an account
                                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-paper-50 border border-paper-200 rounded group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded bg-paper-200 flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-ink-900" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-h4 text-ink-900 mb-1">Existing client</h3>
                                            <p className="text-body text-ink-700 mb-4">Need help with your account or Heritage Vault access?</p>
                                            <Link
                                                href={ROUTES.login}
                                                className="inline-flex items-center gap-2 text-small font-medium text-ink-900 underline underline-offset-2 hover:text-vermilion-600 transition-colors"
                                            >
                                                Sign in to Heritage Vault
                                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Direct Contact Info */}
                            <div>
                                <h3 className="font-display text-h4 text-ink-900 mb-6">Direct contact</h3>
                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <Phone className="w-5 h-5 text-ink-500 mt-0.5 shrink-0" aria-hidden="true" />
                                        <div>
                                            <p className="font-medium text-ink-900 text-body mb-0.5">Phone Support</p>
                                            <a href={`tel:${BRAND.phoneTel}`} className="text-body text-ink-700 hover:underline">{BRAND.phoneDisplay}</a>
                                            <p className="text-small text-ink-500 mt-1">Available 24/7</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <Mail className="w-5 h-5 text-ink-500 mt-0.5 shrink-0" aria-hidden="true" />
                                        <div>
                                            <p className="font-medium text-ink-900 text-body mb-0.5">Email</p>
                                            <a href={`mailto:${BRAND.email}`} className="text-body text-ink-700 hover:underline">{BRAND.email}</a>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <MapPin className="w-5 h-5 text-ink-500 mt-0.5 shrink-0" aria-hidden="true" />
                                        <div>
                                            <p className="font-medium text-ink-900 text-body mb-0.5">Global Headquarters</p>
                                            <address className="text-body text-ink-700 not-italic">
                                                {BRAND.address}
                                            </address>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right Column: Form */}
                        <div>
                            <Suspense fallback={<div className="bg-paper-50 p-8 rounded border border-paper-200 h-[500px] flex items-center justify-center text-ink-500">Loading form...</div>}>
                                <ContactForm />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
