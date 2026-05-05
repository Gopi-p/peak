import { epley1RM } from "@/lib/utils";

export type PrCheck = {
  isPr: boolean;
  kind: "weight-for-reps" | "estimated-1rm" | null;
  estimated1RM: number;
};

export type HistoricalSet = { weight: number; reps: number };

/**
 * A new set is a PR if either:
 *   - same rep target hit at a higher weight (weight-for-reps), or
 *   - estimated 1RM exceeds previous best 1RM by ≥ 0.5kg.
 */
export function checkPr(
  newSet: { weight: number; reps: number },
  history: HistoricalSet[],
): PrCheck {
  const newE1RM = epley1RM(newSet.weight, newSet.reps);

  const sameRepBest = history
    .filter((s) => s.reps === newSet.reps)
    .reduce<number>((max, s) => Math.max(max, s.weight), 0);
  const e1RMBest = history.reduce<number>(
    (max, s) => Math.max(max, epley1RM(s.weight, s.reps)),
    0,
  );

  if (newSet.weight > sameRepBest) {
    return { isPr: true, kind: "weight-for-reps", estimated1RM: newE1RM };
  }
  if (newE1RM >= e1RMBest + 0.5) {
    return { isPr: true, kind: "estimated-1rm", estimated1RM: newE1RM };
  }
  return { isPr: false, kind: null, estimated1RM: newE1RM };
}
