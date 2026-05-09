import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { Goal } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { goalSchema } from "@/lib/validations";
import { parseJson } from "@/lib/api-utils";

export async function GET() {
  const { email } = await requireUser();
  await connectDb();
  const goals = await Goal.find({ ownerEmail: email, deletedAt: null }).lean();
  return NextResponse.json({ goals });
}

export async function POST(req: Request) {
  const { email } = await requireUser();
  const body = await parseJson(req, goalSchema);
  if (body instanceof NextResponse) return body;
  await connectDb();
  const doc = await Goal.create({ ...body, ownerEmail: email });
  return NextResponse.json({ id: String(doc._id) }, { status: 201 });
}
