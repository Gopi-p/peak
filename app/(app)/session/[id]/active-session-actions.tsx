"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ActiveSessionActions({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const finish = async () => {
    const res = await fetch(`/api/sessions/${sessionId}/finish`, { method: "POST" });
    if (res.ok) router.replace(`/session/${sessionId}/summary`);
  };
  return (
    <Button onClick={finish} variant="outline" size="lg" className="w-full">
      Finish session
    </Button>
  );
}
