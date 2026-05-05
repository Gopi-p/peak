"use client";

import * as React from "react";
import { drainQueue } from "@/lib/offline/sync";

export function ServiceWorkerBootstrap() {
  React.useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});

    const onOnline = () => {
      drainQueue().catch(() => {});
    };
    window.addEventListener("online", onOnline);

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "drain-queue") drainQueue().catch(() => {});
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    if (navigator.onLine) drainQueue().catch(() => {});

    return () => {
      window.removeEventListener("online", onOnline);
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);
  return null;
}
