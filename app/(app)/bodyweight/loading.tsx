import { PageHeaderSkeleton, CardSkeleton, Skeleton } from "@/components/peak/skeleton";

export default function BodyWeightLoading() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />
      <CardSkeleton rows={2} />
      <div className="rounded-lg border border-outline-variant/40 bg-surface-container p-edge space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
