import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { classifyCombination } from "@/lib/analytics/combo";
import type { MuscleGroup } from "@/lib/constants";
import { redirect } from "next/navigation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { email } = await requireUser();
  await connectDb();
  const session = await Session.findOne({ _id: id, ownerEmail: email, deletedAt: null });
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });
  session.endedAt = new Date();
  const combo = classifyCombination(
    (session.musclesTrained ?? []) as unknown as MuscleGroup[],
  );
  session.classification = combo.label;
  await session.save();

  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return NextResponse.json({ ok: true, sessionId: String(session._id) });
  }
  redirect(`/session/${String(session._id)}/summary`);
}
