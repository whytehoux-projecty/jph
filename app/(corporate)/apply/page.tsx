'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { Input } from '@/components/forms/Input';
import { Card, CardContent } from '@/components/commercial-ui/Card';
import { CheckCircle, Briefcase, User, MapPin, DollarSign, Shield } from 'lucide-react';
import { requestAccountOpening } from '@/app/(corporate)/actions';

const steps = [
    { title: 'Type', icon: Briefcase },
    { title: 'Personal', icon: User },
    { title: 'Address', icon: MapPin },
    { title: 'financial', icon: DollarSign },
    { title: 'Review', icon: Shield },
];

export default function ApplicationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        applicationType: 'PERSONAL',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        ssn: '', // Optional
        address: '',
        city: '',
        state: '',
        zipCode: '',
        employmentStatus: '',
        annualIncome: '',
        sourceOfFunds: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Field updates
    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 0:
                // Type is always selected from default
                break;
            case 1:
                if (!formData.firstName) newErrors.firstName = 'First name is required';
                if (!formData.lastName) newErrors.lastName = 'Last name is required';
                if (!formData.email) newErrors.email = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
                if (!formData.phone) newErrors.phone = 'Phone is required';
                if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
                break;
            case 2:
                if (!formData.address) newErrors.address = 'Address is required';
                if (!formData.city) newErrors.city = 'City is required';
                if (!formData.state) newErrors.state = 'State is required';
                if (!formData.zipCode) newErrors.zipCode = 'Zip code is required';
                break;
            case 3:
                if (!formData.employmentStatus) newErrors.employmentStatus = 'Employment status is required';
                if (!formData.annualIncome) newErrors.annualIncome = 'Annual income is required';
                if (!formData.sourceOfFunds) newErrors.sourceOfFunds = 'Source of funds is required';
                break;
        }

        return newErrors;
    };

    const handleNext = () => {
        const stepErrors = validateStep(currentStep);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await requestAccountOpening({
                ...formData,
                annualIncome: Number(formData.annualIncome)
            });
            setSuccess(true);
        } catch (error) {
            console.error('Application error:', error);
            const err = error as { response?: { data?: { message?: string } } };
            setErrors({
                submit: err.response?.data?.message || 'Failed to submit application. Please try again.'
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
                        <h1 className="text-3xl font-playfair font-bold text-charcoal mb-4">Application Received</h1>
                        <p className="text-charcoal-light mb-8 text-lg">
                            Thank you for choosing JP Heritage Bank. Your application has been successfully submitted and is under review by our private banking team. You will receive an email update within 24-48 hours.
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
        <main className="min-h-screen bg-off-white py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-playfair font-bold text-charcoal mb-4">Account Application</h1>
                    <p className="text-charcoal-light">Begin your journey with JP Heritage Bank</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto px-4">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${index <= currentStep ? 'bg-heritage-navy text-white' : 'bg-gray-200 text-gray-400'
                                }`}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs mt-2 font-medium ${index <= currentStep ? 'text-charcoal' : 'text-gray-400'
                                }`}>{step.title}</span>
                        </div>
                    ))}
                    {/* Connecting Line (simplified) */}
                    <div className="absolute top-[230px] left-0 w-full h-0.5 bg-gray-200 -z-0 hidden md:block" />
                    {/* Note: Absolute positioning here is tricky without relative parent, skipping purely visual line for now for simplicity/robustness */}
                </div>

                <Card className="shadow-vintage-xl border-white/20">
                    <CardContent className="p-8">
                        {errors.submit && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg">
                                {errors.submit}
                            </div>
                        )}

                        {/* Step 0: Application Type */}
                        {currentStep === 0 && (
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                <h2 className="text-2xl font-playfair font-semibold text-charcoal">Select Account Type</h2>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {['PERSONAL', 'BUSINESS', 'WEALTH'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => updateField('applicationType', type)}
                                            className={`p-6 rounded-none border-2 text-left transition-all ${formData.applicationType === type
                                                ? 'border-heritage-navy bg-heritage-navy/5 ring-1 ring-heritage-navy'
                                                : 'border-faded-gray hover:border-heritage-navy/50 bg-white'
                                                }`}
                                        >
                                            <div className="font-semibold text-lg mb-2 text-charcoal">{type === 'WEALTH' ? 'Wealth Management' : type.charAt(0) + type.slice(1).toLowerCase()}</div>
                                            <p className="text-sm text-charcoal-light">
                                                {type === 'PERSONAL' && 'For individual daily banking needs'}
                                                {type === 'BUSINESS' && 'For corporate and enterprise solutions'}
                                                {type === 'WEALTH' && 'Exclusive investment and asset management'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 1: Personal Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                <h2 className="text-2xl font-playfair font-semibold text-charcoal">Personal Information</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <Input
                                        label="First Name"
                                        value={formData.firstName}
                                        onChange={(e) => updateField('firstName', e.target.value)}
                                        error={errors.firstName}
                                    />
                                    <Input
                                        label="Last Name"
                                        value={formData.lastName}
                                        onChange={(e) => updateField('lastName', e.target.value)}
                                        error={errors.lastName}
                                    />
                                    <Input
                                        label="Date of Birth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => updateField('dateOfBirth', e.target.value)}
                                        error={errors.dateOfBirth}
                                    />
                                    <Input
                                        label="SSN (Optional)"
                                        value={formData.ssn}
                                        onChange={(e) => updateField('ssn', e.target.value)}
                                        placeholder="XXX-XX-XXXX"
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        error={errors.email}
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        error={errors.phone}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Address */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                <h2 className="text-2xl font-playfair font-semibold text-charcoal">Residential Address</h2>
                                <div className="space-y-6">
                                    <Input
                                        label="Street Address"
                                        value={formData.address}
                                        onChange={(e) => updateField('address', e.target.value)}
                                        error={errors.address}
                                    />
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <Input
                                            label="City"
                                            value={formData.city}
                                            onChange={(e) => updateField('city', e.target.value)}
                                            error={errors.city}
                                        />
                                        <Input
                                            label="State"
                                            value={formData.state}
                                            onChange={(e) => updateField('state', e.target.value)}
                                            error={errors.state}
                                        />
                                        <Input
                                            label="Zip Code"
                                            value={formData.zipCode}
                                            onChange={(e) => updateField('zipCode', e.target.value)}
                                            error={errors.zipCode}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Financial Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                <h2 className="text-2xl font-playfair font-semibold text-charcoal">Financial Profile</h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-charcoal">Employment Status</label>
                                        <select
                                            className="w-full h-12 rounded-lg border border-faded-gray px-4 bg-white focus:outline-none focus:ring-2 focus:ring-heritage-navy"
                                            value={formData.employmentStatus}
                                            onChange={(e) => updateField('employmentStatus', e.target.value)}
                                            aria-label="Select Employment Status"
                                        >
                                            <option value="">Select Status</option>
                                            <option value="EMPLOYED">Employed</option>
                                            <option value="SELF_EMPLOYED">Self Employed</option>
                                            <option value="RETIRED">Retired</option>
                                            <option value="STUDENT">Student</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        {errors.employmentStatus && <p className="text-xs text-red-500">{errors.employmentStatus}</p>}
                                    </div>

                                    <Input
                                        label="Annual Income (USD)"
                                        type="number"
                                        value={formData.annualIncome}
                                        onChange={(e) => updateField('annualIncome', e.target.value)}
                                        error={errors.annualIncome}
                                        icon={<DollarSign className="w-4 h-4" />}
                                    />

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-charcoal">Source of Funds</label>
                                        <select
                                            className="w-full h-12 rounded-lg border border-faded-gray px-4 bg-white focus:outline-none focus:ring-2 focus:ring-heritage-navy"
                                            value={formData.sourceOfFunds}
                                            onChange={(e) => updateField('sourceOfFunds', e.target.value)}
                                            aria-label="Select Source of Funds"
                                        >
                                            <option value="">Select Source</option>
                                            <option value="SALARY">Salary / Wages</option>
                                            <option value="BUSINESS">Business Income</option>
                                            <option value="INVESTMENTS">Investments</option>
                                            <option value="INHERITANCE">Inheritance</option>
                                            <option value="SAVINGS">Savings</option>
                                        </select>
                                        {errors.sourceOfFunds && <p className="text-xs text-red-500">{errors.sourceOfFunds}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                <h2 className="text-2xl font-playfair font-semibold text-charcoal">Review Application</h2>
                                <div className="bg-gray-50 rounded-none p-6 space-y-4 text-sm">
                                    <div className="grid grid-cols-2 pb-4 border-b border-gray-200">
                                        <span className="text-gray-500">Account Type</span>
                                        <span className="font-semibold text-right">{formData.applicationType}</span>
                                    </div>
                                    <div className="grid grid-cols-2 pb-4 border-b border-gray-200">
                                        <span className="text-gray-500">Name</span>
                                        <span className="font-semibold text-right">{formData.firstName} {formData.lastName}</span>
                                    </div>
                                    <div className="grid grid-cols-2 pb-4 border-b border-gray-200">
                                        <span className="text-gray-500">Email</span>
                                        <span className="font-semibold text-right">{formData.email}</span>
                                    </div>
                                    <div className="grid grid-cols-2 pb-4 border-b border-gray-200">
                                        <span className="text-gray-500">Address</span>
                                        <span className="font-semibold text-right text-right">
                                            {formData.address}<br />
                                            {formData.city}, {formData.state} {formData.zipCode}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-gray-500">Annual Income</span>
                                        <span className="font-semibold text-right">${Number(formData.annualIncome).toLocaleString()}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    By clicking Submit, you certify that the information provided is true and accurate.
                                </p>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 0 || isSubmitting}
                                className={currentStep === 0 ? 'invisible' : ''}
                            >
                                Back
                            </Button>
                            <Button
                                variant="primary"
                                onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                                loading={isSubmitting}
                            >
                                {currentStep === steps.length - 1 ? 'Submit Application' : 'Continue'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>

    );
}
