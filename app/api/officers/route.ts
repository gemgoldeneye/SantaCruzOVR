import { NextResponse } from "next/server";
import { store } from "@/lib/data";
import { isAdminAuthed } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Pull officers into the offline store (admin only). */
export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await store.listOfficers());
}
