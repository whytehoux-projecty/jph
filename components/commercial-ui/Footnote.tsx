import React from 'react';
import { cn } from '@/lib/utils';

interface FootnoteItem {
  ref: number;
  text: React.ReactNode;
}

interface FootnoteProps {
  items: FootnoteItem[];
  className?: string;
}

/**
 * Footnote — renders the disclosure footnote list.
 *
 * Usage: Place this at the bottom of any section that uses <Figure footnoteRef={n} />.
 * The ref numbers must match those used in Figure components on the same page.
 */
export function Footnote({ items, className }: FootnoteProps) {
  if (!items.length) return null;

  return (
    <ol
      className={cn(
        'list-none m-0 p-0 space-y-1',
        className,
      )}
      aria-label="Footnotes"
    >
      {items.map((item) => (
        <li key={item.ref} className="flex gap-2">
          <span
            className="font-mono text-[0.7rem] leading-none mt-0.5 shrink-0 text-ink-500"
            aria-label={`Footnote ${item.ref}`}
          >
            {item.ref}
          </span>
          <span className="text-small text-ink-500 font-sans">{item.text}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * DisclosureBlock — wraps a Footnote list in a hairline-bordered disclosure section.
 */
export function DisclosureBlock({
  items,
  className,
}: FootnoteProps) {
  return (
    <div className={cn('border-t border-paper-200 pt-6 mt-12', className)}>
      <p className="label-mono text-ink-500 mb-3">Disclosures</p>
      <Footnote items={items} />
    </div>
  );
}

export default Footnote;
