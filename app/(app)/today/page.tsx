import Link from "next/link";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rollupByWeek, undertrainedMuscles } from "@/lib/analytics/volume";
import { VOLUME_GUIDANCE } from "@/lib/constants";
import { startOfWeek } from "@/lib/utils";
import { Flame } from "lucide-react";

export const dynamic = "force-dynamic";

async function getData(email: string) {
  await connectDb();
  const since = startOfWeek(new Date());
  since.setDate(since.getDate() - 28);
  const sessions = await Session.find({
    ownerEmail: email,
    startedAt: { $gte: since },
  })
    .sort({ startedAt: -1 })
    .lean();
  const active = sessions.find((s) => !s.endedAt);
  return { sessions: sessions.map(serialize), active: active ? serialize(active) : null };
}

function serialize(s: any) {
  return {
    id: String(s._id),
    startedAt: s.startedAt as Date,
    endedAt: (s.endedAt as Date | undefined) ?? null,
    musclesTrained: (s.musclesTrained as string[]) ?? [],
    entries: (s.entries ?? []).map((e: any) => ({
      exerciseId: e.exerciseId as string,
      sets: (e.sets ?? []).map((set: any) => ({
        weight: set.weight,
        reps: set.reps,
        rpe: set.rpe,
        isWarmup: set.isWarmup,
      })),
    })),
  };
}

export default async function TodayPage() {
  const { email } = await requireUser();
  const { sessions, active } = await getData(email);
  const weeks = rollupByWeek(sessions);
  const thisWeek = weeks[weeks.length - 1];
  const undertrained = undertrainedMuscles(thisWeek, VOLUME_GUIDANCE).slice(0, 3);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Today</p>
        <h1 className="font-display text-headline-xl">
          {active ? "Session in progress" : "Ready when you are"}
        </h1>
      </header>

      {active ? (
        <Card>
          <CardContent className="space-y-3 pt-edge">
            <p className="text-body-md text-muted-foreground">
              {active.entries.length} exercise{active.entries.length === 1 ? "" : "s"} ·{" "}
              {active.entries.reduce((n: number, e: any) => n + e.sets.length, 0)} sets
            </p>
            <div className="flex flex-wrap gap-2">
              {active.musclesTrained.map((m) => (
                <Badge key={m} variant="primary">
                  {m}
                </Badge>
              ))}
            </div>
            <Button asChild size="xl">
              <Link href={`/session/${active.id}`}>Resume session</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form action="/api/sessions" method="POST">
          <Button type="submit" size="xl">
            Start workout
          </Button>
        </form>
      )}

      <Card>
        <CardHeader>
          <CardTitle>This week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="num font-display text-numeric-display text-foreground">
              {thisWeek?.sessionsCount ?? 0}
            </span>
            <span className="text-muted-foreground">sessions</span>
          </div>
          {undertrained.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Undertrained
              </p>
              <ul className="space-y-1">
                {undertrained.map((u) => (
                  <li key={u.muscle} className="flex items-center gap-2 text-body-md">
                    <Flame className="h-4 w-4 text-tertiary" />
                    <span>
                      {u.muscle} — {Math.round(u.sets * 10) / 10} of {u.mev} sets
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.slice(0, 5).map((s) => (
            <Link
              key={s.id}
              href={`/history/${s.id}`}
              className="flex items-center justify-between rounded-md bg-surface-low px-3 py-3"
            >
              <div>
                <p className="text-body-md">
                  {new Date(s.startedAt).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.musclesTrained.join(" · ") || "no muscles tagged"}
                </p>
              </div>
              <span className="num text-muted-foreground text-sm">
                {s.entries.reduce((n: number, e: any) => n + e.sets.length, 0)} sets
              </span>
            </Link>
          ))}
          {sessions.length === 0 && (
            <p className="text-muted-foreground text-sm">No history yet — your first set is one tap away.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
