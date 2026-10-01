'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { CheckCircle, Shield, ArrowRight, User, Building2, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { requestAccountOpening } from '@/app/(corporate)/actions';
import { BRAND } from '@/src/content/facts';

function ApplicationFormContent() {
    const searchParams = useSearchParams();
    const isSubmitted = searchParams.get('submitted') === 'true';

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [referenceId] = useState(() => `${BRAND.shortName.substring(0,3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`);

    const [formData, setFormData] = useState({
        applicationType: 'PERSONAL',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        zipCode: '',
        desiredAccountType: 'CHECKING',
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

    const nextStep = () => {
        const stepErrors: Record<string, string> = {};
        if (step === 1) {
            if (!formData.firstName) stepErrors.firstName = 'First name is required';
            if (!formData.lastName) stepErrors.lastName = 'Last name is required';
            if (!formData.email) stepErrors.email = 'Email is required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) stepErrors.email = 'Invalid email';
        }
        if (step === 2) {
            if (!formData.phone) stepErrors.phone = 'Phone is required';
            if (!formData.zipCode) stepErrors.zipCode = 'Zip/Postal code is required';
            if (!formData.desiredAccountType) stepErrors.desiredAccountType = 'Account type is required';
        }
        
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        
        setStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const stepErrors: Record<string, string> = {};
        if (!formData.consentComms) stepErrors.consentComms = 'You must consent to communications';
        if (!formData.consentPrivacy) stepErrors.consentPrivacy = 'You must acknowledge the privacy policy';

        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await requestAccountOpening(formData);
            window.location.href = '/apply?submitted=true';
        } catch (error) {
            console.error('Application error:', error);
            setErrors({ submit: 'Failed to submit request. Please try again.' });
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto bg-paper-100 flex items-center justify-center">
                <div className="max-w-xl w-full">
                    <div className="bg-paper-50 p-10 rounded border border-paper-200 shadow-sm text-center">
                        <div className="w-16 h-16 bg-paper-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-pine-700" aria-hidden="true" />
                        </div>
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Application Received</h2>
                        <p className="text-body-lg text-ink-700 mb-8">
                            Thank you for applying to {BRAND.legalName}. Your request has been securely routed to our onboarding team.
                        </p>
                        
                        <div className="bg-paper-100 p-6 rounded border border-paper-200 mb-8 text-left">
                            <p className="label-mono text-ink-500 mb-1">Reference ID</p>
                            <p className="font-mono text-xl font-medium text-ink-900 mb-6">{referenceId}</p>
                            
                            <p className="label-mono text-ink-500 mb-1">Next steps</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-body text-ink-700">
                                    <span className="font-medium text-ink-900 shrink-0">1.</span>
                                    <span>We will review your preliminary application within 1 business day.</span>
                                </li>
                                <li className="flex items-start gap-3 text-body text-ink-700">
                                    <span className="font-medium text-ink-900 shrink-0">2.</span>
                                    <span>If eligible, you will receive a secure registration link via email.</span>
                                </li>
                                <li className="flex items-start gap-3 text-body text-ink-700">
                                    <span className="font-medium text-ink-900 shrink-0">3.</span>
                                    <span>Complete the full KYC profile to open your account.</span>
                                </li>
                            </ul>
                        </div>
                        
                        <Button as="a" href="/" variant="secondary" className="w-full">
                            Return to homepage
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto bg-paper-100">
            <div className="max-w-xl mx-auto">
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-2">
                        <p className="label-mono text-vermilion-600">Step {step} of 3</p>
                        <p className="text-small text-ink-500 font-medium">
                            {step === 1 && 'Basic Information'}
                            {step === 2 && 'Contact & Account'}
                            {step === 3 && 'Review & Submit'}
                        </p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1 bg-paper-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-vermilion-600 transition-all duration-300 ease-in-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-paper-50 p-8 rounded border border-paper-200 shadow-sm">
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h2 className="font-display text-h3 text-ink-900 mb-1">Let's get started</h2>
                                <p className="text-body text-ink-700">Tell us a bit about yourself.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-small font-medium text-ink-900">Application Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => updateField('applicationType', 'PERSONAL')}
                                            className={`flex flex-col items-center justify-center p-4 rounded border transition-colors ${formData.applicationType === 'PERSONAL' ? 'bg-ink-900 border-ink-900 text-paper-50' : 'bg-paper-50 border-paper-300 text-ink-700 hover:border-ink-900'}`}
                                        >
                                            <User className={`w-6 h-6 mb-2 ${formData.applicationType === 'PERSONAL' ? 'text-paper-50' : 'text-ink-500'}`} />
                                            <span className="font-medium text-small">Personal</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateField('applicationType', 'BUSINESS')}
                                            className={`flex flex-col items-center justify-center p-4 rounded border transition-colors ${formData.applicationType === 'BUSINESS' ? 'bg-ink-900 border-ink-900 text-paper-50' : 'bg-paper-50 border-paper-300 text-ink-700 hover:border-ink-900'}`}
                                        >
                                            <Building2 className={`w-6 h-6 mb-2 ${formData.applicationType === 'BUSINESS' ? 'text-paper-50' : 'text-ink-500'}`} />
                                            <span className="font-medium text-small">Business</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <label htmlFor="firstName" className="block text-small font-medium text-ink-900">First name</label>
                                        <input
                                            id="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => updateField('firstName', e.target.value)}
                                            className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.firstName ? 'border-vermilion-600' : 'border-paper-300'}`}
                                        />
                                        {errors.firstName && <p className="text-xs text-vermilion-600">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="lastName" className="block text-small font-medium text-ink-900">Last name</label>
                                        <input
                                            id="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => updateField('lastName', e.target.value)}
                                            className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.lastName ? 'border-vermilion-600' : 'border-paper-300'}`}
                                        />
                                        {errors.lastName && <p className="text-xs text-vermilion-600">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="block text-small font-medium text-ink-900">Email address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.email ? 'border-vermilion-600' : 'border-paper-300'}`}
                                    />
                                    {errors.email && <p className="text-xs text-vermilion-600">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={nextStep} variant="primary">
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h2 className="font-display text-h3 text-ink-900 mb-1">Contact Details</h2>
                                <p className="text-body text-ink-700">We need this to verify your identity.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="phone" className="block text-small font-medium text-ink-900">Phone number</label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                            className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.phone ? 'border-vermilion-600' : 'border-paper-300'}`}
                                        />
                                        {errors.phone && <p className="text-xs text-vermilion-600">{errors.phone}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="zipCode" className="block text-small font-medium text-ink-900">Zip/Postal code</label>
                                        <input
                                            id="zipCode"
                                            type="text"
                                            value={formData.zipCode}
                                            onChange={(e) => updateField('zipCode', e.target.value)}
                                            className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.zipCode ? 'border-vermilion-600' : 'border-paper-300'}`}
                                        />
                                        {errors.zipCode && <p className="text-xs text-vermilion-600">{errors.zipCode}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="desiredAccountType" className="block text-small font-medium text-ink-900">Desired Account</label>
                                    <select
                                        id="desiredAccountType"
                                        value={formData.desiredAccountType}
                                        onChange={(e) => updateField('desiredAccountType', e.target.value)}
                                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.desiredAccountType ? 'border-vermilion-600' : 'border-paper-300'}`}
                                    >
                                        <option value="CHECKING">Checking Account</option>
                                        <option value="SAVINGS">Savings Account</option>
                                        <option value="MONEY_MARKET">Money Market Account</option>
                                        <option value="CERTIFICATE_OF_DEPOSIT">Certificate of Deposit</option>
                                        <option value="OTHER">Other / Not Sure</option>
                                    </select>
                                    {errors.desiredAccountType && <p className="text-xs text-vermilion-600">{errors.desiredAccountType}</p>}
                                </div>

                                <div className="space-y-3 pt-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.isUsCitizenOrResident}
                                            onChange={(e) => updateField('isUsCitizenOrResident', e.target.checked)}
                                            className="w-5 h-5 rounded border-paper-300 text-ink-900 focus:ring-ink-900 cursor-pointer"
                                        />
                                        <span className="text-body text-ink-700 group-hover:text-ink-900 transition-colors">
                                            I am a US Citizen or permanent resident
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.isExistingCustomer}
                                            onChange={(e) => updateField('isExistingCustomer', e.target.checked)}
                                            className="w-5 h-5 rounded border-paper-300 text-ink-900 focus:ring-ink-900 cursor-pointer"
                                        />
                                        <span className="text-body text-ink-700 group-hover:text-ink-900 transition-colors">
                                            I am an existing {BRAND.shortName} customer
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <Button onClick={prevStep} variant="secondary">
                                    Back
                                </Button>
                                <Button onClick={nextStep} variant="primary">
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h2 className="font-display text-h3 text-ink-900 mb-1">Review & Submit</h2>
                                <p className="text-body text-ink-700">Please review your information before submitting.</p>
                            </div>

                            {errors.submit && (
                                <div className="p-4 bg-vermilion-600/10 text-vermilion-700 text-small rounded border border-vermilion-600/20">
                                    {errors.submit}
                                </div>
                            )}

                            <div className="bg-paper-100 rounded border border-paper-200 p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-small">
                                    <div>
                                        <p className="text-ink-500 mb-0.5">Name</p>
                                        <p className="font-medium text-ink-900">{formData.firstName} {formData.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-ink-500 mb-0.5">Email</p>
                                        <p className="font-medium text-ink-900">{formData.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-ink-500 mb-0.5">Phone</p>
                                        <p className="font-medium text-ink-900">{formData.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-ink-500 mb-0.5">Account Type</p>
                                        <p className="font-medium text-ink-900">{formData.desiredAccountType}</p>
                                    </div>
                                </div>
                                <button onClick={() => setStep(1)} className="text-vermilion-600 text-small font-medium hover:underline">
                                    Edit details
                                </button>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-paper-200">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.consentComms}
                                        onChange={(e) => updateField('consentComms', e.target.checked)}
                                        className={`w-5 h-5 rounded mt-0.5 cursor-pointer ${errors.consentComms ? 'border-vermilion-600 focus:ring-vermilion-600 text-vermilion-600' : 'border-paper-300 focus:ring-ink-900 text-ink-900'}`}
                                    />
                                    <div>
                                        <span className="text-small text-ink-700 group-hover:text-ink-900 transition-colors block">
                                            I consent to receive communications from {BRAND.legalName} regarding my application via email and phone.
                                        </span>
                                        {errors.consentComms && <p className="text-xs text-vermilion-600 mt-1">{errors.consentComms}</p>}
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.consentPrivacy}
                                        onChange={(e) => updateField('consentPrivacy', e.target.checked)}
                                        className={`w-5 h-5 rounded mt-0.5 cursor-pointer ${errors.consentPrivacy ? 'border-vermilion-600 focus:ring-vermilion-600 text-vermilion-600' : 'border-paper-300 focus:ring-ink-900 text-ink-900'}`}
                                    />
                                    <div>
                                        <span className="text-small text-ink-700 group-hover:text-ink-900 transition-colors block">
                                            I have read and agree to the Privacy Policy and authorize the bank to retain my information for preliminary screening purposes.
                                        </span>
                                        {errors.consentPrivacy && <p className="text-xs text-vermilion-600 mt-1">{errors.consentPrivacy}</p>}
                                    </div>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <Button onClick={prevStep} variant="secondary" disabled={isSubmitting}>
                                    Back
                                </Button>
                                <Button onClick={handleSubmit} variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ApplyPage() {
    return (
        <div className="min-h-screen bg-paper-100 flex flex-col md:flex-row">
            {/* Left Sidebar - Split Screen Design */}
            <div className="w-full md:w-1/3 lg:w-[40%] bg-ink-900 text-paper-50 p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-paper-100/40 via-transparent to-transparent" />
                
                <div className="relative z-10">
                    <Shield className="w-10 h-10 text-paper-50 mb-8" aria-hidden="true" />
                    <h1 className="font-display text-display-sm mb-4">Open an account</h1>
                    <p className="text-body-lg text-paper-300 mb-12">
                        Secure, relationship-based banking tailored to you. Apply in minutes.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded border border-paper-50/20 flex items-center justify-center shrink-0">
                                <span className="font-mono text-small">1</span>
                            </div>
                            <div>
                                <h3 className="font-display text-h4 mb-1">Request</h3>
                                <p className="text-small text-paper-300">Submit a brief form to determine eligibility.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded border border-paper-50/20 flex items-center justify-center shrink-0">
                                <span className="font-mono text-small">2</span>
                            </div>
                            <div>
                                <h3 className="font-display text-h4 mb-1">Review</h3>
                                <p className="text-small text-paper-300">Our onboarding team evaluates your request.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded border border-paper-50/20 flex items-center justify-center shrink-0">
                                <span className="font-mono text-small">3</span>
                            </div>
                            <div>
                                <h3 className="font-display text-h4 mb-1">Register</h3>
                                <p className="text-small text-paper-300">Complete KYC and fund your new account securely.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-16 text-small text-paper-400">
                    &copy; {new Date().getFullYear()} {BRAND.legalName}. {BRAND.fdic}
                </div>
            </div>

            {/* Right Side - Form */}
            <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12 bg-paper-100 text-ink-500">Loading application...</div>}>
                <ApplicationFormContent />
            </Suspense>
        </div>
    );
}
