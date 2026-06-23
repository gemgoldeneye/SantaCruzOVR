"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verify, hash } from "@node-rs/argon2";
import { ADMIN_COOKIE, currentUser, type SessionData } from "@/lib/auth";
import { store } from "@/lib/data";
import { DEMO_ADMIN } from "@/lib/config/santa-cruz";
import { useDbBackend } from "@/lib/backend";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { buildIdentity } from "@/lib/identity";
import { logActivity } from "@/lib/activity";
import type { AdminIdentity } from "@gelabs/ovr/offline";

export interface LoginState {
  error?: string;
  /** The signed-in identity (role + effective permissions) — the client caches an
   *  offline-login verifier from it. */
  identity?: AdminIdentity;
}

const INVALID = { error: "Invalid username or password." } as const;

/**
 * Authenticate + set the session cookie, RETURNING the identity (no redirect) so
 * the client can cache an offline-login verifier before navigating to /admin.
 * Called directly from the login page so a network failure (offline) is catchable
 * and falls back to the cached-password offline login.
 */
export async function signInAction(
  usernameRaw: string,
  password: string,
): Promise<LoginState> {
  const username = usernameRaw.trim();

  // Mock mode: no infra — compare against the demo credentials and set the
  // legacy cookie, preserving the zero-dependency `npm run dev` workflow.
  if (!useDbBackend) {
    if (username !== DEMO_ADMIN.username || password !== DEMO_ADMIN.password) {
      return INVALID;
    }
    const jar = await cookies();
    jar.set(ADMIN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    // Mock mode's single demo login is the local superuser (SUPER_ADMIN) so the
    // whole admin UI, incl. account & role management, is reachable with no DB.
    // LOCAL-DEV-ONLY. Permissions come from the (mock) SUPER_ADMIN role.
    const identity = await buildIdentity({
      userId: "mock",
      username: DEMO_ADMIN.username,
      role: "SUPER_ADMIN",
      officerId: null,
    });
    await logActivity("auth.login", `${DEMO_ADMIN.username} signed in (demo)`, {
      actor: { userId: "mock", username: DEMO_ADMIN.username },
    });
    return { identity };
  }

  // Real auth: throttle, then verify the argon2 hash of a Postgres user.
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = await rateLimit(`login:${username || ip}`, 5, 15 * 60);
  if (!limited.allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.active) return INVALID;

  let ok = false;
  try {
    ok = await verify(user.passwordHash, password);
  } catch {
    ok = false;
  }
  if (!ok) return INVALID;

  const session: SessionData = {
    userId: user.id,
    username: user.username,
    role: user.role,
    officerId: user.officerId ?? null,
  };
  await createSession(session);
  const identity = await buildIdentity(session);
  await logActivity("auth.login", `${session.username} signed in`, {
    actor: session,
  });
  return { identity };
}

export async function signOutAction(): Promise<void> {
  // Capture the actor BEFORE the session is destroyed.
  const u = await currentUser();
  if (u) {
    await logActivity("auth.logout", `${u.username} signed out`, { actor: u });
  }
  if (useDbBackend) {
    await destroySession();
  } else {
    const jar = await cookies();
    jar.delete(ADMIN_COOKIE);
  }
  redirect("/admin/login");
}

/**
 * Self-service password change (GE-024). Verifies the CURRENT password (argon2)
 * for the signed-in user, then stores the new hash. The client re-caches its
 * offline-login verifier on success. DB-backend only — the demo login has no
 * credential to change.
 */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<{ error?: string } | void> {
  if (!useDbBackend) {
    return { error: "Password change isn't available in demo mode." };
  }
  const u = await currentUser();
  if (!u) return { error: "You're not signed in." };
  if (!newPassword || newPassword.length < 6) {
    return { error: "New password must be at least 6 characters." };
  }
  const user = await prisma.user.findUnique({ where: { id: u.userId } });
  if (!user) return { error: "Account not found." };

  let ok = false;
  try {
    ok = await verify(user.passwordHash, currentPassword);
  } catch {
    ok = false;
  }
  if (!ok) return { error: "Current password is incorrect." };

  const passwordHash = await hash(newPassword);
  await store.resetUserPassword(user.id, passwordHash);
  await logActivity(
    "account.password_change",
    `${user.username} changed their password`,
    { actor: u, targetType: "account", targetId: user.id },
  );
  return {};
}
