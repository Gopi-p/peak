import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { sessionCreateSchema } from "@/lib/validations";
import { redirect } from "next/navigation";

export async function GET() {
  const { email } = await requireUser();
  await connectDb();
  const sessions = await Session.find({ ownerEmail: email, deletedAt: null })
    .sort({ startedAt: -1 })
    .limit(50)
    .lean();
  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const { email } = await requireUser();
  let payload: Record<string, unknown> = {};
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      payload = await req.json();
    } catch {}
  }
  const parsed = sessionCreateSchema.parse(payload);
  await connectDb();
  const doc = await Session.create({
    ownerEmail: email,
    startedAt: parsed.startedAt ?? new Date(),
    clientId: parsed.clientId,
  });
  if (ct.includes("application/json")) {
    return NextResponse.json({ id: String(doc._id) }, { status: 201 });
  }
  // form-post path → redirect into the active session
  redirect(`/session/${String(doc._id)}`);
}
