/**
 * Server-side permission gate (GE-013). Read the signed-in account, then require
 * a capability for its role — redirecting if missing. Use at the top of any admin
 * Server Component page or Server Action that must be permission-restricted. The
 * API/store enforce auth independently; this controls reach within the admin shell.
 */
import "server-only";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { store } from "@/lib/data";
import { hasPermission, type Permission } from "@/lib/types";

export async function requirePermission(permission: Permission) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  // Read the role's CURRENT permissions live, so a role's permission edits take
  // effect immediately server-side (no re-login needed for enforcement).
  const perms = await store.getRolePermissions(user.role);
  if (!hasPermission(perms, permission)) redirect("/admin");
  return user;
}
