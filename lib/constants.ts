export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Core",
  "Forearms",
  "Traps",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const MOVEMENT_PATTERNS = [
  "Press",
  "Pull",
  "Squat",
  "Hinge",
  "Carry",
  "Isolation",
] as const;
export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DEFAULT_REST_SECONDS = 90;

// Hypertrophy volume guidance (Renaissance Periodization simplified).
export const VOLUME_GUIDANCE: Record<MuscleGroup, { mev: number; mav: number; mrv: number }> = {
  Chest:      { mev: 8,  mav: 14, mrv: 22 },
  Back:       { mev: 10, mav: 16, mrv: 24 },
  Shoulders:  { mev: 8,  mav: 14, mrv: 22 },
  Biceps:     { mev: 6,  mav: 12, mrv: 20 },
  Triceps:    { mev: 6,  mav: 12, mrv: 20 },
  Quads:      { mev: 8,  mav: 14, mrv: 20 },
  Hamstrings: { mev: 6,  mav: 12, mrv: 20 },
  Glutes:     { mev: 6,  mav: 12, mrv: 20 },
  Calves:     { mev: 6,  mav: 12, mrv: 20 },
  Core:       { mev: 6,  mav: 12, mrv: 20 },
  Forearms:   { mev: 4,  mav: 8,  mrv: 14 },
  Traps:      { mev: 4,  mav: 10, mrv: 18 },
};

export type CombinationLabel =
  | "Push"
  | "Pull"
  | "Legs"
  | "Upper"
  | "Lower"
  | "Full Body"
  | "Antagonist"
  | "Unusual";
