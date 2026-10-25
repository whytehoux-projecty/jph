import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillsLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading your bills</p>
      <div className="pb-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Card className="flex flex-col gap-5 p-5 sm:p-6 lg:col-span-8">
          <Skeleton className="h-5 w-48" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full max-w-md" />
          ))}
        </Card>
        <Card className="flex flex-col gap-3 p-5 lg:col-span-4">
          <Skeleton className="h-5 w-32" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      </div>
    </div>
  );
}
