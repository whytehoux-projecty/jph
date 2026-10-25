import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavingsLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading your savings goals and loans</p>
      <div className="pb-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="flex gap-6 border-b border-line pb-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="flex flex-col gap-4 p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-32" />
          </Card>
        ))}
      </div>
    </div>
  );
}
