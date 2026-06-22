"use server";

/**
 * Apprehending-officer management Server Actions (GE-025). Each re-checks the
 * `officers:manage` permission server-side + audit-logs the change.
 */

import { revalidatePath } from "next/cache";
import { store } from "@/lib/data";
import { requirePermission } from "@/lib/authz";
import { logActivity } from "@/lib/activity";
import type { NewOfficerInput } from "@/lib/types";

const OFFICERS_PATH = "/admin/officers";

export async function createOfficerAction(input: NewOfficerInput) {
  await requirePermission("officers:manage");
  try {
    const o = await store.createOfficer(input);
    await logActivity("officer.create", `Added officer "${o.name}"`, {
      targetType: "officer",
      targetId: o.id,
    });
    revalidatePath(OFFICERS_PATH);
    revalidatePath("/admin/accounts"); // officer dropdown lives there too
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to add the officer.",
    };
  }
}

export async function updateOfficerAction(
  id: string,
  patch: Partial<NewOfficerInput>,
) {
  await requirePermission("officers:manage");
  try {
    const o = await store.updateOfficer(id, patch);
    await logActivity("officer.update", `Updated officer "${o.name}"`, {
      targetType: "officer",
      targetId: o.id,
    });
    revalidatePath(OFFICERS_PATH);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to update the officer.",
    };
  }
}

export async function deleteOfficerAction(id: string) {
  await requirePermission("officers:manage");
  try {
    await store.deleteOfficer(id);
    await logActivity("officer.delete", `Removed officer ${id}`, {
      targetType: "officer",
      targetId: id,
    });
    revalidatePath(OFFICERS_PATH);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to remove the officer.",
    };
  }
}
