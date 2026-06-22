import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { buildIdentity } from "@/lib/identity";

export const dynamic = "force-dynamic";

/**
 * Expose the signed-in admin identity for the offline shell's client auth gate
 * (`useAdminAuth`), or 401. The session cookie remains the source of truth — this
 * route reflects it AND resolves the role's current label + effective permissions
 * (so role edits propagate to the client on the next refresh) for offline caching.
 */
export async function GET() {
  const session = await currentUser();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  return NextResponse.json({ user: await buildIdentity(session) });
}
