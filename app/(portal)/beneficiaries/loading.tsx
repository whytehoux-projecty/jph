import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PayeesLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading your payees</p>
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-9 w-36" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-36" />
      </div>
      <Skeleton className="mb-4 h-12 max-w-md" />
      <Card>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
            <Skeleton className="size-9 rounded-round" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </Card>
    </div>
  );
}
