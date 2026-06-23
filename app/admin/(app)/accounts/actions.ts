"use server";

/**
 * Account-management Server Actions (GE-013). Every action re-checks the
 * `accounts:manage` permission server-side (never trust the client) and keeps
 * argon2 here in the app — the data layer only ever sees a pre-computed hash.
 */

import { revalidatePath } from "next/cache";
import { hash } from "@node-rs/argon2";
import { store } from "@/lib/data";
import { requirePermission } from "@/lib/authz";
import { logActivity } from "@/lib/activity";
import type { CreateAccountInput } from "@/components/admin/accounts-manager";

const ACCOUNTS_PATH = "/admin/accounts";
const PW_TOO_SHORT = "Password must be at least 6 characters.";
/** The Super Admin is a single bootstrap account whose credentials live in .env
 *  (SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD) — it's never created or reassigned
 *  through the UI. The role dropdowns already hide it; these checks are the
 *  server-side backstop (never trust the client). */
const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

export async function createAccountAction(input: CreateAccountInput) {
  await requirePermission("accounts:manage");
  const username = input.username?.trim();
  if (!username) return { error: "Username is required." };
  if (!input.password || input.password.length < 6) return { error: PW_TOO_SHORT };
  if (input.role === SUPER_ADMIN_ROLE) {
    return {
      error: "The Super Admin can't be created here — its credentials are set in .env.",
    };
  }
  try {
    const passwordHash = await hash(input.password);
    await store.createUser({
      username,
      passwordHash,
      role: input.role,
      officerId: input.officerId,
    });
    await logActivity("account.create", `Created account "${username}" (${input.role})`, {
      targetType: "account",
      targetId: username,
    });
    revalidatePath(ACCOUNTS_PATH);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to create the account.",
    };
  }
}

export async function editAccountAction(
  id: string,
  patch: { username?: string; role?: string; officerId?: string | null },
) {
  await requirePermission("accounts:manage");
  // The Super Admin is a singleton: block promoting another account into it, and
  // block changing the Super Admin's own role away from it (anti-lockout).
  const target = (await store.listUsers()).find((u) => u.id === id);
  if (patch.role === SUPER_ADMIN_ROLE && target?.role !== SUPER_ADMIN_ROLE) {
    return { error: "Super Admin can't be assigned to an account." };
  }
  if (
    target?.role === SUPER_ADMIN_ROLE &&
    patch.role &&
    patch.role !== SUPER_ADMIN_ROLE
  ) {
    return { error: "The Super Admin's role can't be changed." };
  }
  try {
    const u = await store.updateUser(id, patch);
    await logActivity("account.update", `Updated account "${u.username}"`, {
      targetType: "account",
      targetId: u.id,
    });
    revalidatePath(ACCOUNTS_PATH);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to update the account.",
    };
  }
}

export async function setAccountActiveAction(id: string, active: boolean) {
  await requirePermission("accounts:manage");
  try {
    const u = await store.setUserActive(id, active);
    await logActivity(
      active ? "account.activate" : "account.deactivate",
      `${active ? "Activated" : "Deactivated"} account "${u.username}"`,
      { targetType: "account", targetId: u.id },
    );
    revalidatePath(ACCOUNTS_PATH);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to update the account.",
    };
  }
}

export async function resetAccountPasswordAction(id: string, password: string) {
  await requirePermission("accounts:manage");
  if (!password || password.length < 6) return { error: PW_TOO_SHORT };
  try {
    const passwordHash = await hash(password);
    await store.resetUserPassword(id, passwordHash);
    await logActivity("account.password_reset", "Reset an account password", {
      targetType: "account",
      targetId: id,
    });
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to reset the password.",
    };
  }
}
