"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

export function PrFlash({ visible, label }: { visible: boolean; label: string }) {
  const [shown, setShown] = React.useState(visible);
  React.useEffect(() => {
    if (visible) {
      setShown(true);
      const id = setTimeout(() => setShown(false), 3000);
      return () => clearTimeout(id);
    }
  }, [visible]);
  if (!shown) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center"
    >
      <div className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-primary-foreground shadow-lift animate-slide-up">
        <Sparkles className="h-4 w-4" />
        <span className="text-button-label">{label}</span>
      </div>
    </div>
  );
}
