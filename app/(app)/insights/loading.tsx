import { PageHeaderSkeleton, Skeleton } from "@/components/peak/skeleton";

export default function InsightsLoading() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />
      <SectionSkeleton title titleWidth="w-40" height="h-48" />
      <SectionSkeleton title titleWidth="w-44" height="h-40" />
      <SectionSkeleton title titleWidth="w-32" height="h-56" />
    </div>
  );
}

function SectionSkeleton({
  titleWidth,
  height,
}: {
  title?: boolean;
  titleWidth: string;
  height: string;
}) {
  return (
    <div className="rounded-lg border border-outline-variant/40 bg-surface-container p-edge space-y-3">
      <Skeleton className={`h-5 ${titleWidth}`} />
      <Skeleton className={`${height} w-full`} />
    </div>
  );
}
