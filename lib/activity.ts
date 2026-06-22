/**
 * Audit-log helper (GE-022). Records an activity entry attributed to the current
 * session (or an explicit actor — e.g. right after login, before the session
 * cookie is readable). Best-effort: logging NEVER throws into the action it records.
 */
import "server-only";
import { store } from "@/lib/data";
import { currentUser } from "@/lib/auth";
import type { ActivityAction } from "@/lib/types";

interface Actor {
  userId: string;
  username: string;
}

export async function logActivity(
  action: ActivityAction,
  summary: string,
  opts?: { actor?: Actor | null; targetType?: string; targetId?: string },
): Promise<void> {
  try {
    const actor = opts?.actor ?? (await currentUser());
    await store.logActivity({
      actorId: actor?.userId ?? null,
      actorUsername: actor?.username ?? null,
      action,
      summary,
      targetType: opts?.targetType,
      targetId: opts?.targetId,
    });
  } catch {
    // never let an audit-log failure break the action being recorded
  }
}
