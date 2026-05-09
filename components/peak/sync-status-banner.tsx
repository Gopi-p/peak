"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/offline/db";
import { drainQueue } from "@/lib/offline/sync";

const FAILED_THRESHOLD = 3;
const POLL_MS = 5000;

/**
 * Shows when one or more queued sets have failed to sync `FAILED_THRESHOLD`+
 * times. Auto-retry runs in the background; this banner is the visible
 * fallback when the auto-retry can't make progress.
 */
export function SyncStatusBanner() {
  const [failedCount, setFailedCount] = React.useState(0);
  const [retrying, setRetrying] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const poll = async () => {
      try {
        const count = await db()
          .syncQueue.where("attempts")
          .aboveOrEqual(FAILED_THRESHOLD)
          .count();
        if (!cancelled) setFailedCount(count);
      } catch {
        /* no-op */
      }
    };
    poll();
    const interval = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (failedCount === 0) return null;

  const retry = async () => {
    setRetrying(true);
    try {
      // Reset attempts so drainQueue gives them a fresh shot
      await db().syncQueue.toCollection().modify({ attempts: 0 });
      await drainQueue();
      const count = await db()
        .syncQueue.where("attempts")
        .aboveOrEqual(FAILED_THRESHOLD)
        .count();
      setFailedCount(count);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-destructive/15 px-edge py-2 text-sm">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
        <span>
          {failedCount === 1
            ? "1 session hasn't synced."
            : `${failedCount} sessions haven't synced.`}
        </span>
      </div>
      <button
        onClick={retry}
        disabled={retrying}
        className="text-button-label uppercase tracking-widest text-destructive disabled:opacity-50"
      >
        {retrying ? "…" : "Retry"}
      </button>
    </div>
  );
}
