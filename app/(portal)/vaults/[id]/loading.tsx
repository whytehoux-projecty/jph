import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function AccountDetailLoading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">Loading account details</p>
      <div className="pb-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-9 w-64" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Card className="p-6 lg:col-span-5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-4 h-10 w-52" />
        </Card>
        <Card className="p-6 lg:col-span-7">
          <SkeletonText lines={4} />
        </Card>
      </div>
      <Card className="mt-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 border-b border-line px-5 py-4 last:border-0">
            <Skeleton className="size-9 rounded-round" />
            <SkeletonText lines={2} className="flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </Card>
    </div>
  );
}
