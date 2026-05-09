"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  formatValue?: (n: number) => string;
  label?: string;
  className?: string;
};

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  formatValue,
  label,
  className,
}: Props) {
  const dec = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(Math.min(max, +(value + step).toFixed(2)));
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <button
        type="button"
        onClick={dec}
        className="h-16 w-16 rounded-lg bg-surface-high text-foreground shadow-lift active:scale-[0.96]"
        aria-label={`decrease ${label ?? "value"}`}
      >
        <Minus className="mx-auto h-6 w-6" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col items-center">
        {label && <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>}
        <span className="num font-display text-numeric-display text-foreground whitespace-nowrap">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <button
        type="button"
        onClick={inc}
        className="h-16 w-16 rounded-lg bg-surface-high text-foreground shadow-lift active:scale-[0.96]"
        aria-label={`increase ${label ?? "value"}`}
      >
        <Plus className="mx-auto h-6 w-6" />
      </button>
    </div>
  );
}
