"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/commercial-ui/Card";
import { Button } from "@/components/commercial-ui/Button";
import { Input } from "@/components/forms/Input";
import { Lock, CheckCircle, Wallet, ShieldCheck, User } from "lucide-react";
import { completeOnboarding } from "./actions";

export default function OnboardingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
        pin: "",
        confirmPin: "",
        enableCrypto: false,
    });

    const [passwordRules, setPasswordRules] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false,
    });

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, password: val });
        setPasswordRules({
            length: val.length >= 8,
            upper: /[A-Z]/.test(val),
            lower: /[a-z]/.test(val),
            number: /\d/.test(val),
            special: /[@$!%*?&#]/.test(val),
        });
    };

    const validateStep1 = () => {
        if (!passwordRules.length || !passwordRules.upper || !passwordRules.lower || !passwordRules.number || !passwordRules.special) {
            setError("Please meet all password requirements.");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }
        setError("");
        return true;
    };

    const validateStep2 = () => {
        if (!/^\d{4,6}$/.test(formData.pin)) {
            setError("Transaction PIN must be 4 to 6 digits.");
            return false;
        }
        if (formData.pin !== formData.confirmPin) {
            setError("Transaction PINs do not match.");
            return false;
        }
        setError("");
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        setCurrentStep(s => s + 1);
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;
        setIsLoading(true);
        setError("");
        try {
            await completeOnboarding({
                password: formData.password,
                transactionPin: formData.pin,
                cryptoWalletEnabled: formData.enableCrypto,
            });
            // Force session reload to get updated isFirstLogin flag by reloading the page and redirecting
            window.location.href = "/dashboard";
        } catch (e: any) {
            setError(e.message || "Something went wrong.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
            <Card className="w-full max-w-xl shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-vintage-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-vintage-gold" />
                    </div>
                    <CardTitle className="text-2xl font-playfair text-charcoal">
                        Welcome to Heritage Vault
                    </CardTitle>
                    <CardDescription>
                        Complete your profile setup to secure your account and access your dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {/* Stepper */}
                    <div className="flex justify-between mb-8 relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                        <div className="absolute top-1/2 left-0 h-0.5 bg-vintage-gold -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: \`\${(currentStep - 1) * 50}%\` }}></div>
                        
                        {[1, 2, 3].map((step) => (
                            <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= step ? 'bg-vintage-gold text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="p-3 mb-6 bg-red-50 text-red-700 text-sm border border-red-200 rounded-md text-center">
                            {error}
                        </div>
                    )}

                    <div className="min-h-[300px]">
                        {currentStep === 1 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-lg font-semibold text-charcoal mb-4">Step 1: Set Permanent Password</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Your temporary password has expired. Please create a new, secure password.
                                </p>
                                <Input
                                    label="New Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                    icon={<Lock className="w-4 h-4" />}
                                />
                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    icon={<Lock className="w-4 h-4" />}
                                />

                                <div className="p-4 bg-gray-50 rounded-lg text-sm space-y-2 border border-gray-100">
                                    <p className="font-semibold text-charcoal">Password Requirements:</p>
                                    <ul className="grid grid-cols-2 gap-2 text-xs">
                                        <li className={`flex items-center gap-2 ${passwordRules.length ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle className="w-3 h-3" /> 8+ characters
                                        </li>
                                        <li className={`flex items-center gap-2 ${passwordRules.upper ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle className="w-3 h-3" /> Uppercase
                                        </li>
                                        <li className={`flex items-center gap-2 ${passwordRules.lower ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle className="w-3 h-3" /> Lowercase
                                        </li>
                                        <li className={`flex items-center gap-2 ${passwordRules.number ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle className="w-3 h-3" /> Number
                                        </li>
                                        <li className={`flex items-center gap-2 ${passwordRules.special ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle className="w-3 h-3" /> Special Char (@$!%*?&#)
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-lg font-semibold text-charcoal mb-4">Step 2: Transaction PIN</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Set up a 4 to 6 digit PIN. This PIN will be required to authorize transfers and sensitive actions.
                                </p>
                                <Input
                                    label="Transaction PIN"
                                    type="password"
                                    maxLength={6}
                                    value={formData.pin}
                                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                                    placeholder="4-6 digits"
                                />
                                <Input
                                    label="Confirm PIN"
                                    type="password"
                                    maxLength={6}
                                    value={formData.confirmPin}
                                    onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                                    placeholder="Re-enter PIN"
                                />
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-lg font-semibold text-charcoal mb-4">Step 3: Digital Features</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Enhance your banking experience with our modern digital features.
                                </p>

                                <div className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex gap-4 ${formData.enableCrypto ? 'border-vintage-gold bg-vintage-gold/5' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setFormData({ ...formData, enableCrypto: !formData.enableCrypto })}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${formData.enableCrypto ? 'bg-vintage-gold text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-charcoal">Enable Digital Coin Wallet</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Activate secure wallets for USDC and USDT to seamlessly manage and transfer digital assets alongside your fiat accounts.
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center">
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${formData.enableCrypto ? 'bg-vintage-gold border-vintage-gold' : 'border-gray-300'}`}>
                                            {formData.enableCrypto && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                        {currentStep > 1 && (
                            <Button type="button" variant="outline" className="w-1/3" onClick={() => setCurrentStep(s => s - 1)} disabled={isLoading}>
                                Back
                            </Button>
                        )}
                        <Button 
                            type="button" 
                            variant="primary" 
                            className="flex-1"
                            onClick={currentStep === 3 ? handleSubmit : handleNext}
                            loading={isLoading}
                        >
                            {currentStep === 3 ? 'Complete Setup' : 'Continue'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
