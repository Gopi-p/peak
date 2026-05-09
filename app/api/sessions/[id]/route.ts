import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { Session, PersonalRecord } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";

/**
 * Soft-deletes a session and any PRs that referenced it. The session stays in
 * the collection so offline sync that arrives later can still match by
 * clientId without resurrecting the session for the user.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { email } = await requireUser();
  await connectDb();
  const session = await Session.findOneAndUpdate(
    { _id: id, ownerEmail: email, deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });
  await PersonalRecord.deleteMany({ ownerEmail: email, sessionId: session._id });
  return NextResponse.json({ ok: true });
}
