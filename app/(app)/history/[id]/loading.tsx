import { PageHeaderSkeleton, CardSkeleton } from "@/components/peak/skeleton";

export default function HistoryDetailLoading() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />
      <CardSkeleton rows={4} />
      <CardSkeleton rows={3} />
    </div>
  );
}
