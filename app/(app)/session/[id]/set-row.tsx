"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useToast } from "@/components/peak/toast-provider";

export type SetRowData = {
  _id: string;
  entryId: string;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup?: boolean;
  tags?: string[];
};

export function SetRow({
  sessionId,
  set,
  index,
}: {
  sessionId: string;
  set: SetRowData;
  index: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = React.useState(false);

  const remove = async () => {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/sets/${set._id}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      toast.info({
        message: "Set removed.",
        durationMs: 5000,
        action: {
          label: "Undo",
          onClick: async () => {
            const r = await fetch(`/api/sessions/${sessionId}/sets`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                entryId: set.entryId,
                weight: set.weight,
                reps: set.reps,
                rpe: set.rpe,
                isWarmup: set.isWarmup ?? false,
                tags: set.tags ?? [],
              }),
            });
            if (r.ok) router.refresh();
          },
        },
      });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove set");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-md bg-surface-low px-3 py-2 text-body-md">
      <span className="text-muted-foreground text-sm w-5 shrink-0">{index + 1}</span>
      <span className="num flex-1">
        {set.weight} kg × {set.reps}
        {set.rpe ? ` @ ${set.rpe}` : ""}
        {set.isWarmup ? " · warmup" : ""}
      </span>
      <button
        onClick={remove}
        disabled={pending}
        aria-label="Remove set"
        className="text-muted-foreground hover:text-destructive disabled:opacity-40 -mr-1 p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
