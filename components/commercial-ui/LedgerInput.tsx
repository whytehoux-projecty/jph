import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface LedgerInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    helperText?: string;
}

export const LedgerInput = React.forwardRef<HTMLInputElement, LedgerInputProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const inputId = id || React.useId();
        
        return (
            <div className={cn("space-y-1.5", className)}>
                <label htmlFor={inputId} className="block text-small font-medium text-ink-900">
                    {label}
                </label>
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow",
                        error ? "border-vermilion-600" : "border-paper-300"
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-vermilion-600" role="alert">{error}</p>}
                {helperText && !error && <p className="text-xs text-ink-500">{helperText}</p>}
            </div>
        );
    }
);

LedgerInput.displayName = 'LedgerInput';
