import { NextResponse } from "next/server";
import { store } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Pull the violation catalog (public — needed for offline issuance). */
export async function GET() {
  return NextResponse.json(await store.listViolationCatalog());
}
