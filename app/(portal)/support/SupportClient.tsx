'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
    HelpCircle,
    MessageCircle,
    Phone,
    Mail,
    Clock,
    Search,
    Send,
    ChevronRight,
    ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendContactMessage } from "@/app/actions/support";
import { toast } from '@/lib/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const FAQS = [
    {
        id: '1',
        category: 'Account',
        question: 'How do I reset my password?',
        answer: 'You can reset your password by clicking "Forgot Password" on the login page. Follow the instructions sent to your registered email address.',
    },
    {
        id: '2',
        category: 'Transfers',
        question: 'How long do transfers take?',
        answer: 'Internal transfers between JP Heritage accounts are instant. External transfers typically take 1-3 business days.',
    },
    {
        id: '3',
        category: 'Cards',
        question: 'What should I do if my card is lost or stolen?',
        answer: 'Immediately freeze your card through the Cards page or call our 24/7 support line at 1-800-JP-HERIT. We\'ll help you secure your account and order a replacement card.',
    },
    {
        id: '4',
        category: 'Security',
        question: 'How do I enable two-factor authentication?',
        answer: 'Go to Settings > Security and toggle on Two-Factor Authentication. You\'ll receive a verification code via SMS or email for each login.',
    },
    {
        id: '5',
        category: 'Bills',
        question: 'Can I schedule recurring bill payments?',
        answer: 'Yes! When adding a biller, you can enable AutoPay to automatically pay bills on their due date each month.',
    },
];

export default function SupportClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const [contactForm, setContactForm] = useState({
        subject: '',
        category: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredFaqs = FAQS.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmitContact = async () => {
        if (!contactForm.subject || !contactForm.category || !contactForm.message) {
            toast.warn({ title: 'Please complete all fields' });
            return;
        }
        setIsSubmitting(true);
        try {
            await sendContactMessage(contactForm);
            toast.success({ title: 'Message sent', description: "We'll respond within 24 hours." });
            setContactForm({ subject: '', category: '', message: '' });
        } catch {
            toast.error({ title: 'Failed to send message', description: 'Please try again or call us directly.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 animate-fade-in-up">

            <div className="text-center py-6 space-y-2">
                <h1 className="text-4xl font-playfair font-bold text-charcoal">How can we help you?</h1>
                <p className="text-muted-foreground text-lg">Search our knowledge base or get in touch with support.</p>

                <div className="max-w-xl mx-auto pt-4 relative">
                    <Search className="absolute left-3 top-7 h-5 w-5 text-muted-foreground" />
                    <Input
                        className="pl-10 h-12 text-lg shadow-sm"
                        placeholder="Search for answers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Options */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-vintage-green">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-vintage-green/10 flex items-center justify-center text-vintage-green">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Call Us</h3>
                            <p className="text-muted-foreground text-sm">24/7 Priority Support</p>
                        </div>
                        <p className="font-mono text-charcoal font-semibold">1-800-AURUM-VAULT</p>
                        <Button variant="outline" size="small" className="w-full" onClick={() => { window.location.href = 'tel:+18002878664'; }}>Call Now</Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-vintage-gold">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-vintage-gold/10 flex items-center justify-center text-vintage-gold">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Live Chat</h3>
                            <p className="text-muted-foreground text-sm">Mon-Fri 9AM-6PM EST</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Available during business hours</p>
                        <Button variant="outline" size="small" className="w-full" onClick={() => toast.info({ title: 'Live Chat', description: 'Launching soon. Use phone or email for immediate help.' })}>Start Chat</Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-400">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Email Support</h3>
                            <p className="text-muted-foreground text-sm">Response within 24h</p>
                        </div>
                        <p className="font-mono text-charcoal font-semibold">support@jpheritage.com</p>
                        <Button variant="outline" size="small" className="w-full" onClick={() => { window.location.href = 'mailto:support@jpheritage.com'; }}>Send Email</Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">

                {/* FAQs Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="w-5 h-5 text-vintage-green" />
                        <h2 className="text-2xl font-bold font-playfair">Frequently Asked Questions</h2>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq) => (
                                <AccordionItem key={faq.id} value={faq.id}>
                                    <AccordionTrigger className="text-left font-medium text-charcoal">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))
                        ) : (
                            <div className="p-8 text-center border rounded-lg bg-muted/20">
                                <p className="text-muted-foreground">No questions found matching your search.</p>
                            </div>
                        )}
                    </Accordion>
                </div>

                {/* Contact Form Column */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Send className="w-5 h-5 text-vintage-green" />
                        <h2 className="text-2xl font-bold font-playfair">Send a Message</h2>
                    </div>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input
                                    placeholder="Brief description"
                                    value={contactForm.subject}
                                    onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={contactForm.category} onValueChange={v => setContactForm({ ...contactForm, category: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Issue Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="account">Account Issues</SelectItem>
                                        <SelectItem value="billing">Billing & Payments</SelectItem>
                                        <SelectItem value="technical">Technical Support</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea
                                    placeholder="Describe your issue in detail..."
                                    className="min-h-[120px]"
                                    value={contactForm.message}
                                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                />
                            </div>

                            <Button onClick={handleSubmitContact} disabled={isSubmitting} className="w-full bg-vintage-green hover:bg-vintage-green-dark text-white">
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-none shadow-inner">
                        <CardContent className="p-6 space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" /> Support Hours
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex justify-between">
                                    <span>Phone & Email</span>
                                    <span className="font-medium text-charcoal">24/7</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Live Chat</span>
                                    <span className="font-medium text-charcoal">M-F, 9am - 6pm</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
