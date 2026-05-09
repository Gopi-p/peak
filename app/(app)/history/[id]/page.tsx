import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { getExercise } from "@/lib/exercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackBar } from "@/components/peak/back-bar";
import { DeleteSessionButton } from "./delete-session-button";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireUser();
  await connectDb();
  const session = await Session.findOne({ _id: id, ownerEmail: email, deletedAt: null }).lean<any>();
  if (!session) notFound();

  return (
    <div className="space-y-5">
      <BackBar fallbackHref="/history" />
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Session</p>
        <h1 className="font-display text-headline-xl">
          {new Date(session.startedAt).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h1>
        {session.classification && (
          <Badge variant="primary" className="mt-2">
            {session.classification}
          </Badge>
        )}
      </header>
      {(session.entries ?? []).map((entry: any) => {
        const ex = getExercise(entry.exerciseId);
        return (
          <Card key={entry._id?.toString() ?? entry.exerciseId}>
            <CardHeader>
              <CardTitle>{ex?.name ?? entry.exerciseId}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {(entry.sets ?? []).map((set: any, i: number) => (
                <div
                  key={set._id?.toString() ?? i}
                  className="flex justify-between rounded-md bg-surface-low px-3 py-2 text-body-md"
                >
                  <span className="text-muted-foreground text-sm">{i + 1}</span>
                  <span className="num">
                    {set.weight} kg × {set.reps}
                    {set.rpe ? ` @ ${set.rpe}` : ""}
                    {set.isWarmup ? " · warmup" : ""}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <DeleteSessionButton sessionId={String(session._id)} />
    </div>
  );
}
