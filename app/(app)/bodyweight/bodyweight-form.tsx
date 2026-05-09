"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/peak/stepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/peak/toast-provider";

export function BodyWeightForm() {
  const router = useRouter();
  const toast = useToast();
  const [kg, setKg] = React.useState(80);
  const [pending, setPending] = React.useState(false);

  const submit = async () => {
    setPending(true);
    try {
      const res = await fetch("/api/bodyweight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kg }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Server returned ${res.status}`);
      }
      toast.success(`Logged ${kg.toFixed(1)} kg.`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't log weight");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Stepper
          value={kg}
          onChange={setKg}
          step={0.1}
          min={20}
          max={300}
          formatValue={(n) => `${n.toFixed(1)} kg`}
        />
        <Button size="lg" onClick={submit} disabled={pending} className="w-full">
          {pending ? "Saving…" : "Log weight"}
        </Button>
      </CardContent>
    </Card>
  );
}
