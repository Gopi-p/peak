"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/peak/stepper";
import { platesPerSide } from "@/lib/analytics/plate-calc";

export default function PlateCalcPage() {
  const [target, setTarget] = React.useState(60);
  const [bar, setBar] = React.useState(20);
  const { plates, achievableKg } = platesPerSide(target, bar);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Plate calculator</p>
        <h1 className="font-display text-headline-xl">{target} kg</h1>
        {achievableKg !== target && (
          <p className="mt-1 text-tertiary text-sm">
            Closest achievable with standard plates: {achievableKg} kg.
          </p>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Target weight</CardTitle>
        </CardHeader>
        <CardContent>
          <Stepper
            value={target}
            onChange={setTarget}
            step={2.5}
            min={bar}
            formatValue={(n) => `${n} kg`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bar weight</CardTitle>
        </CardHeader>
        <CardContent>
          <Stepper value={bar} onChange={setBar} step={5} min={5} formatValue={(n) => `${n} kg`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plates per side</CardTitle>
        </CardHeader>
        <CardContent>
          {plates.length === 0 ? (
            <p className="text-muted-foreground text-sm">Just the bar.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {plates.map((p, i) => (
                <span
                  key={`${p}-${i}`}
                  className="num inline-flex h-12 min-w-[64px] items-center justify-center rounded-md bg-primary px-3 text-primary-foreground font-semibold"
                >
                  {p} kg
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
