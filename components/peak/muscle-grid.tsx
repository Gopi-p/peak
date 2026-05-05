"use client";

import { MUSCLE_GROUPS, type MuscleGroup } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  selected?: MuscleGroup | null;
  onSelect: (m: MuscleGroup) => void;
  setsByMuscleThisWeek?: Record<string, number>;
  className?: string;
};

export function MuscleGrid({ selected, onSelect, setsByMuscleThisWeek, className }: Props) {
  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {MUSCLE_GROUPS.map((m) => {
        const sets = setsByMuscleThisWeek?.[m] ?? 0;
        const active = selected === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onSelect(m)}
            className={cn(
              "flex h-[112px] flex-col items-center justify-center gap-1 rounded-lg",
              "bg-surface-container text-foreground shadow-lift transition-transform active:scale-[0.97]",
              active && "ring-2 ring-primary shadow-glow",
            )}
          >
            <span className="font-display text-xl font-semibold leading-none">{m}</span>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {sets > 0 ? `${Math.round(sets * 10) / 10} sets / wk` : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
