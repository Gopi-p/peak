"use client";

import { db } from "./db";

export async function enqueueSession(clientId: string) {
  await db().syncQueue.add({
    kind: "session",
    clientId,
    enqueuedAt: new Date().toISOString(),
    attempts: 0,
  });
}

export async function drainQueue(): Promise<{ pushed: number; failed: number }> {
  const items = await db().syncQueue.orderBy("enqueuedAt").toArray();
  let pushed = 0;
  let failed = 0;

  for (const item of items) {
    if (item.kind !== "session") continue;
    const session = await db().sessions.get(item.clientId);
    if (!session) {
      if (item.id !== undefined) await db().syncQueue.delete(item.id);
      continue;
    }
    try {
      const res = await fetch("/api/sync/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions: [session] }),
      });
      if (!res.ok) throw new Error(`Sync failed (${res.status})`);
      const data = (await res.json()) as { upserted: { clientId: string; serverId: string }[] };
      for (const u of data.upserted) {
        await db().sessions.update(u.clientId, {
          syncedAt: new Date().toISOString(),
          serverId: u.serverId,
        });
      }
      if (item.id !== undefined) await db().syncQueue.delete(item.id);
      pushed += 1;
    } catch (err) {
      failed += 1;
      await db().syncQueue.update(item.id!, {
        attempts: item.attempts + 1,
        lastError: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return { pushed, failed };
}
