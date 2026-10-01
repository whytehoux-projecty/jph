import React from 'react';
import { cn } from '@/lib/utils';

interface FigureProps {
  /** The numeric or data value (e.g. "4.85%", "$48B+", "138") */
  value: string;
  /** Descriptive label below the value */
  label: string;
  /** Optional footnote number (renders as superscript e.g. ¹) */
  footnoteRef?: number;
  /** Optional additional description below the label */
  description?: string;
  /** Render the value larger (for hero/stat strips) */
  size?: 'default' | 'large';
  className?: string;
}

/**
 * Figure — Ledger numeric/data display primitive.
 *
 * Renders all values in IBM Plex Mono (tabular-nums) to ensure columns
 * align and to signal that the number is a precise financial data point.
 */
export function Figure({
  value,
  label,
  footnoteRef,
  description,
  size = 'default',
  className,
}: FigureProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span
        className={cn(
          'font-mono tabular font-medium text-ink-900 leading-none',
          size === 'large' ? 'text-data-lg' : 'text-data',
        )}
      >
        {value}
        {footnoteRef !== undefined && (
          <sup className="text-[0.6em] ml-0.5 font-normal">{footnoteRef}</sup>
        )}
      </span>

      <span className="mt-1 text-small text-ink-500 font-sans">{label}</span>

      {description && (
        <span className="mt-0.5 text-small text-ink-500 font-sans">{description}</span>
      )}
    </div>
  );
}

export default Figure;
