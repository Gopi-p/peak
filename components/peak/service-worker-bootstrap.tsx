"use client";

import * as React from "react";
import { drainQueue } from "@/lib/offline/sync";

const AUTO_RETRY_INTERVAL_MS = 30_000;

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

    // Auto-retry the queue every 30s while online — silent fix for transient
    // network blips. Visible failures (>= 3 attempts) surface in SyncStatusBanner.
    const interval = window.setInterval(() => {
      if (navigator.onLine) drainQueue().catch(() => {});
    }, AUTO_RETRY_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", onOnline);
      navigator.serviceWorker.removeEventListener("message", onMessage);
      window.clearInterval(interval);
    };
  }, []);
  return null;
}
