import { connectDb } from "@/lib/db/connect";
import { Session, BodyWeight } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { rollupByWeek, undertrainedMuscles } from "@/lib/analytics/volume";
import { detectDeload } from "@/lib/analytics/deload";
import { VOLUME_GUIDANCE, MUSCLE_GROUPS, type MuscleGroup } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklySetsChart } from "@/components/peak/weekly-sets-chart";
import { VolumeTrendChart } from "@/components/peak/volume-trend-chart";
import { MuscleHeatmap } from "@/components/peak/muscle-heatmap";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const { email } = await requireUser();
  await connectDb();
  const since = new Date();
  since.setDate(since.getDate() - 8 * 7);
  const sessions = await Session.find({
    ownerEmail: email,
    startedAt: { $gte: since },
  }).lean<any[]>();

  const sessLikes = sessions.map((s) => ({
    startedAt: s.startedAt,
    entries: (s.entries ?? []).map((e: any) => ({
      exerciseId: e.exerciseId,
      sets: e.sets ?? [],
    })),
  }));
  const weeks = rollupByWeek(sessLikes);
  const thisWeek = weeks[weeks.length - 1];
  const deload = detectDeload(weeks);
  const undertrained = undertrainedMuscles(thisWeek, VOLUME_GUIDANCE);

  const setsByMuscle = MUSCLE_GROUPS.map((m) => ({
    muscle: m as MuscleGroup,
    sets: Math.round((thisWeek?.setsByMuscle[m] ?? 0) * 10) / 10,
    mev: VOLUME_GUIDANCE[m].mev,
    mav: VOLUME_GUIDANCE[m].mav,
    mrv: VOLUME_GUIDANCE[m].mrv,
  }));

  const volumeTrend = weeks.map((w) => ({
    weekStart: w.weekStart.toISOString().slice(0, 10),
    volume: Math.round(
      Object.values(w.volumeByMuscle).reduce((a, b) => a + b, 0),
    ),
    sessions: w.sessionsCount,
  }));

  const heatmap: Record<MuscleGroup, number> = MUSCLE_GROUPS.reduce(
    (acc, m) => ({ ...acc, [m]: thisWeek?.setsByMuscle[m] ?? 0 }),
    {} as Record<MuscleGroup, number>,
  );

  const recentBw = await BodyWeight.find({ ownerEmail: email })
    .sort({ measuredAt: -1 })
    .limit(1)
    .lean<any[]>();

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Insights</p>
        <h1 className="font-display text-headline-xl">This week</h1>
      </header>

      {deload.isDeload && deload.dropPct !== null && (
        <Card>
          <CardContent className="pt-edge">
            <p className="text-tertiary">
              Volume dropped {(deload.dropPct * 100).toFixed(0)}% week-over-week.
              Was this an intentional deload?
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Weekly sets per muscle</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklySetsChart data={setsByMuscle} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume trend (8 weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <VolumeTrendChart
            points={volumeTrend}
            bodyWeightKg={recentBw[0]?.kg ?? null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Muscle balance</CardTitle>
        </CardHeader>
        <CardContent>
          <MuscleHeatmap data={heatmap} guidance={VOLUME_GUIDANCE} />
        </CardContent>
      </Card>

      {undertrained.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Undertrained</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {undertrained.slice(0, 6).map((u) => (
              <div
                key={u.muscle}
                className="flex items-center justify-between rounded-md bg-surface-low px-3 py-2"
              >
                <span>{u.muscle}</span>
                <Badge variant="outline">
                  {Math.round(u.sets * 10) / 10} / {u.mev} sets
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
