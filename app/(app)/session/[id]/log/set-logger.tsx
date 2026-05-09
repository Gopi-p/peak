"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "@/components/peak/stepper";
import { RestTimer } from "@/components/peak/rest-timer";
import { PrFlash } from "@/components/peak/pr-flash";
import { useToast } from "@/components/peak/toast-provider";
import { formatWeight } from "@/lib/utils";
import type { Suggestion } from "@/lib/analytics/overload";

type Props = {
  sessionId: string;
  entryId: string;
  exerciseName: string;
  cue: string;
  lastSets: { weight: number; reps: number; rpe?: number }[];
  currentSets: { weight: number; reps: number; rpe?: number }[];
  suggestion: Suggestion | null;
  restDefault: number;
  rpeEnabled: boolean;
};

export function SetLogger(props: Props) {
  const router = useRouter();
  const toast = useToast();
  // Prefill priority: latest set logged in *this* session > suggestion based
  // on prior session > top set of the prior session > hard fallback.
  const justLogged = props.currentSets[props.currentSets.length - 1];
  const [weight, setWeight] = React.useState(
    justLogged?.weight ?? props.suggestion?.weight ?? props.lastSets[0]?.weight ?? 60,
  );
  const [reps, setReps] = React.useState(
    justLogged?.reps ?? props.suggestion?.reps ?? props.lastSets[0]?.reps ?? 10,
  );
  const [rpe, setRpe] = React.useState<number | null>(null);
  const [isWarmup, setIsWarmup] = React.useState(false);
  const [resting, setResting] = React.useState(false);
  const [pr, setPr] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const logSet = async () => {
    if (reps < 1) {
      toast.error("Reps must be at least 1.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/sessions/${props.sessionId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId: props.entryId,
          weight,
          reps,
          rpe: rpe ?? undefined,
          isWarmup,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Server returned ${res.status}`);
      }
      const data = (await res.json()) as { pr?: { isPr: boolean; kind: string | null } };
      if (data.pr?.isPr) {
        setPr(data.pr.kind === "weight-for-reps" ? "Rep PR" : "Estimated 1RM PR");
      }
      if (!isWarmup) setResting(true);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't log set");
    } finally {
      setPending(false);
    }
  };

  const sameAsLast = () => {
    const last = props.lastSets[0];
    if (!last) return;
    setWeight(last.weight);
    setReps(last.reps);
    if (last.rpe) setRpe(last.rpe);
  };

  return (
    <div className="space-y-5">
      <PrFlash visible={!!pr} label={pr ?? ""} />

      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Log set</p>
        <h1 className="font-display text-headline-xl leading-tight">{props.exerciseName}</h1>
        {props.cue && <p className="mt-1 text-sm text-muted-foreground">{props.cue}</p>}
      </header>

      {props.lastSets.length > 0 && (
        <div className="rounded-lg bg-surface-low p-3 text-sm">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Last time</p>
          <p className="num mt-1 text-body-lg">
            {props.lastSets
              .slice(0, 5)
              .map((s) => `${formatWeight(s.weight)} × ${s.reps}${s.rpe ? `@${s.rpe}` : ""}`)
              .join("  ")}
          </p>
          {props.suggestion && (
            <p className="mt-1 text-xs text-tertiary">{props.suggestion.rationale}</p>
          )}
          <Button variant="ghost" size="sm" className="mt-2" onClick={sameAsLast}>
            Same as last set
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Weight</CardTitle>
        </CardHeader>
        <CardContent>
          <Stepper
            value={weight}
            onChange={setWeight}
            step={2.5}
            min={0}
            label="kg"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reps</CardTitle>
        </CardHeader>
        <CardContent>
          <Stepper value={reps} onChange={setReps} step={1} min={0} max={50} label="reps" />
        </CardContent>
      </Card>

      {props.rpeEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>RPE (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRpe(rpe === n ? null : n)}
                  className={`h-12 w-12 rounded-md ${rpe === n ? "bg-primary text-primary-foreground" : "bg-surface-high"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <label className="flex items-center justify-between rounded-md bg-surface-low px-4 py-3 text-body-md">
        <span>Warmup set</span>
        <input
          type="checkbox"
          checked={isWarmup}
          onChange={(e) => setIsWarmup(e.target.checked)}
          className="h-5 w-5 accent-primary"
        />
      </label>

      <Button size="xl" onClick={logSet} disabled={pending}>
        {pending ? "Logging…" : "Log set"}
      </Button>

      {resting && <RestTimer defaultSeconds={props.restDefault} onComplete={() => setResting(false)} />}

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => router.push(`/session/${props.sessionId}`)}
        >
          Done with this exercise
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="flex-1"
          onClick={() => router.push(`/session/${props.sessionId}/whats-next`)}
        >
          What's next?
        </Button>
      </div>
    </div>
  );
}
