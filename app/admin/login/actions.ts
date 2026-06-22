"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verify } from "@node-rs/argon2";
import { ADMIN_COOKIE, type SessionData } from "@/lib/auth";
import { DEMO_ADMIN } from "@/lib/config/santa-cruz";
import { useDbBackend } from "@/lib/backend";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

export interface LoginState {
  error?: string;
  /** The signed-in identity — the client caches an offline-login verifier from it. */
  identity?: SessionData;
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
    return {
      identity: {
        userId: "mock",
        username: DEMO_ADMIN.username,
        role: "ENFORCER",
        officerId: null,
      },
    };
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

  const identity: SessionData = {
    userId: user.id,
    username: user.username,
    role: user.role,
    officerId: user.officerId ?? null,
  };
  await createSession(identity);
  return { identity };
}

export async function signOutAction(): Promise<void> {
  if (useDbBackend) {
    await destroySession();
  } else {
    const jar = await cookies();
    jar.delete(ADMIN_COOKIE);
  }
  redirect("/admin/login");
}
