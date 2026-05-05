import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { exercisesForMuscle, rankExercises } from "@/lib/exercises";
import { MUSCLE_GROUPS, type MuscleGroup } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ExercisePickerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ muscle?: string }>;
}) {
  const { id } = await params;
  const { muscle } = await searchParams;
  if (!muscle || !MUSCLE_GROUPS.includes(muscle as MuscleGroup)) notFound();

  const { email } = await requireUser();
  await connectDb();
  const since = new Date();
  since.setDate(since.getDate() - 14);
  const recent = await Session.find({
    ownerEmail: email,
    startedAt: { $gte: since },
  }).lean<any[]>();
  const usage: Record<string, number> = {};
  for (const s of recent) {
    for (const e of s.entries ?? []) {
      usage[e.exerciseId] = (usage[e.exerciseId] ?? 0) + 1;
    }
  }
  const ranked = rankExercises(exercisesForMuscle(muscle as MuscleGroup), usage);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{muscle}</p>
        <h1 className="font-display text-headline-xl">Pick an exercise</h1>
      </header>
      <Card>
        <CardContent className="divide-y divide-outline-variant/40 p-0">
          {ranked.map((ex) => (
            <Link
              key={ex.id}
              href={`/api/sessions/${id}/entries?exerciseId=${ex.id}&muscle=${encodeURIComponent(muscle)}`}
              prefetch={false}
              className="flex items-start justify-between gap-3 p-edge hover:bg-surface-high"
            >
              <div className="min-w-0">
                <p className="font-display text-body-lg leading-tight">{ex.name}</p>
                <p className="text-xs text-muted-foreground">
                  {ex.equipment} · {ex.movementPattern} · {ex.difficulty}
                </p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{ex.cue}</p>
              </div>
              <div className="shrink-0 text-right">
                <Badge variant="primary">{"★".repeat(ex.evidenceRating)}</Badge>
                {usage[ex.id] ? (
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {usage[ex.id]}× recent
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
