import { NextResponse } from "next/server";
import { store } from "@/lib/data";
import { isAdminAuthed } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
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
        // Only log on a genuinely new insert (pushTicket is idempotent on re-sync).
        const existed = await store.getTicketByNo(t.ovrTicketNo);
        const ticket = await store.pushTicket(t);
        if (!existed) {
          await logActivity("ticket.issued", `Issued ticket ${t.ovrTicketNo}`, {
            actor: t.apprehendingEnforcerId
              ? {
                  userId: t.apprehendingEnforcerId,
                  username: t.apprehendingEnforcerName ?? "—",
                }
              : undefined,
            targetType: "ticket",
            targetId: t.ovrTicketNo,
          });
        }
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
