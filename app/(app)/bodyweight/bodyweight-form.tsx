"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/peak/stepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BodyWeightForm() {
  const router = useRouter();
  const [kg, setKg] = React.useState(80);
  const [pending, setPending] = React.useState(false);
  const submit = async () => {
    setPending(true);
    await fetch("/api/bodyweight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kg }),
    });
    setPending(false);
    router.refresh();
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Stepper value={kg} onChange={setKg} step={0.1} min={20} max={300} formatValue={(n) => `${n.toFixed(1)} kg`} />
        <Button size="lg" onClick={submit} disabled={pending} className="w-full">
          {pending ? "Saving…" : "Log weight"}
        </Button>
      </CardContent>
    </Card>
  );
}
