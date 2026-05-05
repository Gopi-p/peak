"use client";

import * as React from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { formatDuration } from "@/lib/utils";

type Props = {
  defaultSeconds: number;
  autoStart?: boolean;
  onComplete?: () => void;
};

export function RestTimer({ defaultSeconds, autoStart = true, onComplete }: Props) {
  const [remaining, setRemaining] = React.useState(defaultSeconds);
  const [running, setRunning] = React.useState(autoStart);
  const startedAt = React.useRef<number | null>(null);
  const baseRemaining = React.useRef(defaultSeconds);

  React.useEffect(() => {
    if (!running) return;
    startedAt.current = Date.now();
    baseRemaining.current = remaining;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000);
      const next = Math.max(0, baseRemaining.current - elapsed);
      setRemaining(next);
      if (next <= 0) {
        setRunning(false);
        try {
          new Audio("/chime.mp3").play().catch(() => {});
          if ("vibrate" in navigator) navigator.vibrate(80);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Rest complete", { body: "Get the next set." });
          }
        } catch {}
        onComplete?.();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, onComplete]);

  const reset = () => {
    setRemaining(defaultSeconds);
    setRunning(true);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface-container p-3">
      <span className="num font-display text-headline-lg w-[6ch] text-center">
        {formatDuration(remaining)}
      </span>
      <div className="flex flex-1 gap-2">
        <button
          type="button"
          onClick={() => setRunning((v) => !v)}
          className="flex-1 h-12 rounded-md bg-surface-high text-foreground"
          aria-label={running ? "pause" : "start"}
        >
          {running ? <Pause className="mx-auto h-5 w-5" /> : <Play className="mx-auto h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={reset}
          className="h-12 w-12 rounded-md bg-surface-high"
          aria-label="reset"
        >
          <RotateCcw className="mx-auto h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
