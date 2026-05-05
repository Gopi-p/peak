import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { getExercise } from "@/lib/exercises";
import { epley1RM } from "@/lib/utils";
import { ExerciseProgressChart } from "@/components/peak/exercise-progress-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ex = getExercise(id);
  if (!ex) notFound();
  const { email } = await requireUser();
  await connectDb();
  const sessions = await Session.find({
    ownerEmail: email,
    "entries.exerciseId": id,
  })
    .sort({ startedAt: 1 })
    .lean<any[]>();

  const points: { date: string; topWeight: number; e1rm: number }[] = [];
  let pr = 0;
  for (const s of sessions) {
    const entry = (s.entries ?? []).find((e: any) => e.exerciseId === id);
    if (!entry) continue;
    const working = (entry.sets ?? []).filter((set: any) => !set.isWarmup);
    if (working.length === 0) continue;
    const top = working.reduce((a: any, b: any) =>
      epley1RM(a.weight, a.reps) > epley1RM(b.weight, b.reps) ? a : b,
    );
    const e1rm = epley1RM(top.weight, top.reps);
    pr = Math.max(pr, e1rm);
    points.push({
      date: new Date(s.startedAt).toISOString().slice(0, 10),
      topWeight: top.weight,
      e1rm: Math.round(e1rm * 10) / 10,
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {ex.equipment} · {ex.movementPattern}
        </p>
        <h1 className="font-display text-headline-xl leading-tight">{ex.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{ex.cue}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ex.primaryMuscles.map((m) => (
            <Badge key={m} variant="primary">
              {m}
            </Badge>
          ))}
          {ex.secondaryMuscles.map((m) => (
            <Badge key={m} variant="outline">
              {m}
            </Badge>
          ))}
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Estimated 1RM</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="num font-display text-numeric-display">{Math.round(pr * 10) / 10} kg</p>
          <ExerciseProgressChart points={points} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.slice(-10).reverse().map((s: any) => {
            const entry = (s.entries ?? []).find((e: any) => e.exerciseId === id);
            const sets = (entry?.sets ?? []).filter((x: any) => !x.isWarmup);
            return (
              <div
                key={String(s._id)}
                className="flex justify-between rounded-md bg-surface-low px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">
                  {new Date(s.startedAt).toLocaleDateString()}
                </span>
                <span className="num">
                  {sets.map((set: any) => `${set.weight}×${set.reps}`).join("  ")}
                </span>
              </div>
            );
          })}
          {sessions.length === 0 && (
            <p className="text-muted-foreground text-sm">No history for this exercise yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
