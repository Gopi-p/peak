"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/peak/confirm-dialog";
import { useToast } from "@/components/peak/toast-provider";

export function DeleteGoalButton({
  goalId,
  title,
}: {
  goalId: string;
  title: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const remove = async () => {
    setPending(true);
    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete goal");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Delete goal"
        className="rounded-md p-2 text-muted-foreground hover:bg-surface-low hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this goal?"
        description={`"${title}" will be removed.`}
        confirmLabel="Delete"
        destructive
        pending={pending}
        onConfirm={remove}
      />
    </>
  );
}
