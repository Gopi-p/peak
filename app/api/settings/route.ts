import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/connect";
import { Settings } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { settingsSchema } from "@/lib/validations";

export async function GET() {
  const { email } = await requireUser();
  await connectDb();
  const s = await Settings.findOne({ ownerEmail: email }).lean();
  return NextResponse.json({ settings: s });
}

export async function PATCH(req: Request) {
  const { email } = await requireUser();
  const patch = settingsSchema.parse(await req.json());
  await connectDb();
  const s = await Settings.findOneAndUpdate(
    { ownerEmail: email },
    { ...patch, ownerEmail: email },
    { upsert: true, new: true },
  ).lean();
  return NextResponse.json({ settings: s });
}
