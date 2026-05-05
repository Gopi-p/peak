"use client";

import * as React from "react";

export function useOnline() {
  const [online, setOnline] = React.useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  React.useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export function OnlineIndicator() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="bg-surface-high text-xs uppercase tracking-widest text-muted-foreground py-1 text-center">
      Offline — sets queued, will sync on reconnect
    </div>
  );
}
