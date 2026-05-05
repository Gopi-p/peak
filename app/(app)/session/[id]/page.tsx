import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { getExercise } from "@/lib/exercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sessionVolume } from "@/lib/analytics/volume";
import { ActiveSessionActions } from "./active-session-actions";

export const dynamic = "force-dynamic";

export default async function ActiveSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireUser();
  await connectDb();
  const session = await Session.findOne({ _id: id, ownerEmail: email }).lean<any>();
  if (!session) notFound();

  const startedAt = new Date(session.startedAt);
  const elapsedMin = Math.floor((Date.now() - startedAt.getTime()) / 60000);
  const totalSets = (session.entries ?? []).reduce(
    (n: number, e: any) => n + (e.sets?.length ?? 0),
    0,
  );
  const volume = sessionVolume({
    startedAt: session.startedAt,
    entries: (session.entries ?? []).map((e: any) => ({
      exerciseId: e.exerciseId,
      sets: e.sets ?? [],
    })),
  });

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Active session</p>
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-headline-xl">{elapsedMin} min</h1>
          <div className="text-right">
            <p className="num text-body-lg">{Math.round(volume)} kg·reps</p>
            <p className="text-xs text-muted-foreground">{totalSets} sets total</p>
          </div>
        </div>
        {session.musclesTrained?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {session.musclesTrained.map((m: string) => (
              <Badge key={m} variant="primary">
                {m}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <div className="space-y-3">
        {(session.entries ?? []).map((entry: any) => {
          const ex = getExercise(entry.exerciseId);
          return (
            <Card key={entry._id?.toString() ?? entry.exerciseId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{ex?.name ?? entry.exerciseId}</CardTitle>
                  {ex && (
                    <span className="text-xs text-muted-foreground">{ex.equipment}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {(entry.sets ?? []).length === 0 && (
                  <p className="text-muted-foreground text-sm">No sets yet.</p>
                )}
                {(entry.sets ?? []).map((set: any, i: number) => (
                  <div
                    key={set._id?.toString() ?? i}
                    className="flex items-center justify-between rounded-md bg-surface-low px-3 py-2 text-body-md"
                  >
                    <span className="text-muted-foreground text-sm">{i + 1}</span>
                    <span className="num">
                      {set.weight} kg × {set.reps}
                      {set.rpe ? ` @ ${set.rpe}` : ""}
                      {set.isWarmup ? " · warmup" : ""}
                    </span>
                  </div>
                ))}
                <Button asChild size="lg" variant="secondary" className="w-full mt-2">
                  <Link href={`/session/${id}/log?entryId=${entry._id}`}>Add set</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        <Button asChild size="xl">
          <Link href={`/session/${id}/muscle`}>Add exercise</Link>
        </Button>
        <ActiveSessionActions sessionId={id} />
      </div>
    </div>
  );
}
