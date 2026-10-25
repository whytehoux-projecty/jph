import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepositLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading deposit and withdrawal options</p>
      <div className="pb-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="flex gap-6 border-b border-line pb-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Card className="flex flex-col gap-5 p-5 sm:p-6 lg:col-span-8">
          <Skeleton className="h-5 w-48" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-12 w-full max-w-md" />
        </Card>
        <Card variant="muted" className="flex flex-col gap-3 p-5 lg:col-span-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </Card>
      </div>
    </div>
  );
}
