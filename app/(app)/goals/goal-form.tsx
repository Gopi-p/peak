"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MUSCLE_GROUPS } from "@/lib/constants";
import { EXERCISES } from "@/lib/exercises";

export function GoalForm() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<"lift-target" | "weekly-sets" | "bodyweight" | "frequency">(
    "weekly-sets",
  );
  const [target, setTarget] = React.useState(12);
  const [muscle, setMuscle] = React.useState<string>("Chest");
  const [exerciseId, setExerciseId] = React.useState<string>(EXERCISES[0]?.id ?? "");
  const [pending, setPending] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        type,
        targetValue: target,
        muscle: type === "weekly-sets" ? muscle : undefined,
        exerciseId: type === "lift-target" ? exerciseId : undefined,
      }),
    });
    setPending(false);
    setTitle("");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New goal</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={submit}>
          <Input
            placeholder="Title (e.g., Bench Press 100kg)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full rounded-md bg-surface-low px-3 py-3"
          >
            <option value="weekly-sets">Weekly sets per muscle</option>
            <option value="lift-target">Lift target (estimated 1RM)</option>
            <option value="frequency">Sessions per week</option>
            <option value="bodyweight">Body weight</option>
          </select>
          {type === "weekly-sets" && (
            <select
              value={muscle}
              onChange={(e) => setMuscle(e.target.value)}
              className="w-full rounded-md bg-surface-low px-3 py-3"
            >
              {MUSCLE_GROUPS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
          {type === "lift-target" && (
            <select
              value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
              className="w-full rounded-md bg-surface-low px-3 py-3"
            >
              {EXERCISES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          )}
          <Input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            placeholder="Target value"
            required
          />
          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? "Saving…" : "Add goal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
