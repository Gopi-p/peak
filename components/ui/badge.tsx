import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "outline" | "muted";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variant === "default" && "bg-surface-high text-foreground",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "outline" && "border border-outline-variant text-foreground",
        variant === "muted" && "bg-surface-low text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
