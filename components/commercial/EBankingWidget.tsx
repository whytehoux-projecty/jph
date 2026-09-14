'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EBankingWidgetProps {
    className?: string;
}

type AccountType = 'personal' | 'business' | 'corporate';

export function EBankingWidget({ className = '' }: EBankingWidgetProps) {
    const router = useRouter();
    const [accountType, setAccountType] = useState<AccountType>('personal');
    const [showPassword, setShowPassword] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [formData, setFormData] = useState({
        accountNumber: '',
        password: '',
        rememberMe: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsChecking(true);
        // In the unified bank, portal is internal — redirect directly to /login
        router.push('/login');
        setIsChecking(false);
    };

    return (
        <div className={`bg-white/70 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 p-6 ${className}`}>
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-playfair font-bold text-charcoal mb-2">
                    Heritage Vault
                </h3>
                <p className="text-sm text-charcoal-light">
                    Secure digital banking by JP Heritage
                </p>
            </div>

            {/* Account Type Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setAccountType('personal')}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-none transition-all ${accountType === 'personal'
                        ? 'bg-heritage-navy text-white'
                        : 'bg-off-white text-charcoal-light hover:bg-faded-gray-light'
                        }`}
                >
                    Personal
                </button>
                <button
                    onClick={() => setAccountType('business')}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-none transition-all ${accountType === 'business'
                        ? 'bg-heritage-navy text-white'
                        : 'bg-off-white text-charcoal-light hover:bg-faded-gray-light'
                        }`}
                >
                    Business
                </button>
                <button
                    onClick={() => setAccountType('corporate')}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-none transition-all ${accountType === 'corporate'
                        ? 'bg-heritage-navy text-white'
                        : 'bg-off-white text-charcoal-light hover:bg-faded-gray-light'
                        }`}
                >
                    Corporate
                </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Number */}
                <div>
                    <label htmlFor="widget-account" className="block text-sm font-semibold text-charcoal mb-2">
                        Account Number
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-lighter">
                            <User className="w-5 h-5" />
                        </div>
                        <input
                            id="widget-account"
                            type="text"
                            placeholder="Enter account number"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                            maxLength={12}
                            disabled={isChecking}
                            className="w-full h-12 pl-11 pr-4 rounded-none border border-faded-gray bg-white text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-heritage-navy focus:border-transparent transition-all disabled:opacity-50"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="widget-password" className="block text-sm font-semibold text-charcoal mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-lighter">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            id="widget-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={isChecking}
                            className="w-full h-12 pl-11 pr-12 rounded-none border border-faded-gray bg-white text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-heritage-navy focus:border-transparent transition-all disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isChecking}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-lighter hover:text-charcoal transition-colors disabled:opacity-50"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                            disabled={isChecking}
                            className="w-4 h-4 rounded border-faded-gray text-heritage-navy focus:ring-heritage-navy disabled:opacity-50"
                        />
                        <span className="text-sm text-charcoal-light">Remember me</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:4000'}/forgot-password`; }}
                        disabled={isChecking}
                        className="text-sm text-heritage-navy hover:text-heritage-navy-dark transition-colors disabled:opacity-50"
                    >
                        Forgot password?
                    </button>
                </div>

                {/* Sign In Button */}
                <button
                    type="submit"
                    disabled={isChecking}
                    className="w-full h-12 bg-heritage-navy text-white font-semibold rounded-none hover:bg-heritage-navy-dark transition-all shadow-vintage hover:shadow-vintage-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isChecking ? 'Connecting...' : 'Sign In to Your Account'}
                </button>

                {/* Registration Link */}
                <div className="text-center pt-4 border-t border-faded-gray-light">
                    <p className="text-sm text-charcoal-light">
                        Not registered?{' '}
                        <a href="/apply" className="text-heritage-navy hover:text-heritage-navy-dark font-semibold transition-colors">
                            Open an account →
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
}
