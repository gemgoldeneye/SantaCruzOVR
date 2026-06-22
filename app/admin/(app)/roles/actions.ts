"use server";

/**
 * Role-management Server Actions (GE-013 custom roles). Every action re-checks the
 * `roles:manage` permission server-side. Editing a role's permissions revalidates
 * accounts too (effective permissions change).
 */

import { revalidatePath } from "next/cache";
import { store } from "@/lib/data";
import { requirePermission } from "@/lib/authz";
import { logActivity } from "@/lib/activity";
import type { Permission } from "@/lib/types";

const ROLES_PATH = "/admin/roles";

export async function createRoleAction(input: {
  label: string;
  permissions: Permission[];
}) {
  await requirePermission("roles:manage");
  try {
    const role = await store.createRole(input);
    await logActivity("role.create", `Created role "${role.label}"`, {
      targetType: "role",
      targetId: role.name,
    });
    revalidatePath(ROLES_PATH);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to create the role.",
    };
  }
}

export async function updateRoleAction(
  name: string,
  patch: { label?: string; permissions?: Permission[] },
) {
  await requirePermission("roles:manage");
  try {
    const role = await store.updateRole(name, patch);
    await logActivity("role.update", `Updated role "${role.label}"`, {
      targetType: "role",
      targetId: role.name,
    });
    revalidatePath(ROLES_PATH);
    revalidatePath("/admin/accounts");
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to update the role.",
    };
  }
}

export async function deleteRoleAction(name: string) {
  await requirePermission("roles:manage");
  try {
    await store.deleteRole(name);
    await logActivity("role.delete", `Deleted role "${name}"`, {
      targetType: "role",
      targetId: name,
    });
    revalidatePath(ROLES_PATH);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to delete the role.",
    };
  }
}
