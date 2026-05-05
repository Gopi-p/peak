import type { WeekRollup } from "./volume";

/**
 * Sums per-muscle volume in a week into a single weekly total.
 * Secondary contributions are already 0.5x in the rollup.
 */
function totalWeeklyVolume(week: WeekRollup): number {
  return Object.values(week.volumeByMuscle).reduce((a, b) => a + b, 0);
}

/**
 * Detects a "deload" — last completed week's total volume dropped > 30%
 * from the previous week's total. Used to nudge: was this intentional?
 */
export function detectDeload(weeks: WeekRollup[]): {
  isDeload: boolean;
  dropPct: number | null;
} {
  if (weeks.length < 2) return { isDeload: false, dropPct: null };
  const last = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2];
  const lastV = totalWeeklyVolume(last);
  const prevV = totalWeeklyVolume(prev);
  if (prevV <= 0) return { isDeload: false, dropPct: null };
  const drop = (prevV - lastV) / prevV;
  return { isDeload: drop > 0.3, dropPct: drop };
}
