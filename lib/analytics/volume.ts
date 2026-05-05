import { startOfWeek } from "@/lib/utils";
import { getExercise } from "@/lib/exercises";
import type { MuscleGroup } from "@/lib/constants";

export type WorkingSet = {
  weight: number;
  reps: number;
  isWarmup?: boolean;
  rpe?: number;
};

export type SessionLike = {
  startedAt: Date | string;
  entries: { exerciseId: string; sets: WorkingSet[] }[];
};

/** Volume = Σ weight × reps, excluding warmups. */
export function sessionVolume(session: SessionLike): number {
  return session.entries.reduce((acc, entry) => {
    return (
      acc +
      entry.sets.reduce(
        (s, set) => (set.isWarmup ? s : s + set.weight * set.reps),
        0,
      )
    );
  }, 0);
}

export function setsByMuscleForSession(session: SessionLike): Record<string, number> {
  const out: Record<string, number> = {};
  for (const entry of session.entries) {
    const ex = getExercise(entry.exerciseId);
    if (!ex) continue;
    const working = entry.sets.filter((s) => !s.isWarmup).length;
    for (const m of ex.primaryMuscles) {
      out[m] = (out[m] ?? 0) + working;
    }
    // Secondary counted at 0.5 — common heuristic.
    for (const m of ex.secondaryMuscles) {
      out[m] = (out[m] ?? 0) + working * 0.5;
    }
  }
  return out;
}

export type WeekRollup = {
  weekStart: Date;
  setsByMuscle: Record<string, number>;
  volumeByMuscle: Record<string, number>;
  sessionsCount: number;
  avgRpe: number | null;
};

export function rollupByWeek(sessions: SessionLike[]): WeekRollup[] {
  const buckets = new Map<string, WeekRollup>();
  for (const s of sessions) {
    const ws = startOfWeek(new Date(s.startedAt));
    const key = ws.toISOString();
    const bucket = buckets.get(key) ?? {
      weekStart: ws,
      setsByMuscle: {},
      volumeByMuscle: {},
      sessionsCount: 0,
      avgRpe: null,
    };
    bucket.sessionsCount += 1;
    let rpeTotal = 0;
    let rpeCount = 0;
    for (const entry of s.entries) {
      const ex = getExercise(entry.exerciseId);
      if (!ex) continue;
      for (const set of entry.sets) {
        if (set.isWarmup) continue;
        const vol = set.weight * set.reps;
        for (const m of ex.primaryMuscles) {
          bucket.setsByMuscle[m] = (bucket.setsByMuscle[m] ?? 0) + 1;
          bucket.volumeByMuscle[m] = (bucket.volumeByMuscle[m] ?? 0) + vol;
        }
        for (const m of ex.secondaryMuscles) {
          bucket.setsByMuscle[m] = (bucket.setsByMuscle[m] ?? 0) + 0.5;
          bucket.volumeByMuscle[m] = (bucket.volumeByMuscle[m] ?? 0) + vol * 0.5;
        }
        if (typeof set.rpe === "number") {
          rpeTotal += set.rpe;
          rpeCount += 1;
        }
      }
    }
    bucket.avgRpe =
      rpeCount > 0
        ? ((bucket.avgRpe ?? 0) * (bucket.sessionsCount - 1) + rpeTotal / rpeCount) /
          bucket.sessionsCount
        : bucket.avgRpe;
    buckets.set(key, bucket);
  }
  return [...buckets.values()].sort(
    (a, b) => a.weekStart.getTime() - b.weekStart.getTime(),
  );
}

/**
 * Returns muscles that haven't been worked above MEV in the last 7 days.
 * Used for the "Undertrained this week" callout.
 */
export function undertrainedMuscles(
  weekRollup: WeekRollup | undefined,
  guidance: Record<MuscleGroup, { mev: number }>,
): { muscle: MuscleGroup; sets: number; mev: number }[] {
  if (!weekRollup) {
    return Object.entries(guidance).map(([m, g]) => ({
      muscle: m as MuscleGroup,
      sets: 0,
      mev: g.mev,
    }));
  }
  return Object.entries(guidance)
    .map(([m, g]) => ({
      muscle: m as MuscleGroup,
      sets: weekRollup.setsByMuscle[m] ?? 0,
      mev: g.mev,
    }))
    .filter((x) => x.sets < x.mev)
    .sort((a, b) => a.sets - b.sets);
}
