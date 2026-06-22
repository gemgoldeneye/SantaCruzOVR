import { NextResponse } from "next/server";

// Liveness probe for the container healthcheck + the deploy smoke test. Stays
// dependency-free (no DB/Redis touch) so it reports the *process* is up even
// while datastores are warming; deeper checks belong elsewhere.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true });
}
