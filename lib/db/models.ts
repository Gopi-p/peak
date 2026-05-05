import mongoose, { Schema, model, models } from "mongoose";
import { MUSCLE_GROUPS } from "@/lib/constants";

/**
 * Single-user app: ownerEmail is on every document so a hardcoded email gate
 * still cleanly partitions data if we ever need to reset / share / export.
 */

const SetSchema = new Schema(
  {
    weight: { type: Number, required: true, min: 0 },
    reps: { type: Number, required: true, min: 0, max: 200 },
    rpe: { type: Number, min: 1, max: 10 },
    isWarmup: { type: Boolean, default: false },
    tags: { type: [String], default: [] }, // "to-failure", "drop-set", etc.
    completedAt: { type: Date, required: true, default: () => new Date() },
    clientId: { type: String }, // dedupe id from offline client
  },
  { _id: true, timestamps: false },
);

const ExerciseEntrySchema = new Schema(
  {
    exerciseId: { type: String, required: true }, // slug from exercises.json
    sets: { type: [SetSchema], default: [] },
    notes: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: false },
);

const SessionSchema = new Schema(
  {
    ownerEmail: { type: String, required: true, index: true },
    startedAt: { type: Date, required: true, default: () => new Date() },
    endedAt: { type: Date },
    musclesTrained: {
      type: [String],
      enum: MUSCLE_GROUPS,
      default: [],
    },
    entries: { type: [ExerciseEntrySchema], default: [] },
    notes: { type: String, default: "" },
    classification: { type: String }, // Push / Pull / Legs / Unusual / etc.
    clientId: { type: String, index: true },
  },
  { timestamps: true },
);

const BodyWeightSchema = new Schema(
  {
    ownerEmail: { type: String, required: true, index: true },
    kg: { type: Number, required: true, min: 20, max: 300 },
    measuredAt: { type: Date, required: true, default: () => new Date() },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

const GoalSchema = new Schema(
  {
    ownerEmail: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["lift-target", "weekly-sets", "bodyweight", "frequency"],
      required: true,
    },
    targetValue: { type: Number, required: true },
    targetUnit: { type: String, default: "" }, // kg, sets, kg/week, etc.
    exerciseId: { type: String }, // for lift-target
    muscle: { type: String, enum: MUSCLE_GROUPS }, // for weekly-sets per muscle
    deadline: { type: Date },
    completedAt: { type: Date },
    archivedAt: { type: Date },
  },
  { timestamps: true },
);

const PersonalRecordSchema = new Schema(
  {
    ownerEmail: { type: String, required: true, index: true },
    exerciseId: { type: String, required: true, index: true },
    kind: { type: String, enum: ["weight-for-reps", "estimated-1rm"], required: true },
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
    estimated1RM: { type: Number, required: true },
    achievedAt: { type: Date, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
  },
  { timestamps: true },
);

const SettingsSchema = new Schema(
  {
    ownerEmail: { type: String, required: true, unique: true },
    units: { type: String, enum: ["kg", "lbs"], default: "kg" },
    defaultRestSeconds: { type: Number, default: 90 },
    rpeEnabled: { type: Boolean, default: true },
    showWarmups: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type SetDoc = mongoose.InferSchemaType<typeof SetSchema>;
export type ExerciseEntryDoc = mongoose.InferSchemaType<typeof ExerciseEntrySchema>;
export type SessionDoc = mongoose.InferSchemaType<typeof SessionSchema>;
export type BodyWeightDoc = mongoose.InferSchemaType<typeof BodyWeightSchema>;
export type GoalDoc = mongoose.InferSchemaType<typeof GoalSchema>;
export type PersonalRecordDoc = mongoose.InferSchemaType<typeof PersonalRecordSchema>;
export type SettingsDoc = mongoose.InferSchemaType<typeof SettingsSchema>;

export const Session = models.Session || model("Session", SessionSchema);
export const BodyWeight = models.BodyWeight || model("BodyWeight", BodyWeightSchema);
export const Goal = models.Goal || model("Goal", GoalSchema);
export const PersonalRecord =
  models.PersonalRecord || model("PersonalRecord", PersonalRecordSchema);
export const Settings = models.Settings || model("Settings", SettingsSchema);
