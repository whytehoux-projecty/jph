import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function AccountsLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading your accounts</p>
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-36" />
          <Skeleton className="h-11 w-40" />
        </div>
      </div>
      <Card className="mb-6 p-6">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="mt-4 h-10 w-56" />
      </Card>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <Card className="p-5">
              <SkeletonText lines={2} />
              <Skeleton className="mt-8 h-7 w-40" />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
