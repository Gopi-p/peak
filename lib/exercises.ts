import exercisesJson from "@/data/exercises.json";
import type {
  Difficulty,
  Equipment,
  MovementPattern,
  MuscleGroup,
} from "./constants";

export type Exercise = {
  id: string;
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  movementPattern: MovementPattern;
  evidenceRating: 1 | 2 | 3 | 4 | 5;
  cue: string;
  difficulty: Difficulty;
};

type ExercisesFile = {
  version: string;
  exercises: Exercise[];
};

const data = exercisesJson as ExercisesFile;

export const EXERCISES: Exercise[] = data.exercises;

const byId = new Map<string, Exercise>(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): Exercise | undefined {
  return byId.get(id);
}

export function exercisesForMuscle(
  muscle: MuscleGroup,
  opts?: { includeSecondary?: boolean },
): Exercise[] {
  const includeSecondary = opts?.includeSecondary ?? false;
  return EXERCISES.filter((e) => {
    if (e.primaryMuscles.includes(muscle)) return true;
    if (includeSecondary && e.secondaryMuscles.includes(muscle)) return true;
    return false;
  });
}

/**
 * Rank exercises for picker:
 * 1) evidence rating desc
 * 2) demote top-3 most-used in last 14 days for variety
 * 3) alphabetical
 */
export function rankExercises(
  candidates: Exercise[],
  recentUsageById: Record<string, number>,
): Exercise[] {
  const sortedByUsage = Object.entries(recentUsageById)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => id);
  const recentSet = new Set(sortedByUsage);

  return [...candidates].sort((a, b) => {
    const aPenalty = recentSet.has(a.id) ? -0.4 : 0;
    const bPenalty = recentSet.has(b.id) ? -0.4 : 0;
    const aScore = a.evidenceRating + aPenalty;
    const bScore = b.evidenceRating + bPenalty;
    if (aScore !== bScore) return bScore - aScore;
    return a.name.localeCompare(b.name);
  });
}
