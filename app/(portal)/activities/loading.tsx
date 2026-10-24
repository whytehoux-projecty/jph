import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading your transactions</p>
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-40" />
      </div>
      <Card className="mb-4 grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2 h-12" />
          </div>
        ))}
      </Card>
      <Card>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </Card>
    </div>
  );
}
