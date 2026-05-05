import Link from "next/link";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { email } = await requireUser();
  await connectDb();
  const sessions = await Session.find({ ownerEmail: email })
    .sort({ startedAt: -1 })
    .limit(60)
    .lean<any[]>();

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">History</p>
        <h1 className="font-display text-headline-xl">Past sessions</h1>
      </header>
      <Card>
        <CardContent className="divide-y divide-outline-variant/40 p-0">
          {sessions.map((s) => {
            const totalSets = (s.entries ?? []).reduce(
              (n: number, e: any) => n + (e.sets?.length ?? 0),
              0,
            );
            return (
              <Link
                key={String(s._id)}
                href={`/history/${String(s._id)}`}
                className="flex items-center justify-between gap-3 p-edge hover:bg-surface-high"
              >
                <div>
                  <p className="text-body-md">
                    {new Date(s.startedAt).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(s.musclesTrained ?? []).join(" · ") || "no muscles tagged"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-body-md">{totalSets} sets</p>
                  {s.classification && (
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {s.classification}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
          {sessions.length === 0 && (
            <p className="p-edge text-muted-foreground text-sm">No sessions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
