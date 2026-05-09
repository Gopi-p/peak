"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/peak/confirm-dialog";
import { useToast } from "@/components/peak/toast-provider";

export type Entry = { id: string; kg: number; measuredAt: string };

export function RecentEntries({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const toast = useToast();
  const [target, setTarget] = React.useState<Entry | null>(null);
  const [pending, setPending] = React.useState(false);

  const remove = async () => {
    if (!target) return;
    setPending(true);
    try {
      const res = await fetch(`/api/bodyweight/${target.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete entry");
    } finally {
      setPending(false);
    }
  };

  if (entries.length === 0) return null;
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-outline-variant/40 p-0">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 p-edge"
            >
              <div>
                <p className="num text-body-md">{e.kg.toFixed(1)} kg</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.measuredAt).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTarget(e)}
                aria-label="Delete entry"
                className="rounded-md p-2 text-muted-foreground hover:bg-surface-low hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!target}
        onOpenChange={(open) => !open && !pending && setTarget(null)}
        title="Delete weight entry?"
        description={
          target
            ? `${target.kg.toFixed(1)} kg from ${new Date(target.measuredAt).toLocaleDateString()}`
            : ""
        }
        confirmLabel="Delete"
        destructive
        pending={pending}
        onConfirm={remove}
      />
    </>
  );
}
