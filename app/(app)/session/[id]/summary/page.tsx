import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { sessionVolume, setsByMuscleForSession } from "@/lib/analytics/volume";
import { classifyCombination } from "@/lib/analytics/combo";
import type { MuscleGroup } from "@/lib/constants";
import { getExercise } from "@/lib/exercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireUser();
  await connectDb();
  const session = await Session.findOne({ _id: id, ownerEmail: email, deletedAt: null }).lean<any>();
  if (!session) notFound();
  const ended = session.endedAt ? new Date(session.endedAt) : new Date();
  const minutes = Math.max(
    1,
    Math.round((ended.getTime() - new Date(session.startedAt).getTime()) / 60000),
  );
  const sessLike = {
    startedAt: session.startedAt,
    entries: (session.entries ?? []).map((e: any) => ({
      exerciseId: e.exerciseId,
      sets: e.sets ?? [],
    })),
  };
  const volume = Math.round(sessionVolume(sessLike));
  const setsByMuscle = setsByMuscleForSession(sessLike);
  const muscles = (session.musclesTrained ?? []) as MuscleGroup[];
  const combo = classifyCombination(muscles);
  const totalSets = (session.entries ?? []).reduce(
    (n: number, e: any) => n + (e.sets?.length ?? 0),
    0,
  );

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Session summary</p>
        <h1 className="font-display text-headline-xl">Done.</h1>
      </header>

      <Card>
        <CardContent className="grid grid-cols-3 gap-3 pt-edge">
          <Stat label="Minutes" value={`${minutes}`} />
          <Stat label="Sets" value={`${totalSets}`} />
          <Stat label="Volume" value={`${volume}`} unit="kg·reps" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{combo.label} day</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-md text-muted-foreground">{combo.note}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {muscles.map((m) => (
              <Badge key={m} variant="primary">
                {m} · {Math.round((setsByMuscle[m] ?? 0) * 10) / 10}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(session.entries ?? []).map((entry: any) => {
            const ex = getExercise(entry.exerciseId);
            const setsCount = (entry.sets ?? []).length;
            const volEntry = (entry.sets ?? []).reduce(
              (a: number, s: any) => (s.isWarmup ? a : a + s.weight * s.reps),
              0,
            );
            return (
              <div
                key={entry._id?.toString() ?? entry.exerciseId}
                className="flex items-center justify-between rounded-md bg-surface-low px-3 py-2"
              >
                <span>{ex?.name ?? entry.exerciseId}</span>
                <span className="num text-sm text-muted-foreground">
                  {setsCount} sets · {Math.round(volEntry)} kg·reps
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Button asChild size="xl">
        <Link href="/today">Back to Today</Link>
      </Button>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="text-center">
      <p className="num font-display text-numeric-display">{value}</p>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
        {unit ? ` (${unit})` : ""}
      </p>
    </div>
  );
}
