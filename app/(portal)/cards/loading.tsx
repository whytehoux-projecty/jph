import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function CardsLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading your cards</p>
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-9 w-28" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-40" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Skeleton className="aspect-[1.586] w-full max-w-sm rounded-surface lg:col-span-5" />
        <Card className="p-6 lg:col-span-7">
          <SkeletonText lines={5} />
        </Card>
      </div>
    </div>
  );
}
