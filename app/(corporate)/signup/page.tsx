'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { Input } from '@/components/forms/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/commercial-ui/Card';
import { Lock, Mail, User, CreditCard, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { requestOnlineAccess } from '@/app/(corporate)/actions';

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Account Verification
        accountNumber: '',
        ssn: '',
        dateOfBirth: '',

        // Step 2: Personal Information
        firstName: '',
        lastName: '',
        email: '',
        phone: '',

        // Step 3: Create Credentials
        username: '',
        password: '',
        confirmPassword: '',

        // Step 4: Agreement
        agreeToTerms: false,
        agreeToPrivacy: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.accountNumber) {
            newErrors.accountNumber = 'Account number is required';
        } else if (!/^\d{10,12}$/.test(formData.accountNumber)) {
            newErrors.accountNumber = 'Account number must be 10-12 digits';
        }

        if (!formData.ssn) {
            newErrors.ssn = 'Last 4 digits of SSN are required';
        } else if (!/^\d{4}$/.test(formData.ssn)) {
            newErrors.ssn = 'Must be exactly 4 digits';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        }

        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        return newErrors;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 4) {
            newErrors.username = 'Username must be at least 4 characters';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const validateStep4 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }
        if (!formData.agreeToPrivacy) {
            newErrors.agreeToPrivacy = 'You must agree to the privacy policy';
        }

        return newErrors;
    };

    const handleNext = () => {
        let newErrors: Record<string, string> = {};

        if (currentStep === 1) newErrors = validateStep1();
        else if (currentStep === 2) newErrors = validateStep2();
        else if (currentStep === 3) newErrors = validateStep3();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setCurrentStep(currentStep + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = validateStep4();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            await requestOnlineAccess({
                accountNumber: formData.accountNumber,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
            });

            router.push('/login?registered=true');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Registration failed:', error);
            setErrors({
                submit: error.message || 'Registration failed. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-off-white to-warm-cream py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step ? 'bg-heritage-navy text-white' : 'bg-faded-gray-light text-charcoal-light'
                                    } font-semibold transition-all`}>
                                    {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                                </div>
                                {step < 4 && (
                                    <div className={`flex-1 h-1 mx-2 ${currentStep > step ? 'bg-heritage-navy' : 'bg-faded-gray-light'
                                        } transition-all`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-xs text-charcoal-light">Verify Account</span>
                        <span className="text-xs text-charcoal-light">Personal Info</span>
                        <span className="text-xs text-charcoal-light">Credentials</span>
                        <span className="text-xs text-charcoal-light">Complete</span>
                    </div>
                </div>

                <Card className="shadow-vintage-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            {currentStep === 1 && 'Verify Your Account'}
                            {currentStep === 2 && 'Personal Information'}
                            {currentStep === 3 && 'Create Login Credentials'}
                            {currentStep === 4 && 'Review and Agree'}
                        </CardTitle>
                        <CardDescription>
                            {currentStep === 1 && 'Enter your existing JP Heritage Bank account details to get started'}
                            {currentStep === 2 && 'Confirm your personal information'}
                            {currentStep === 3 && 'Choose a username and secure password'}
                            {currentStep === 4 && 'Review your information and accept our terms'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                            {/* Step 1: Account Verification */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="p-4 bg-soft-gold/10 rounded-none border border-soft-gold/20">
                                        <p className="text-sm text-charcoal">
                                            <strong>Important:</strong> You must have an existing JP Heritage Bank account to register for Heritage Vault e-banking. Your account number can be found on your account statements or debit card.
                                        </p>
                                    </div>

                                    <Input
                                        label="Account Number"
                                        type="text"
                                        placeholder="Enter your 10-12 digit account number"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                                        error={errors.accountNumber}
                                        icon={<CreditCard className="w-5 h-5" />}
                                        maxLength={12}
                                    />

                                    <Input
                                        label="Last 4 Digits of SSN"
                                        type="text"
                                        placeholder="XXXX"
                                        value={formData.ssn}
                                        onChange={(e) => setFormData({ ...formData, ssn: e.target.value.replace(/\D/g, '') })}
                                        error={errors.ssn}
                                        icon={<Lock className="w-5 h-5" />}
                                        maxLength={4}
                                    />

                                    <Input
                                        label="Date of Birth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        error={errors.dateOfBirth}
                                    />
                                </div>
                            )}

                            {/* Step 2: Personal Information */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input
                                            label="First Name"
                                            type="text"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            error={errors.firstName}
                                            icon={<User className="w-5 h-5" />}
                                        />

                                        <Input
                                            label="Last Name"
                                            type="text"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            error={errors.lastName}
                                            icon={<User className="w-5 h-5" />}
                                        />
                                    </div>

                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="john.doe@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        error={errors.email}
                                        icon={<Mail className="w-5 h-5" />}
                                    />

                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        placeholder="(555) 123-4567"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        error={errors.phone}
                                    />
                                </div>
                            )}

                            {/* Step 3: Credentials */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <Input
                                        label="Username"
                                        type="text"
                                        placeholder="Choose a unique username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        error={errors.username}
                                        icon={<User className="w-5 h-5" />}
                                    />

                                    <div className="relative">
                                        <Input
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create a strong password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            error={errors.password}
                                            icon={<Lock className="w-5 h-5" />}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-9 text-charcoal-lighter hover:text-charcoal transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            label="Confirm Password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Re-enter your password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            error={errors.confirmPassword}
                                            icon={<Lock className="w-5 h-5" />}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-9 text-charcoal-lighter hover:text-charcoal transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="p-4 bg-parchment rounded-none text-sm text-charcoal-light">
                                        <p className="font-semibold text-charcoal mb-2">Password Requirements:</p>
                                        <ul className="space-y-1">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className={`w-4 h-4 ${formData.password.length >= 8 ? 'text-heritage-navy' : 'text-faded-gray'}`} />
                                                At least 8 characters
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className={`w-4 h-4 ${/[A-Z]/.test(formData.password) ? 'text-heritage-navy' : 'text-faded-gray'}`} />
                                                One uppercase letter
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className={`w-4 h-4 ${/[a-z]/.test(formData.password) ? 'text-heritage-navy' : 'text-faded-gray'}`} />
                                                One lowercase letter
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className={`w-4 h-4 ${/\d/.test(formData.password) ? 'text-heritage-navy' : 'text-faded-gray'}`} />
                                                One number
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Agreement */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-parchment rounded-none space-y-4">
                                        <h3 className="font-semibold text-charcoal">Review Your Information</h3>
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-charcoal-light">Account Number</p>
                                                <p className="font-mono font-semibold text-charcoal">{formData.accountNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-charcoal-light">Name</p>
                                                <p className="font-semibold text-charcoal">{formData.firstName} {formData.lastName}</p>
                                            </div>
                                            <div>
                                                <p className="text-charcoal-light">Email</p>
                                                <p className="font-semibold text-charcoal">{formData.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-charcoal-light">Username</p>
                                                <p className="font-semibold text-charcoal">{formData.username}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.agreeToTerms}
                                                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                                                className="mt-1 w-4 h-4 rounded border-faded-gray text-heritage-navy focus:ring-heritage-navy"
                                            />
                                            <span className="text-sm text-charcoal-light">
                                                I agree to the{' '}
                                                <Link href="/terms" className="text-heritage-navy hover:underline">
                                                    Terms and Conditions
                                                </Link>
                                                {' '}and{' '}
                                                <Link href="/privacy" className="text-heritage-navy hover:underline">
                                                    E-Banking Agreement
                                                </Link>
                                            </span>
                                        </label>
                                        {errors.agreeToTerms && (
                                            <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                                        )}

                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.agreeToPrivacy}
                                                onChange={(e) => setFormData({ ...formData, agreeToPrivacy: e.target.checked })}
                                                className="mt-1 w-4 h-4 rounded border-faded-gray text-heritage-navy focus:ring-heritage-navy"
                                            />
                                            <span className="text-sm text-charcoal-light">
                                                I acknowledge that I have read and understood the{' '}
                                                <Link href="/privacy" className="text-heritage-navy hover:underline">
                                                    Privacy Policy
                                                </Link>
                                            </span>
                                        </label>
                                        {errors.agreeToPrivacy && (
                                            <p className="text-sm text-red-600">{errors.agreeToPrivacy}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-4 mt-8">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="large"
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="large"
                                    className="flex-1"
                                    loading={isLoading}
                                >
                                    {currentStep === 4 ? (isLoading ? 'Creating Account...' : 'Complete Registration') : 'Continue'}
                                </Button>
                            </div>
                        </form>

                        {currentStep === 1 && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-charcoal-light">
                                    Already registered?{' '}
                                    <Link href="/login" className="text-heritage-navy hover:text-heritage-navy-dark font-semibold transition-colors">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
