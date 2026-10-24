import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading your notifications</p>
      <div className="pb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      </div>
      <Card>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-line px-5 py-4 last:border-0">
            <SkeletonText lines={2} />
          </div>
        ))}
      </Card>
    </div>
  );
}
