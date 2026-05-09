import { PageHeaderSkeleton, CardSkeleton } from "@/components/peak/skeleton";

export default function LibraryDetailLoading() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />
      <CardSkeleton rows={2} />
      <CardSkeleton rows={4} />
    </div>
  );
}
