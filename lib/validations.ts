import { z } from "zod";
import { MUSCLE_GROUPS } from "./constants";

export const muscleGroupSchema = z.enum(MUSCLE_GROUPS);

export const setSchema = z.object({
  weight: z.number().min(0).max(1000),
  reps: z.number().int().min(0).max(200),
  rpe: z.number().min(1).max(10).optional(),
  isWarmup: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  completedAt: z.coerce.date().optional(),
  clientId: z.string().optional(),
});
export type SetInput = z.infer<typeof setSchema>;

export const exerciseEntrySchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.array(setSchema).default([]),
  notes: z.string().max(2000).optional().default(""),
  order: z.number().int().optional().default(0),
});
export type ExerciseEntryInput = z.infer<typeof exerciseEntrySchema>;

export const sessionCreateSchema = z.object({
  startedAt: z.coerce.date().optional(),
  clientId: z.string().optional(),
});

export const sessionPatchSchema = z.object({
  endedAt: z.coerce.date().optional(),
  musclesTrained: z.array(muscleGroupSchema).optional(),
  entries: z.array(exerciseEntrySchema).optional(),
  notes: z.string().max(2000).optional(),
  classification: z.string().optional(),
});

export const bodyWeightSchema = z.object({
  kg: z.number().min(20).max(300),
  measuredAt: z.coerce.date().optional(),
  note: z.string().max(500).optional(),
});

export const goalSchema = z.object({
  title: z.string().min(1).max(120),
  type: z.enum(["lift-target", "weekly-sets", "bodyweight", "frequency"]),
  targetValue: z.number(),
  targetUnit: z.string().optional(),
  exerciseId: z.string().optional(),
  muscle: muscleGroupSchema.optional(),
  deadline: z.coerce.date().optional(),
});

export const settingsSchema = z.object({
  units: z.enum(["kg", "lbs"]).optional(),
  defaultRestSeconds: z.number().int().min(15).max(600).optional(),
  rpeEnabled: z.boolean().optional(),
  showWarmups: z.boolean().optional(),
});

export const syncEnvelopeSchema = z.object({
  sessions: z.array(
    z.object({
      clientId: z.string(),
      startedAt: z.coerce.date(),
      endedAt: z.coerce.date().optional(),
      musclesTrained: z.array(muscleGroupSchema).default([]),
      entries: z.array(exerciseEntrySchema).default([]),
      notes: z.string().optional(),
      classification: z.string().optional(),
    }),
  ),
  bodyWeights: z.array(bodyWeightSchema).optional(),
});
