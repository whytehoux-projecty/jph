'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Button — docs/DESIGN_SYSTEM.md#button
 *
 * primary     one per view: the action the screen exists for
 * secondary   alternatives next to a primary (Cancel, Back, Download)
 * tertiary    low-emphasis actions in toolbars, rows and cards
 * destructive irreversible actions (Remove payee, Cancel transfer)
 * link        inline navigation that should look like text
 *
 * `outline` and `ghost` are kept as aliases of secondary and tertiary;
 * `small` / `medium` / `large` as aliases of sm / md / lg.
 */
const buttonVariants = cva(
    [
        'relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
        'rounded-control font-sans font-semibold select-none',
        'transition-colors duration-(--duration-fast) ease-standard',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed',
        '[&_svg]:shrink-0 [&_svg]:size-4',
    ].join(' '),
    {
        variants: {
            variant: {
                primary:
                    'bg-action text-fg-on-action hover:bg-action-hover disabled:bg-surface-sunken disabled:text-fg-disabled',
                secondary:
                    'border border-fg bg-surface text-fg hover:bg-surface-muted active:bg-surface-sunken disabled:border-line disabled:bg-surface disabled:text-fg-disabled',
                tertiary:
                    'bg-transparent text-fg-action hover:bg-action-subtle active:bg-surface-selected disabled:bg-transparent disabled:text-fg-disabled',
                destructive:
                    'bg-danger text-fg-on-action hover:bg-danger-hover disabled:bg-surface-sunken disabled:text-fg-disabled',
                link:
                    'h-auto! px-0! text-fg-action underline decoration-1 underline-offset-[3px] hover:decoration-2 disabled:text-fg-disabled',
                outline:
                    'border border-fg bg-surface text-fg hover:bg-surface-muted active:bg-surface-sunken disabled:border-line disabled:bg-surface disabled:text-fg-disabled',
                ghost:
                    'bg-transparent text-fg-action hover:bg-action-subtle active:bg-surface-selected disabled:bg-transparent disabled:text-fg-disabled',
            },
            size: {
                sm: 'h-9 px-3 text-small',
                md: 'h-11 px-5 text-small',
                lg: 'h-12 px-6 text-body',
                icon: 'size-11 p-0',
                small: 'h-9 px-3 text-small',
                medium: 'h-11 px-5 text-small',
                large: 'h-12 px-6 text-body',
            },
            fullWidth: {
                true: 'w-full',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    /** Shows a spinner, sets aria-busy and blocks further presses. */
    loading?: boolean;
    /** Announced to screen readers while loading, e.g. "Sending transfer". */
    loadingLabel?: string;
    /** Render the child element (e.g. a Next.js Link) with button styling. */
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            fullWidth,
            icon,
            iconPosition = 'left',
            loading = false,
            loadingLabel,
            asChild = false,
            type,
            children,
            ...props
        },
        ref
    ) => {
        const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

        if (asChild) {
            return (
                <Slot ref={ref} className={classes} {...props}>
                    {children}
                </Slot>
            );
        }

        return (
            <button
                ref={ref}
                // No default type: existing forms rely on the native submit default.
                type={type}
                className={classes}
                {...props}
                disabled={loading || props.disabled}
                aria-busy={loading || undefined}
            >
                {loading && (
                    <>
                        <Loader2 className="animate-spin" aria-hidden="true" />
                        {loadingLabel && <span className="sr-only">{loadingLabel}</span>}
                    </>
                )}
                {!loading && icon && iconPosition === 'left' && icon}
                {children}
                {!loading && icon && iconPosition === 'right' && icon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
