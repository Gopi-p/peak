import { epley1RM } from "@/lib/utils";

type SetSnapshot = { weight: number; reps: number; rpe?: number; isWarmup?: boolean };

export type Suggestion = {
  weight: number;
  reps: number;
  rationale: string;
};

/**
 * Given the most-recent working sets for an exercise, suggest the next target.
 *
 * Rules (kept simple, RPE-aware when available):
 *   - If last RPE ≤ 7  → bump weight ~2.5kg or +1 rep at same weight.
 *   - If last RPE 8    → repeat weight, attempt one more rep on top set.
 *   - If last RPE 9–10 → repeat weight, same reps (consolidate).
 *   - Without RPE: if last session matched targets across all sets, bump 2.5kg; else repeat.
 */
export function suggestNext(lastWorkingSets: SetSnapshot[]): Suggestion | null {
  const sets = lastWorkingSets.filter((s) => !s.isWarmup);
  if (sets.length === 0) return null;
  const top = sets.reduce((a, b) => (epley1RM(a.weight, a.reps) > epley1RM(b.weight, b.reps) ? a : b));
  const rpe = top.rpe;

  if (rpe !== undefined) {
    if (rpe <= 7) {
      return {
        weight: roundToPlate(top.weight + 2.5),
        reps: top.reps,
        rationale: "Last set felt easy (RPE ≤ 7). Add a small jump.",
      };
    }
    if (rpe === 8) {
      return {
        weight: top.weight,
        reps: top.reps + 1,
        rationale: "RPE 8 last time — try one more rep at the same weight.",
      };
    }
    return {
      weight: top.weight,
      reps: top.reps,
      rationale: "RPE 9+ last time. Hold and consolidate.",
    };
  }

  // No RPE — naive: if reps matched across sets, bump.
  const allEqual = sets.every((s) => s.reps === sets[0].reps);
  if (allEqual) {
    return {
      weight: roundToPlate(top.weight + 2.5),
      reps: top.reps,
      rationale: "All sets hit the same reps last time. Time to add weight.",
    };
  }
  return {
    weight: top.weight,
    reps: top.reps,
    rationale: "Reps dropped last time. Repeat and stabilize first.",
  };
}

function roundToPlate(kg: number): number {
  return Math.round(kg * 2) / 2; // 0.5 kg steps
}
