"use client";

import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { usePendingSync, type SyncState } from "@gelabs/ovr/offline";
import { copy } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

/**
 * Admin-header connectivity pill. The sync loop itself runs in the layout
 * (`useSync`); this just renders its state + the count of tickets still queued
 * to sync (online / syncing / offline / N pending).
 */
export function SyncStatus({ state }: { state: SyncState }) {
  const { syncing, online } = state;
  const pending = usePendingSync();
  const n = pending.size;
  const s = copy.admin.sync;

  const Icon = !online ? CloudOff : syncing ? RefreshCw : Cloud;
  const label = !online
    ? n
      ? `${n} ${s.pending}`
      : s.offline
    : syncing
      ? s.syncing
      : n
        ? `${n} ${s.pending}`
        : s.synced;

  return (
    <span
      title={label}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
        online ? "text-gov-foreground/80" : "text-amber-200",
      )}
    >
      <Icon className={cn("size-4 shrink-0", syncing && "animate-spin")} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
