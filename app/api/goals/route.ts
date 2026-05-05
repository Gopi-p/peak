import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { Goal } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { goalSchema } from "@/lib/validations";

export async function GET() {
  const { email } = await requireUser();
  await connectDb();
  const goals = await Goal.find({ ownerEmail: email, archivedAt: null }).lean();
  return NextResponse.json({ goals });
}

export async function POST(req: Request) {
  const { email } = await requireUser();
  const body = goalSchema.parse(await req.json());
  await connectDb();
  const doc = await Goal.create({ ...body, ownerEmail: email });
  return NextResponse.json({ id: String(doc._id) }, { status: 201 });
}
