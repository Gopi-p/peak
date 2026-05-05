"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Initial = {
  units: "kg" | "lbs";
  defaultRestSeconds: number;
  rpeEnabled: boolean;
  showWarmups: boolean;
};

export function SettingsForm({ initial }: { initial: Initial }) {
  const [state, setState] = React.useState(initial);
  const [saved, setSaved] = React.useState(false);
  const save = async () => {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  return (
    <Card>
      <CardContent className="space-y-4 pt-edge">
        <Row label="Units">
          <select
            value={state.units}
            onChange={(e) => setState({ ...state, units: e.target.value as "kg" | "lbs" })}
            className="rounded-md bg-surface-low px-3 py-2"
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </Row>
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
        <Row label="Count warmup sets in volume">
          <input
            type="checkbox"
            checked={state.showWarmups}
            onChange={(e) => setState({ ...state, showWarmups: e.target.checked })}
            className="h-5 w-5 accent-primary"
          />
        </Row>
        <Button size="lg" onClick={save} className="w-full">
          {saved ? "Saved" : "Save"}
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
