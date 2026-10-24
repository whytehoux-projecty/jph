import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

/** Mirrors the dashboard layout while its data loads. */
export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading your accounts</p>
      <div className="pb-6">
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-8 lg:gap-8">
          <Card className="p-5 sm:p-6">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-4 h-10 w-56" />
            <Skeleton className="mt-4 h-3.5 w-36" />
          </Card>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-surface" />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Card key={i} className="p-5">
                <SkeletonText lines={2} />
                <Skeleton className="mt-6 h-7 w-40" />
              </Card>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4">
          <Card className="p-5">
            <SkeletonText lines={2} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
            </div>
          </Card>
        </div>
        <Card className="lg:col-span-12">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 border-b border-line px-5 py-4 last:border-0">
              <Skeleton className="size-9 shrink-0 rounded-round" />
              <SkeletonText lines={2} className="flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
