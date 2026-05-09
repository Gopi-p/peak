import { PageHeaderSkeleton, Skeleton } from "@/components/peak/skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />
      <div className="rounded-lg border border-outline-variant/40 bg-surface-container divide-y divide-outline-variant/40">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3 p-edge">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
