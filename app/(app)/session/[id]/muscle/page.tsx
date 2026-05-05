import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { rollupByWeek } from "@/lib/analytics/volume";
import { startOfWeek } from "@/lib/utils";
import { MusclePicker } from "./muscle-picker";

export const dynamic = "force-dynamic";

export default async function MusclePickerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireUser();
  await connectDb();
  const since = startOfWeek(new Date());
  const sessions = await Session.find({
    ownerEmail: email,
    startedAt: { $gte: since },
  }).lean<any[]>();
  const week = rollupByWeek(
    sessions.map((s) => ({
      startedAt: s.startedAt,
      entries: (s.entries ?? []).map((e: any) => ({ exerciseId: e.exerciseId, sets: e.sets ?? [] })),
    })),
  )[0];
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Pick a muscle</p>
        <h1 className="font-display text-headline-xl">What's the next muscle?</h1>
      </header>
      <MusclePicker sessionId={id} setsByMuscleThisWeek={week?.setsByMuscle ?? {}} />
    </div>
  );
}
