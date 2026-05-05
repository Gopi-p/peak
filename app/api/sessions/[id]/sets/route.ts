import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { Session, PersonalRecord } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { z } from "zod";
import { setSchema } from "@/lib/validations";
import { checkPr } from "@/lib/analytics/pr";

const inputSchema = setSchema.extend({ entryId: z.string() });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { email } = await requireUser();
  const body = inputSchema.parse(await req.json());

  await connectDb();
  const session = await Session.findOne({ _id: id, ownerEmail: email });
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });
  const entry = session.entries.id(body.entryId);
  if (!entry) return NextResponse.json({ error: "entry not found" }, { status: 404 });
  entry.sets.push({
    weight: body.weight,
    reps: body.reps,
    rpe: body.rpe,
    isWarmup: body.isWarmup ?? false,
    tags: body.tags ?? [],
    completedAt: body.completedAt ?? new Date(),
    clientId: body.clientId,
  });
  await session.save();

  // PR check — pull all historical working sets for this exercise.
  let pr = { isPr: false, kind: null as null | string };
  if (!body.isWarmup) {
    const history = await Session.find(
      { ownerEmail: email, "entries.exerciseId": entry.exerciseId, _id: { $ne: session._id } },
      { entries: 1 },
    ).lean<any[]>();
    const sets: { weight: number; reps: number }[] = [];
    for (const s of history) {
      for (const e of s.entries ?? []) {
        if (e.exerciseId !== entry.exerciseId) continue;
        for (const set of e.sets ?? []) {
          if (!set.isWarmup) sets.push({ weight: set.weight, reps: set.reps });
        }
      }
    }
    const result = checkPr({ weight: body.weight, reps: body.reps }, sets);
    if (result.isPr) {
      await PersonalRecord.create({
        ownerEmail: email,
        exerciseId: entry.exerciseId,
        kind: result.kind!,
        weight: body.weight,
        reps: body.reps,
        estimated1RM: result.estimated1RM,
        achievedAt: new Date(),
        sessionId: session._id,
      });
      pr = { isPr: true, kind: result.kind };
    }
  }

  return NextResponse.json({ ok: true, pr });
}
