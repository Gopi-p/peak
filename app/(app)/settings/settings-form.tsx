"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/peak/toast-provider";

type Initial = {
  defaultRestSeconds: number;
  rpeEnabled: boolean;
};

export function SettingsForm({ initial }: { initial: Initial }) {
  const [state, setState] = React.useState(initial);
  const [pending, setPending] = React.useState(false);
  const toast = useToast();

  const save = async () => {
    setPending(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save settings");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-edge">
        <Row label="Default rest (seconds)">
          <input
            type="number"
            min={15}
            max={600}
            value={state.defaultRestSeconds}
            onChange={(e) =>
              setState({ ...state, defaultRestSeconds: Number(e.target.value) })
            }
            className="num w-24 rounded-md bg-surface-low px-3 py-2"
          />
        </Row>
        <Row label="Track RPE">
          <input
            type="checkbox"
            checked={state.rpeEnabled}
            onChange={(e) => setState({ ...state, rpeEnabled: e.target.checked })}
            className="h-5 w-5 accent-primary"
          />
        </Row>
        <Button size="lg" onClick={save} disabled={pending} className="w-full">
          {pending ? "Saving…" : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body-md">{label}</span>
      {children}
    </div>
  );
}
