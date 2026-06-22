import { NextResponse } from "next/server";
import { store } from "@/lib/data";
import { isAdminAuthed } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Reserve a block of global ticket-sequence numbers for offline issuance. */
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { count } = (await req.json().catch(() => ({}))) as { count?: number };
  return NextResponse.json(await store.leaseSeqs(count ?? 50));
}
