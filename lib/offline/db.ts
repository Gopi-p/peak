"use client";

import Dexie, { type EntityTable } from "dexie";

export type OfflineSession = {
  clientId: string; // primary key — UUID generated client-side
  startedAt: string;
  endedAt?: string;
  musclesTrained: string[];
  entries: {
    exerciseId: string;
    order: number;
    notes?: string;
    sets: {
      clientId: string;
      weight: number;
      reps: number;
      rpe?: number;
      isWarmup?: boolean;
      tags?: string[];
      completedAt: string;
    }[];
  }[];
  notes?: string;
  classification?: string;
  syncedAt?: string;
  serverId?: string;
};

export type SyncQueueItem = {
  id?: number;
  kind: "session";
  clientId: string;
  enqueuedAt: string;
  attempts: number;
  lastError?: string;
};

class PeakDB extends Dexie {
  sessions!: EntityTable<OfflineSession, "clientId">;
  syncQueue!: EntityTable<SyncQueueItem, "id">;

  constructor() {
    super("peak");
    this.version(1).stores({
      sessions: "clientId, startedAt, syncedAt",
      syncQueue: "++id, clientId, enqueuedAt",
    });
  }
}

let _db: PeakDB | null = null;
export function db(): PeakDB {
  if (typeof window === "undefined") {
    throw new Error("Offline DB only available in the browser");
  }
  if (!_db) _db = new PeakDB();
  return _db;
}

export function newClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}
