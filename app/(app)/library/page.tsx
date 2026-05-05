import Link from "next/link";
import { EXERCISES } from "@/lib/exercises";
import { MUSCLE_GROUPS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LibraryPage() {
  const grouped = MUSCLE_GROUPS.map((m) => ({
    muscle: m,
    items: EXERCISES.filter((e) => e.primaryMuscles.includes(m)).sort(
      (a, b) => b.evidenceRating - a.evidenceRating || a.name.localeCompare(b.name),
    ),
  }));
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Library</p>
        <h1 className="font-display text-headline-xl">Exercises</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {EXERCISES.length} exercises · curated, evidence-ranked
        </p>
      </header>
      {grouped.map(({ muscle, items }) => (
        <section key={muscle} className="space-y-2">
          <h2 className="font-display text-headline-lg text-foreground/90">{muscle}</h2>
          <Card>
            <CardContent className="divide-y divide-outline-variant/40 p-0">
              {items.map((e) => (
                <Link
                  key={e.id}
                  href={`/library/${e.id}`}
                  className="flex items-center justify-between gap-3 p-edge hover:bg-surface-high"
                >
                  <div className="min-w-0">
                    <p className="font-display text-body-lg leading-tight">{e.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.equipment} · {e.movementPattern}
                    </p>
                  </div>
                  <Badge variant="primary">{"★".repeat(e.evidenceRating)}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      ))}
    </div>
  );
}
