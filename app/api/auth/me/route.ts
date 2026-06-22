import { NextResponse } from "next/server";
import { isAdminAuthed, currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Expose the signed-in admin identity for the offline shell's client auth gate
 * (`useAdminAuth`), or 401. The session cookie remains the source of truth — this
 * route only reflects it so the client can cache the identity for offline use.
 */
export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  return NextResponse.json({ user: await currentUser() });
}
