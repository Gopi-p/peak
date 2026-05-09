import mongoose, { Schema, model, models } from "mongoose";
import { MUSCLE_GROUPS } from "@/lib/constants";

/**
 * Single-user app. ownerEmail partitions data even though there is no auth.
 *
 * Soft-delete: top-level docs (Session, Goal, BodyWeight) carry `deletedAt`.
 * Lists and detail lookups must filter `deletedAt: null` (we do this
 * explicitly at each query site so the constraint is grep-able). Within an
 * active session, sets and entries are hard-deleted by pulling from the array.
 */

const SetSchema = new Schema(
  {
    weight: { type: Number, required: true, min: 0 }, // 0 is valid for bodyweight exercises
    reps: { type: Number, required: true, min: 1, max: 200 },
    rpe: { type: Number, min: 1, max: 10 },
    isWarmup: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    completedAt: { type: Date, required: true, default: () => new Date() },
    clientId: { type: String },
  },
  { _id: true, timestamps: false },
);

const ExerciseEntrySchema = new Schema(
  {
    exerciseId: { type: String, required: true },
    sets: { type: [SetSchema], default: [] },
    notes: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: false },
);

const SessionSchema = new Schema(
  {
    ownerEmail: { type: String, required: true },
    startedAt: { type: Date, required: true, default: () => new Date() },
    endedAt: { type: Date },
    musclesTrained: {
      type: [String],
      enum: MUSCLE_GROUPS,
      default: [],
    },
    entries: { type: [ExerciseEntrySchema], default: [] },
    notes: { type: String, default: "" },
    classification: { type: String },
    clientId: { type: String },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
SessionSchema.index({ ownerEmail: 1, deletedAt: 1, startedAt: -1 });
SessionSchema.index({ ownerEmail: 1, clientId: 1 });
SessionSchema.index({ ownerEmail: 1, "entries.exerciseId": 1, startedAt: 1 });

const BodyWeightSchema = new Schema(
  {
    ownerEmail: { type: String, required: true },
    kg: { type: Number, required: true, min: 20, max: 300 },
    measuredAt: { type: Date, required: true, default: () => new Date() },
    note: { type: String, default: "" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
BodyWeightSchema.index({ ownerEmail: 1, deletedAt: 1, measuredAt: -1 });

const GoalSchema = new Schema(
  {
    ownerEmail: { type: String, required: true },
    title: { type: String, required: true, maxlength: 120 },
    type: {
      type: String,
      enum: ["lift-target", "weekly-sets", "bodyweight", "frequency"],
      required: true,
    },
    targetValue: { type: Number, required: true, min: 0.0001 },
    targetUnit: { type: String, default: "" },
    exerciseId: { type: String },
    muscle: { type: String, enum: MUSCLE_GROUPS },
    deadline: { type: Date },
    completedAt: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
GoalSchema.index({ ownerEmail: 1, deletedAt: 1, createdAt: -1 });

const PersonalRecordSchema = new Schema(
  {
    ownerEmail: { type: String, required: true },
    exerciseId: { type: String, required: true },
    kind: { type: String, enum: ["weight-for-reps", "estimated-1rm"], required: true },
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
    estimated1RM: { type: Number, required: true },
    achievedAt: { type: Date, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
  },
  { timestamps: true },
);
PersonalRecordSchema.index({ ownerEmail: 1, exerciseId: 1, achievedAt: -1 });

const SettingsSchema = new Schema(
  {
    ownerEmail: { type: String, required: true, unique: true },
    defaultRestSeconds: { type: Number, default: 90 },
    rpeEnabled: { type: Boolean, default: true },
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
