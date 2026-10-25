"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Stepper } from "@/components/ui/stepper";

/**
 * FlowDialog — docs/DESIGN_SYSTEM.md#flow-dialog
 * A multi-step dialog: title, description and stepper on top, the current
 * step in the middle, back/cancel and the next action in the footer. It
 * can't be dismissed while `busy`.
 */
export function FlowDialog({
  open,
  onClose,
  title,
  description,
  steps,
  step,
  footer,
  children,
  busy = false,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  steps: string[];
  step: number;
  footer: React.ReactNode;
  children: React.ReactNode;
  busy?: boolean;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className={className ?? "gap-0 p-0 sm:max-w-2xl"}>
        <DialogHeader className="border-b border-line p-6 pb-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <Stepper steps={steps} current={step} className="pt-3" />
        </DialogHeader>
        <div className="flex flex-col gap-5 p-6" aria-busy={busy}>
          {children}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {footer}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Term/value pairs for review and confirmation steps. */
export function ReviewList({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="divide-y divide-line rounded-surface border border-line">
      {rows.map(([term, value]) => (
        <div key={term} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between sm:gap-6">
          <dt className="text-small text-fg-muted">{term}</dt>
          <dd className="text-body text-fg sm:text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Final "it worked" step. Moves focus to its heading. */
export function FlowDone({ title, children }: { title: string; children?: React.ReactNode }) {
  const ref = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => ref.current?.focus(), []);
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
      <h3 ref={ref} tabIndex={-1} className="font-sans text-h3 text-fg focus:outline-none">
        {title}
      </h3>
      {children}
    </div>
  );
}
