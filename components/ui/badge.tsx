import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge / StatusPill — docs/DESIGN_SYSTEM.md#badge-and-status-pill
 *
 * Status is never colour alone: the text says it, and StatusPill adds a dot.
 * neutral · info · success · warning · danger are the semantic variants.
 * `default`, `secondary`, `destructive` and `outline` are kept for existing
 * call sites (action, neutral, danger, outline).
 */
const badgeVariants = cva(
    "inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-control border px-2 py-0.5 text-caption font-semibold",
    {
        variants: {
            variant: {
                neutral: "border-transparent bg-surface-muted text-fg",
                info: "border-transparent bg-info-subtle text-info",
                success: "border-transparent bg-success-subtle text-success",
                warning: "border-transparent bg-warning-subtle text-warning",
                danger: "border-transparent bg-danger-subtle text-danger",
                outline: "border-line-strong bg-transparent text-fg",
                default: "border-transparent bg-action-subtle text-fg-action",
                secondary: "border-transparent bg-surface-muted text-fg",
                destructive: "border-transparent bg-danger-subtle text-danger",
            },
        },
        defaultVariants: {
            variant: "neutral",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

const dotColour: Record<string, string> = {
    neutral: "bg-fg-muted",
    info: "bg-info",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
}

export type Status = "neutral" | "info" | "success" | "warning" | "danger"

/** A Badge with a leading status dot, for transaction and account states. */
function StatusPill({
    status = "neutral",
    className,
    children,
    ...props
}: Omit<BadgeProps, "variant"> & { status?: Status }) {
    return (
        <Badge variant={status} className={className} {...props}>
            <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-round", dotColour[status])} />
            {children}
        </Badge>
    )
}

export { Badge, StatusPill, badgeVariants }
