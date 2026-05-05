import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-md border border-transparent px-4 text-body-md",
      "bg-surface-low text-foreground placeholder:text-muted-foreground",
      "focus:border-tertiary focus:outline-none focus:ring-0",
      "shadow-press transition-colors",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
