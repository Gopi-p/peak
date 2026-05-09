import { connectDb } from "@/lib/db/connect";
import { Goal, Session, PersonalRecord } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoalForm } from "./goal-form";
import { DeleteGoalButton } from "./delete-goal-button";
import { rollupByWeek } from "@/lib/analytics/volume";
import { startOfWeek } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const { email } = await requireUser();
  await connectDb();
  const goals = await Goal.find({ ownerEmail: email, deletedAt: null })
    .sort({ createdAt: -1 })
    .lean<any[]>();
  const since = startOfWeek(new Date());
  const sessions = await Session.find({
    ownerEmail: email,
    deletedAt: null,
    startedAt: { $gte: since },
  }).lean<any[]>();
  const week = rollupByWeek(
    sessions.map((s) => ({
      startedAt: s.startedAt,
      entries: (s.entries ?? []).map((e: any) => ({
        exerciseId: e.exerciseId,
        sets: e.sets ?? [],
      })),
    })),
  )[0];
  const prs = await PersonalRecord.find({ ownerEmail: email }).lean<any[]>();

  const computeProgress = (g: any) => {
    if (g.type === "weekly-sets" && g.muscle) {
      const got = week?.setsByMuscle[g.muscle] ?? 0;
      return { current: Math.round(got * 10) / 10, target: g.targetValue };
    }
    if (g.type === "lift-target" && g.exerciseId) {
      const best = prs
        .filter((p) => p.exerciseId === g.exerciseId)
        .reduce((m, p) => Math.max(m, p.estimated1RM), 0);
      return { current: Math.round(best * 10) / 10, target: g.targetValue };
    }
    if (g.type === "frequency") {
      return { current: week?.sessionsCount ?? 0, target: g.targetValue };
    }
    return { current: 0, target: g.targetValue };
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Goals</p>
        <h1 className="font-display text-headline-xl">What are you chasing?</h1>
      </header>

      {goals.length === 0 && (
        <Card>
          <CardContent className="pt-edge text-muted-foreground">
            No goals yet. Add one below.
          </CardContent>
        </Card>
      )}

      {goals.map((g) => {
        const { current, target } = computeProgress(g);
        const pct = Math.min(100, Math.round((current / target) * 100));
        return (
          <Card key={String(g._id)}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-xl">{g.title}</CardTitle>
                <DeleteGoalButton goalId={String(g._id)} title={g.title} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="num font-display text-headline-lg">
                  {current} / {target}
                </span>
                <Badge variant="primary">{pct}%</Badge>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-low">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      <GoalForm />
    </div>
  );
}
