import React, { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface LedgerSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    helperText?: string;
    options?: { value: string; label: string }[];
}

export const LedgerSelect = React.forwardRef<HTMLSelectElement, LedgerSelectProps>(
    ({ className, label, error, helperText, id, options, children, ...props }, ref) => {
        const selectId = id || React.useId();
        
        return (
            <div className={cn("space-y-1.5", className)}>
                <label htmlFor={selectId} className="block text-small font-medium text-ink-900">
                    {label}
                </label>
                <select
                    id={selectId}
                    ref={ref}
                    className={cn(
                        "w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow appearance-none",
                        error ? "border-vermilion-600" : "border-paper-300"
                    )}
                    {...props}
                >
                    {options ? options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )) : children}
                </select>
                {error && <p className="text-xs text-vermilion-600" role="alert">{error}</p>}
                {helperText && !error && <p className="text-xs text-ink-500">{helperText}</p>}
            </div>
        );
    }
);

LedgerSelect.displayName = 'LedgerSelect';
