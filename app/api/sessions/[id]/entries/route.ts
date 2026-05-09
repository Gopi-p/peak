import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { getExercise } from "@/lib/exercises";
import { MUSCLE_GROUPS, type MuscleGroup } from "@/lib/constants";
import { redirect } from "next/navigation";

/**
 * Adds an exercise entry to the active session and redirects into the set logger.
 * URL params: ?exerciseId=...&muscle=...
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { email } = await requireUser();
  const url = new URL(req.url);
  const exerciseId = url.searchParams.get("exerciseId");
  const muscle = url.searchParams.get("muscle");
  if (!exerciseId) return NextResponse.json({ error: "exerciseId required" }, { status: 400 });
  const ex = getExercise(exerciseId);
  if (!ex) return NextResponse.json({ error: "unknown exercise" }, { status: 400 });

  await connectDb();
  const session = await Session.findOne({ _id: id, ownerEmail: email, deletedAt: null });
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });
  const order = (session.entries?.length ?? 0) + 1;
  session.entries.push({ exerciseId, sets: [], notes: "", order });
  if (muscle && MUSCLE_GROUPS.includes(muscle as MuscleGroup)) {
    if (!session.musclesTrained.includes(muscle as MuscleGroup)) {
      session.musclesTrained.push(muscle as MuscleGroup);
    }
  }
  await session.save();
  const newEntry = session.entries[session.entries.length - 1];
  redirect(`/session/${id}/log?entryId=${String(newEntry._id)}`);
}
