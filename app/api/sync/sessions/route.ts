import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { syncEnvelopeSchema } from "@/lib/validations";
import { parseJson } from "@/lib/api-utils";
import { classifyCombination } from "@/lib/analytics/combo";
import type { MuscleGroup } from "@/lib/constants";

/**
 * Idempotent bulk-upsert of offline sessions, keyed by clientId.
 * The client retries safely; the server is the source of truth on resolve.
 */
export async function POST(req: Request) {
  const { email } = await requireUser();
  const body = await parseJson(req, syncEnvelopeSchema);
  if (body instanceof NextResponse) return body;
  await connectDb();

  const upserted: { clientId: string; serverId: string }[] = [];
  for (const s of body.sessions) {
    const update = {
      ownerEmail: email,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      musclesTrained: s.musclesTrained,
      entries: s.entries,
      notes: s.notes ?? "",
      classification:
        s.classification ?? classifyCombination(s.musclesTrained as MuscleGroup[]).label,
    };
    const doc = await Session.findOneAndUpdate(
      { ownerEmail: email, clientId: s.clientId },
      { $set: update, $setOnInsert: { clientId: s.clientId } },
      { upsert: true, new: true },
    );
    upserted.push({ clientId: s.clientId, serverId: String(doc._id) });
  }
  return NextResponse.json({ upserted });
}
