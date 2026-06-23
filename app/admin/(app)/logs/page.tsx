/**
 * Activity log page (GE-022) — requires `logs:view`. Reads the audit trail
 * server-side and hands it to the client viewer (filters run client-side).
 * Online-only.
 */
import { store } from "@/lib/data";
import { requirePermission } from "@/lib/authz";
import { LogsViewer } from "@/components/admin/logs-viewer";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  await requirePermission("logs:view");
  const entries = await store.listActivity({ limit: 300 });
  return <LogsViewer entries={entries} />;
}
