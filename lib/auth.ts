/**
 * Mock admin auth (front-end only). A signed-in enforcer is represented by a
 * single cookie; real authentication is a later phase. Citizen routes are public.
 */

import "server-only";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "eovr_admin";

export async function isAdminAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === "1";
}
