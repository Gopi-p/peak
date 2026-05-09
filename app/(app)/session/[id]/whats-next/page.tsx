import Link from "next/link";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function WhatsNextPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { email } = await requireUser();
  await connectDb();
  const session = await Session.findOne({ _id: id, ownerEmail: email, deletedAt: null }).lean<any>();
  const lastEntry = session?.entries?.[session.entries.length - 1];
  const lastMuscle = session?.musclesTrained?.[session.musclesTrained.length - 1];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">What's next?</p>
        <h1 className="font-display text-headline-xl">Where do we go from here?</h1>
      </header>
      <Card>
        <CardContent className="space-y-3 pt-edge">
          {lastMuscle && (
            <Button asChild size="xl">
              <Link href={`/session/${id}/exercise?muscle=${encodeURIComponent(lastMuscle)}`}>
                Same muscle ({lastMuscle})
              </Link>
            </Button>
          )}
          <Button asChild size="xl" variant="secondary">
            <Link href={`/session/${id}/muscle`}>Different muscle</Link>
          </Button>
          <form action={`/api/sessions/${id}/finish`} method="POST">
            <Button type="submit" size="xl" variant="outline" className="w-full">
              Finish session
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
