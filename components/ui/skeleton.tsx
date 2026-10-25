import { cn } from "@/lib/utils"

/**
 * Skeleton — docs/DESIGN_SYSTEM.md#skeleton
 * Mirrors the shape of the content it stands in for. Hidden from assistive
 * tech; announce loading once on the region instead (aria-busy="true").
 */
function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            aria-hidden="true"
            className={cn("rounded-control bg-surface-sunken motion-safe:animate-hv-pulse", className)}
            {...props}
        />
    )
}

/** Lines of text-height skeletons; the last line is shorter. */
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div aria-hidden="true" className={cn("flex flex-col gap-2", className)}>
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-3/5" : "w-full")} />
            ))}
        </div>
    )
}

export { Skeleton, SkeletonText }
