import { PageHeaderSkeleton, CardSkeleton, Skeleton } from "@/components/peak/skeleton";

export default function TodayLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-16 w-full" />
      <CardSkeleton rows={2} />
      <CardSkeleton rows={3} />
    </div>
  );
}
