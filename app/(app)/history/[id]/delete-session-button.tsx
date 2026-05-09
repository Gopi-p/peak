"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/peak/confirm-dialog";
import { useToast } from "@/components/peak/toast-provider";

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const remove = async () => {
    setPending(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      router.replace("/history");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete session");
      setPending(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="lg"
        className="w-full text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" /> Delete session
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this session?"
        description="The session and all its sets will be removed from your history. PRs from this session will also be cleared."
        confirmLabel="Delete"
        destructive
        pending={pending}
        onConfirm={remove}
      />
    </>
  );
}
