import React from 'react';
import { cn } from './cn';

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
 * Isobath setting rule: every figure is the text face with tabular lining
 * numerals (never monospace). Large figures use the Key figure style.
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
        // Template string, not cn(): tailwind-merge would read text-figure as a colour
        className={`ht-figure tabular text-ink-900 ${size === 'large' ? 'text-figure font-light' : 'text-data font-normal'}`}
      >
        {value}
        {footnoteRef !== undefined && (
          <sup className="text-[max(0.5em,13px)] ml-0.5 font-normal">{footnoteRef}</sup>
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
