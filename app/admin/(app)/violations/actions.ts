"use server";

/**
 * Violation-catalog management Server Actions (GE-031). Each re-checks the
 * `violations:manage` permission server-side + audit-logs the change. Archiving
 * is a soft-delete so already-issued tickets stay resolvable.
 */

import { revalidatePath } from "next/cache";
import { store } from "@/lib/data";
import { requirePermission } from "@/lib/authz";
import { logActivity } from "@/lib/activity";
import type { NewViolationInput } from "@/lib/types";

const VIOLATIONS_PATH = "/admin/violations";

type ViolationPatch = Partial<Omit<NewViolationInput, "code">> & {
  active?: boolean;
};

export async function createViolationAction(input: NewViolationInput) {
  await requirePermission("violations:manage");
  try {
    const v = await store.createViolation(input);
    await logActivity("violation.create", `Added violation "${v.title}" (${v.code})`, {
      targetType: "violation",
      targetId: v.code,
    });
    revalidatePath(VIOLATIONS_PATH);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to add the violation.",
    };
  }
}

export async function updateViolationAction(
  code: string,
  patch: ViolationPatch,
) {
  await requirePermission("violations:manage");
  try {
    const v = await store.updateViolation(code, patch);
    // A bare `{ active: true }` is a restore; anything else is a content edit.
    const restored =
      patch.active === true && Object.keys(patch).length === 1;
    await logActivity(
      "violation.update",
      `${restored ? "Restored" : "Updated"} violation "${v.title}" (${v.code})`,
      { targetType: "violation", targetId: v.code },
    );
    revalidatePath(VIOLATIONS_PATH);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to update the violation.",
    };
  }
}

export async function deleteViolationAction(code: string) {
  await requirePermission("violations:manage");
  try {
    await store.deleteViolation(code);
    await logActivity("violation.delete", `Archived violation ${code}`, {
      targetType: "violation",
      targetId: code,
    });
    revalidatePath(VIOLATIONS_PATH);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to archive the violation.",
    };
  }
}
