import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading your settings</p>
      <div className="pb-6">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="mb-6 h-11 w-96 max-w-full" />
      <Card className="p-6">
        <SkeletonText lines={6} />
      </Card>
    </div>
  );
}
