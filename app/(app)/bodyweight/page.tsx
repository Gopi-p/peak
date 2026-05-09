import { connectDb } from "@/lib/db/connect";
import { BodyWeight } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BodyWeightForm } from "./bodyweight-form";
import { BodyWeightChart } from "@/components/peak/bodyweight-chart";
import { RecentEntries } from "./recent-entries";

export const dynamic = "force-dynamic";

export default async function BodyWeightPage() {
  const { email } = await requireUser();
  await connectDb();
  const entries = await BodyWeight.find({ ownerEmail: email, deletedAt: null })
    .sort({ measuredAt: 1 })
    .limit(180)
    .lean<any[]>();
  const last = entries[entries.length - 1];
  const points = entries.map((e) => ({
    date: new Date(e.measuredAt).toISOString().slice(0, 10),
    kg: e.kg,
  }));
  const recent = [...entries]
    .reverse()
    .slice(0, 14)
    .map((e) => ({
      id: String(e._id),
      kg: e.kg,
      measuredAt: new Date(e.measuredAt).toISOString(),
    }));

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Body weight</p>
        <h1 className="font-display text-headline-xl">
          {last ? `${last.kg} kg` : "Log your first weight"}
        </h1>
      </header>
      <BodyWeightForm />
      <Card>
        <CardHeader>
          <CardTitle>Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <BodyWeightChart points={points} />
        </CardContent>
      </Card>
      <RecentEntries entries={recent} />
    </div>
  );
}
