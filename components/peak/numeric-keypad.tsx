"use client";

import * as React from "react";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (next: string) => void;
  allowDecimal?: boolean;
  className?: string;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "·", "0", "back"] as const;

export function NumericKeypad({ value, onChange, allowDecimal = true, className }: Props) {
  const press = (k: (typeof KEYS)[number]) => {
    if (k === "back") {
      onChange(value.slice(0, -1));
      return;
    }
    if (k === "·") {
      if (!allowDecimal) return;
      if (value.includes(".")) return;
      onChange((value || "0") + ".");
      return;
    }
    if (value === "0") onChange(k);
    else onChange(value + k);
  };

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-3 rounded-xl bg-surface-low p-3",
        className,
      )}
    >
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => press(k)}
          className={cn(
            "h-[64px] rounded-lg text-2xl font-semibold transition-transform active:scale-[0.96]",
            "bg-surface-container text-foreground shadow-lift",
            k === "back" && "bg-surface-high",
            k === "·" && !allowDecimal && "opacity-30 pointer-events-none",
          )}
          aria-label={k === "·" ? "decimal point" : k === "back" ? "backspace" : k}
        >
          {k === "back" ? <Delete className="mx-auto h-6 w-6" /> : k}
        </button>
      ))}
    </div>
  );
}
