import { NextResponse } from "next/server";
import { store } from "@/lib/data";
import { isAdminAuthed } from "@/lib/auth";
import type { PushTicketInput } from "@gelabs/ovr/data";

export const dynamic = "force-dynamic";

/** Idempotently persist offline-issued tickets. Returns a per-ticket result. */
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { tickets } = (await req.json().catch(() => ({ tickets: [] }))) as {
    tickets: PushTicketInput[];
  };
  const results = await Promise.all(
    (tickets ?? []).map(async (t) => {
      try {
        const ticket = await store.pushTicket(t);
        return { ovrTicketNo: t.ovrTicketNo, ok: true, ticket };
      } catch (e) {
        return {
          ovrTicketNo: t.ovrTicketNo,
          ok: false,
          error: e instanceof Error ? e.message : "push failed",
        };
      }
    }),
  );
  return NextResponse.json({ results });
}
