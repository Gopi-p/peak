import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { Session, PersonalRecord } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";

/**
 * Hard-deletes a single set from an active session by pulling it out of the
 * embedded entry's set array. Used by the in-flow "remove last set" affordance.
 *
 * If the set was the trigger for a PR record, the PR is removed too — the
 * recompute on the next set will re-emit it if still applicable.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; setId: string }> },
) {
  const { id, setId } = await params;
  const { email } = await requireUser();
  await connectDb();
  const session = await Session.findOne({
    _id: id,
    ownerEmail: email,
    deletedAt: null,
  });
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  let removed = false;
  for (const entry of session.entries) {
    const set = entry.sets.id(setId);
    if (set) {
      set.deleteOne();
      removed = true;
      break;
    }
  }
  if (!removed) return NextResponse.json({ error: "set not found" }, { status: 404 });
  await session.save();
  await PersonalRecord.deleteMany({
    ownerEmail: email,
    sessionId: session._id,
    achievedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  });
  return NextResponse.json({ ok: true });
}
