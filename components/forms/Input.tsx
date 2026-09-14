'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, iconPosition = 'left', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-charcoal mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-lighter">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            'flex h-11 w-full rounded-lg border-2 border-faded-gray-light bg-white px-4 py-2 text-base text-charcoal transition-all duration-250',
                            'placeholder:text-charcoal-lighter',
                            'focus-visible:outline-none focus-visible:border-vintage-green focus-visible:ring-4 focus-visible:ring-vintage-green/10',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/10',
                            icon && iconPosition === 'left' && 'pl-10',
                            icon && iconPosition === 'right' && 'pr-10',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {icon && iconPosition === 'right' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-lighter">
                            {icon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
