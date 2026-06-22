/**
 * Resolve a server session into the full client identity (GE-013 custom roles):
 * the role's current label + effective permissions, read LIVE from the store so a
 * role's permission edits take effect on the next login / auth refresh. The
 * client caches this for offline nav gating.
 */
import "server-only";
import { store } from "@/lib/data";
import type { SessionData } from "@/lib/auth";
import type { AdminIdentity } from "@gelabs/ovr/offline";

export async function buildIdentity(
  session: SessionData,
): Promise<AdminIdentity> {
  const roles = await store.listRoles();
  const role = roles.find((r) => r.name === session.role);
  return {
    userId: session.userId,
    username: session.username,
    role: session.role,
    roleLabel: role?.label,
    permissions: role?.permissions ?? [],
    officerId: session.officerId ?? null,
  };
}
