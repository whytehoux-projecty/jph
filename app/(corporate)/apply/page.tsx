'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { Input } from '@/components/forms/Input';
import { Card, CardContent } from '@/components/commercial-ui/Card';
import { CheckCircle, Shield, Briefcase, Mail, Phone, MapPin, User } from 'lucide-react';
import { requestAccountOpening } from '@/app/(corporate)/actions';

export default function ApplicationPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        applicationType: 'PERSONAL',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        zipCode: '',
        desiredAccountType: '',
        isExistingCustomer: false,
        isUsCitizenOrResident: false,
        consentComms: false,
        consentPrivacy: false,
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.zipCode) newErrors.zipCode = 'Zip/Postal code is required';
        
        if (!formData.desiredAccountType) newErrors.desiredAccountType = 'Account type is required';
        
        if (!formData.consentComms) newErrors.consentComms = 'You must consent to communications';
        if (!formData.consentPrivacy) newErrors.consentPrivacy = 'You must acknowledge the privacy policy';

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await requestAccountOpening(formData);
            setSuccess(true);
        } catch (error) {
            console.error('Application error:', error);
            setErrors({
                submit: 'Failed to submit request. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-off-white py-20 px-4">
                <div className="container mx-auto max-w-2xl">
                    <Card className="text-center p-12 shadow-vintage-lg border-none bg-white">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-playfair font-bold text-charcoal mb-4">Request Received</h1>
                        <p className="text-charcoal-light mb-8 text-lg">
                            Thank you for your interest in JP Heritage Bank. We've received your request and will review your preliminary eligibility. If approved, you will receive instructions on how to complete the full registration.
                        </p>
                        <Button onClick={() => router.push('/')} variant="primary" size="large">
                            Return Home
                        </Button>
                    </Card>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-off-white flex">
            {/* Left Sidebar - Brand & Info */}
            <div className="hidden lg:flex w-1/3 bg-heritage-navy text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-vintage-gold/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-vintage-gold/5 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
                
                <div className="relative z-10 space-y-8">
                    <div>
                        <Shield className="w-12 h-12 text-vintage-gold mb-6" />
                        <h1 className="text-4xl font-playfair font-bold mb-4">Begin Your Journey</h1>
                        <p className="text-blue-100/80 leading-relaxed text-lg">
                            Apply for a JP Heritage Bank account in minutes. We provide secure, global banking tailored to your unique financial needs.
                        </p>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-white/10">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <span className="font-semibold text-vintage-gold">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Request Application</h3>
                                <p className="text-blue-100/70 text-sm">Fill out this quick form to determine preliminary eligibility.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <span className="font-semibold text-vintage-gold">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Bank Approval</h3>
                                <p className="text-blue-100/70 text-sm">Our team will review your request and approve qualified applicants.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <span className="font-semibold text-vintage-gold">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Full Registration</h3>
                                <p className="text-blue-100/70 text-sm">Complete our secure KYC process and fund your new account.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="relative z-10 text-sm text-blue-100/50">
                    &copy; {new Date().getFullYear()} JP Heritage Bank. Member FDIC.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <div className="lg:hidden mb-8 text-center">
                        <Shield className="w-10 h-10 text-heritage-navy mx-auto mb-4" />
                        <h1 className="text-3xl font-playfair font-bold text-charcoal">Open an Account</h1>
                        <p className="text-charcoal-light mt-2">Secure, global banking tailored to you</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {errors.submit && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
                                {errors.submit}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-2">
                                <h2 className="text-xl font-semibold text-charcoal">Personal Information</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <Input
                                    label="First Name"
                                    value={formData.firstName}
                                    onChange={(e) => updateField('firstName', e.target.value)}
                                    error={errors.firstName}
                                    icon={<User className="w-4 h-4" />}
                                />
                                <Input
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => updateField('lastName', e.target.value)}
                                    error={errors.lastName}
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    error={errors.email}
                                    icon={<Mail className="w-4 h-4" />}
                                />
                                <Input
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    error={errors.phone}
                                    icon={<Phone className="w-4 h-4" />}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Zip/Postal Code"
                                        value={formData.zipCode}
                                        onChange={(e) => updateField('zipCode', e.target.value)}
                                        error={errors.zipCode}
                                        icon={<MapPin className="w-4 h-4" />}
                                        helperText="Used to verify regional eligibility"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-2">
                                <h2 className="text-xl font-semibold text-charcoal">Account Preferences & Eligibility</h2>
                            </div>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-charcoal">Desired Account Type</label>
                                    <select
                                        className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-heritage-navy/50 transition-shadow"
                                        value={formData.desiredAccountType}
                                        onChange={(e) => updateField('desiredAccountType', e.target.value)}
                                    >
                                        <option value="">Select Account Type</option>
                                        <option value="Everyday Checking">Everyday Checking</option>
                                        <option value="High-Yield Savings">High-Yield Savings</option>
                                        <option value="Certificate of Deposit">Certificate of Deposit</option>
                                    </select>
                                    {errors.desiredAccountType && <p className="text-xs text-red-500 mt-1">{errors.desiredAccountType}</p>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-3 p-4 border border-gray-100 bg-gray-50/50 rounded-xl">
                                        <label className="text-sm font-medium text-charcoal block">Are you an existing customer?</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.isExistingCustomer ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                                    {formData.isExistingCustomer && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <input type="radio" className="hidden" checked={formData.isExistingCustomer} onChange={() => updateField('isExistingCustomer', true)} />
                                                <span className="text-sm">Yes</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!formData.isExistingCustomer ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                                    {!formData.isExistingCustomer && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <input type="radio" className="hidden" checked={!formData.isExistingCustomer} onChange={() => updateField('isExistingCustomer', false)} />
                                                <span className="text-sm">No</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-4 border border-gray-100 bg-gray-50/50 rounded-xl">
                                        <label className="text-sm font-medium text-charcoal block">Are you a U.S. Citizen or Resident Alien?</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.isUsCitizenOrResident ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                                    {formData.isUsCitizenOrResident && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <input type="radio" className="hidden" checked={formData.isUsCitizenOrResident} onChange={() => updateField('isUsCitizenOrResident', true)} />
                                                <span className="text-sm">Yes</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!formData.isUsCitizenOrResident ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                                    {!formData.isUsCitizenOrResident && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <input type="radio" className="hidden" checked={!formData.isUsCitizenOrResident} onChange={() => updateField('isUsCitizenOrResident', false)} />
                                                <span className="text-sm">No</span>
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Used for basic KYC routing</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-2">
                                <h2 className="text-xl font-semibold text-charcoal">Consent</h2>
                            </div>
                            <div className="space-y-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="pt-0.5">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.consentComms ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                            {formData.consentComms && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={formData.consentComms} onChange={(e) => updateField('consentComms', e.target.checked)} />
                                    <div>
                                        <span className="text-sm text-charcoal leading-tight">I consent to receive email and SMS communications regarding my application.</span>
                                        {errors.consentComms && <p className="text-xs text-red-500 mt-1">{errors.consentComms}</p>}
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="pt-0.5">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.consentPrivacy ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                            {formData.consentPrivacy && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={formData.consentPrivacy} onChange={(e) => updateField('consentPrivacy', e.target.checked)} />
                                    <div>
                                        <span className="text-sm text-charcoal leading-tight">I acknowledge the preliminary Privacy Policy and Terms of Use.</span>
                                        {errors.consentPrivacy && <p className="text-xs text-red-500 mt-1">{errors.consentPrivacy}</p>}
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-14 text-lg"
                                loading={isSubmitting}
                            >
                                Submit Request
                            </Button>
                            <p className="text-xs text-gray-400 text-center mt-4">
                                Your information is secured with bank-level encryption.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
