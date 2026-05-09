import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { BodyWeight } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { email } = await requireUser();
  await connectDb();
  const entry = await BodyWeight.findOneAndUpdate(
    { _id: id, ownerEmail: email, deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );
  if (!entry) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
