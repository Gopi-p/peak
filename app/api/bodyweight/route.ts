import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { BodyWeight } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { bodyWeightSchema } from "@/lib/validations";
import { parseJson } from "@/lib/api-utils";

export async function GET() {
  const { email } = await requireUser();
  await connectDb();
  const entries = await BodyWeight.find({ ownerEmail: email, deletedAt: null })
    .sort({ measuredAt: -1 })
    .limit(180)
    .lean();
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const { email } = await requireUser();
  const body = await parseJson(req, bodyWeightSchema);
  if (body instanceof NextResponse) return body;
  await connectDb();
  const doc = await BodyWeight.create({
    ownerEmail: email,
    kg: body.kg,
    measuredAt: body.measuredAt ?? new Date(),
    note: body.note ?? "",
  });
  return NextResponse.json({ id: String(doc._id) }, { status: 201 });
}
