import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface LedgerCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label: React.ReactNode;
    error?: string;
}

export const LedgerCheckbox = React.forwardRef<HTMLInputElement, LedgerCheckboxProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const checkboxId = id || React.useId();
        
        return (
            <div className={cn("space-y-1.5", className)}>
                <label htmlFor={checkboxId} className="flex items-center gap-3 cursor-pointer group">
                    <input
                        id={checkboxId}
                        type="checkbox"
                        ref={ref}
                        className={cn(
                            "w-5 h-5 rounded text-ink-900 focus:ring-ink-900 cursor-pointer",
                            error ? "border-vermilion-600" : "border-paper-300"
                        )}
                        {...props}
                    />
                    <span className="text-body text-ink-700 group-hover:text-ink-900 transition-colors">
                        {label}
                    </span>
                </label>
                {error && <p className="text-xs text-vermilion-600" role="alert">{error}</p>}
            </div>
        );
    }
);

LedgerCheckbox.displayName = 'LedgerCheckbox';
