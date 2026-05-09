import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-md border border-transparent px-4 text-body-md",
        "bg-surface-low text-foreground placeholder:text-muted-foreground",
        "focus:border-tertiary focus:outline-none focus:ring-0",
        "shadow-press transition-colors",
        className,
      )}
      {...props}
    />
  );
}
