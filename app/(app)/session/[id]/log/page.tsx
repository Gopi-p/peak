import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db/connect";
import { Session, Settings } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { getExercise } from "@/lib/exercises";
import { suggestNext } from "@/lib/analytics/overload";
import { BackBar } from "@/components/peak/back-bar";
import { SetLogger } from "./set-logger";

export const dynamic = "force-dynamic";

export default async function LogSetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ entryId?: string }>;
}) {
  const { id } = await params;
  const { entryId } = await searchParams;
  const { email } = await requireUser();
  await connectDb();
  const session = await Session.findOne({ _id: id, ownerEmail: email, deletedAt: null }).lean<any>();
  if (!session || !entryId) notFound();
  const entry = (session.entries ?? []).find((e: any) => String(e._id) === String(entryId));
  if (!entry) notFound();
  const ex = getExercise(entry.exerciseId);

  // Pull the most-recent prior session that has this exercise to preview last numbers.
  const prior = await Session.findOne({
    ownerEmail: email,
    deletedAt: null,
    "entries.exerciseId": entry.exerciseId,
    _id: { $ne: session._id },
  })
    .sort({ startedAt: -1 })
    .lean<any>();
  const lastEntry = prior?.entries?.find?.((e: any) => e.exerciseId === entry.exerciseId);
  const lastSets = (lastEntry?.sets ?? []).filter((s: any) => !s.isWarmup);
  const suggestion = suggestNext(lastSets);

  // Sets already logged in *this* session/entry — used as the highest-priority
  // prefill so set #2 starts where set #1 finished.
  const currentSets = (entry.sets ?? [])
    .filter((s: any) => !s.isWarmup)
    .map((s: any) => ({ weight: s.weight, reps: s.reps, rpe: s.rpe }));

  const settings = await Settings.findOne({ ownerEmail: email }).lean<any>();
  const restDefault = settings?.defaultRestSeconds ?? 90;
  const rpeEnabled = settings?.rpeEnabled ?? true;

  return (
    <>
      <BackBar fallbackHref={`/session/${id}`} />
      <SetLogger
        sessionId={id}
        entryId={String(entryId)}
        exerciseName={ex?.name ?? entry.exerciseId}
        cue={ex?.cue ?? ""}
        lastSets={lastSets.map((s: any) => ({ weight: s.weight, reps: s.reps, rpe: s.rpe }))}
        currentSets={currentSets}
        suggestion={suggestion}
        restDefault={restDefault}
        rpeEnabled={rpeEnabled}
      />
    </>
  );
}
