"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Discoverable iOS-style back affordance. Uses browser history when available,
 * falls back to `fallbackHref` (handles direct deep-link entries).
 */
export function BackBar({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };
  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back"
      className="-ml-2 -mt-1 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-2 text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="h-5 w-5" />
      <span className="text-body-md">Back</span>
    </button>
  );
}
