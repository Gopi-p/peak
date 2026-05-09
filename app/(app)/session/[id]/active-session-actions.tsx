"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/peak/confirm-dialog";
import { useToast } from "@/components/peak/toast-provider";

export function ActiveSessionActions({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const finish = async () => {
    setPending(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/finish`, { method: "POST" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      router.replace(`/session/${sessionId}/summary`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't finish session");
      setPending(false);
    }
  };

  const cancel = async () => {
    setPending(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setCancelOpen(false);
      router.replace("/today");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't cancel session");
      setPending(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Button
          onClick={finish}
          variant="outline"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          Finish session
        </Button>
        <Button
          onClick={() => setCancelOpen(true)}
          variant="ghost"
          size="lg"
          className="w-full text-destructive"
          disabled={pending}
        >
          Cancel session
        </Button>
      </div>
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this session?"
        description="The session and any sets you logged will be removed from your history."
        confirmLabel="Cancel session"
        cancelLabel="Keep going"
        destructive
        pending={pending}
        onConfirm={cancel}
      />
    </>
  );
}
