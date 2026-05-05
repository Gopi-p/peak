"use client";

import { MUSCLE_GROUPS, type MuscleGroup } from "@/lib/constants";

type Guidance = Record<MuscleGroup, { mev: number; mav: number; mrv: number }>;

/**
 * A simple, schematic front/back silhouette done with positioned squares — no
 * hand-drawn SVG. Color intensity scales with sets/week relative to MEV/MAV/MRV.
 */
export function MuscleHeatmap({
  data,
  guidance,
}: {
  data: Record<MuscleGroup, number>;
  guidance: Guidance;
}) {
  const colorFor = (m: MuscleGroup) => {
    const v = data[m] ?? 0;
    const g = guidance[m];
    if (v <= 0) return "hsl(var(--surface-container-high))";
    if (v < g.mev) return "hsl(45 70% 35%)"; // dim gold — undertrained
    if (v < g.mav) return "hsl(45 80% 50%)";
    if (v < g.mrv) return "hsl(45 90% 60%)"; // bright gold — productive
    return "hsl(15 80% 55%)"; // warning copper — over MRV
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {MUSCLE_GROUPS.map((m) => {
        const v = data[m] ?? 0;
        return (
          <div
            key={m}
            className="rounded-md border border-outline-variant/40 p-3"
            style={{ backgroundColor: colorFor(m) }}
          >
            <p className="text-xs font-semibold text-black/80">{m}</p>
            <p className="num text-body-md text-black/85">{Math.round(v * 10) / 10}</p>
            <p className="text-[10px] text-black/60">
              {guidance[m].mev}–{guidance[m].mrv}
            </p>
          </div>
        );
      })}
    </div>
  );
}
