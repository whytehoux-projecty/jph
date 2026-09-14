'use client';

import { useState } from 'react';
import { Button } from '@/components/commercial-ui/Button';
import { Input } from '@/components/forms/Input';
import { Card, CardContent } from '@/components/commercial-ui/Card';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api-client';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
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
        if (!formData.subject) newErrors.subject = 'Subject is required';
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
            await api.submitContactForm(formData);
            setIsSuccess(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
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

    return (
        <main className="min-h-screen bg-off-white">
            {/* Hero Section */}
            <section className="bg-charcoal text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/luxury-pattern-dark.png')] opacity-10" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-6">Contact Us</h1>
                    <p className="text-xl text-stone-300 max-w-2xl mx-auto font-light">
                        Our dedicated concierge team is available 24/7 to assist with your banking needs.
                    </p>
                </div>
            </section>

            <section className="py-20 container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-playfair font-bold text-charcoal mb-4">Get in Touch</h2>
                            <p className="text-charcoal-light leading-relaxed">
                                Whether you&apos;re interested in opening an account or need assistance with existing services, we&apos;re here to provide exceptional support defined by discretion and efficiency.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-none shadow-vintage hover:shadow-vintage-lg transition-shadow bg-white">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="p-3 bg-heritage-navy/10 rounded-full text-heritage-navy">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-charcoal mb-1">Private Client Line</h3>
                                        <p className="text-charcoal-light mb-1">1-800-574-3748</p>
                                        <p className="text-xs text-charcoal-lighter">Available 24/7 for account holders</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-vintage hover:shadow-vintage-lg transition-shadow bg-white">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="p-3 bg-heritage-navy/10 rounded-full text-heritage-navy">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-charcoal mb-1">Email Support</h3>
                                        <p className="text-charcoal-light mb-1">support@jpheritage.com</p>
                                        <p className="text-xs text-charcoal-lighter">Response within 2 hours</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-vintage hover:shadow-vintage-lg transition-shadow bg-white">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="p-3 bg-heritage-navy/10 rounded-full text-heritage-navy">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-charcoal mb-1">Global Headquarters</h3>
                                        <p className="text-charcoal-light">
                                            1 Heritage Plaza<br />
                                            New York, NY 10005
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-none shadow-vintage-lg border border-faded-gray/50">
                        {isSuccess ? (
                            <div className="text-center py-12 space-y-4">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-playfair font-bold text-charcoal">Message Sent</h3>
                                <p className="text-charcoal-light">
                                    Thank you for contacting JP Heritage Bank. A member of our concierge team will respond to your inquiry shortly.
                                </p>
                                <Button
                                    onClick={() => setIsSuccess(false)}
                                    variant="outline"
                                    className="mt-6"
                                    aria-label="Send another message"
                                >
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-xl font-semibold text-charcoal mb-6 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-heritage-navy" />
                                    Send us a Message
                                </h3>

                                {errors.submit && (
                                    <div className="p-4 bg-red-50 text-red-700 text-sm rounded-none border border-red-100">
                                        {errors.submit}
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        error={errors.name}
                                        placeholder="John Doe"
                                    />
                                    <Input
                                        label="Phone (Optional)"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    error={errors.email}
                                    placeholder="john@example.com"
                                />

                                <Input
                                    label="Subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    error={errors.subject}
                                    placeholder="Account Inquiry"
                                />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-charcoal">Message</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={5}
                                        className={`w-full rounded-none border ${errors.message ? 'border-red-500' : 'border-faded-gray'} p-3 text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-heritage-navy/50 transition-all`}
                                        placeholder="How can we assist you today?"
                                    />
                                    {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="large"
                                    loading={isSubmitting}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Message
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
