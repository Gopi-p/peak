import type { CombinationLabel } from "@/lib/constants";
import type { MuscleGroup } from "@/lib/constants";

const PUSH = new Set<MuscleGroup>(["Chest", "Shoulders", "Triceps"]);
const PULL = new Set<MuscleGroup>(["Back", "Biceps", "Traps", "Forearms"]);
const LEGS = new Set<MuscleGroup>(["Quads", "Hamstrings", "Glutes", "Calves"]);

export function classifyCombination(muscles: MuscleGroup[]): {
  label: CombinationLabel;
  note: string;
} {
  const set = new Set(muscles);
  const inPush = [...set].filter((m) => PUSH.has(m)).length;
  const inPull = [...set].filter((m) => PULL.has(m)).length;
  const inLegs = [...set].filter((m) => LEGS.has(m)).length;
  const total = set.size;

  if (total === 0) return { label: "Unusual", note: "No muscles trained yet." };

  if (inPush === total && total >= 2) {
    return {
      label: "Push",
      note: "Classic push pairing — chest, shoulders and triceps share the press pattern.",
    };
  }
  if (inPull === total && total >= 2) {
    return {
      label: "Pull",
      note: "Classic pull pairing — back and biceps move together.",
    };
  }
  if (inLegs === total && total >= 2) {
    return { label: "Legs", note: "Lower body day. Recovery cost is high — eat and sleep." };
  }
  if (inPush > 0 && inPull > 0 && inLegs === 0) {
    if (set.has("Chest") && set.has("Back")) {
      return {
        label: "Antagonist",
        note: "Chest + Back is a classic antagonist pairing — fatigue interference is low.",
      };
    }
    return {
      label: "Upper",
      note: "Upper body session mixing push and pull patterns.",
    };
  }
  if (inLegs > 0 && inPush === 0 && inPull === 0) {
    return { label: "Lower", note: "Lower-only session." };
  }
  if (inPush + inPull >= 2 && inLegs >= 1) {
    return {
      label: "Full Body",
      note: "Full body session. High systemic fatigue — keep volume modest per muscle.",
    };
  }
  return {
    label: "Unusual",
    note: "Unusual pairing. Not synergistic, but viable if intentional.",
  };
}
