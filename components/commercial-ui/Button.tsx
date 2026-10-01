import React from 'react';
import { cn } from '@/lib/utils';

// 'outline' is kept for backward compatibility with portal components — maps to 'secondary'
type ButtonVariant = 'primary' | 'secondary' | 'text' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button while true */
  loading?: boolean;
  /** Makes the button take full container width */
  fullWidth?: boolean;
  /** Render as an anchor tag */
  as?: 'button' | 'a';
  href?: string;
}

const secondaryClasses = [
  'bg-transparent text-ink-900 border border-ink-900',
  'hover:bg-paper-100',
  'active:bg-paper-200',
  'disabled:border-paper-200 disabled:text-ink-500 disabled:cursor-not-allowed',
].join(' ');

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-vermilion-600 text-paper-50',
    'hover:bg-vermilion-700',
    'active:bg-vermilion-700',
    'disabled:bg-paper-200 disabled:text-ink-500 disabled:cursor-not-allowed',
    // No box-shadow per Ledger spec
  ].join(' '),
  secondary: secondaryClasses,
  // 'outline' is kept for backward compatibility with portal code — visually identical to 'secondary'
  outline: secondaryClasses,
  text: [
    'bg-transparent text-ink-900 underline underline-offset-2 px-0',
    'hover:text-vermilion-600',
    'active:text-vermilion-700',
    'disabled:text-ink-500 disabled:cursor-not-allowed',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-small',
  md: 'px-6 py-3 text-small',
  lg: 'px-8 py-4 text-body',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  as: Tag = 'button',
  href,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2',
    'font-sans font-medium rounded',
    'transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900',
    variantClasses[variant],
    variant !== 'text' ? sizeClasses[size] : sizeClasses[size].replace(/px-\S+/g, ''),
    fullWidth && 'w-full',
    className,
  );

  if (Tag === 'a' && href) {
    return (
      <a href={href} className={baseClasses} {...(props as any)}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={baseClasses}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
