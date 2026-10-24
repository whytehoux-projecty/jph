import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatementsLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading your statements</p>
      <div className="pb-6">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <Card>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-9 w-32" />
          </div>
        ))}
      </Card>
    </div>
  );
}
