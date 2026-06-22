/**
 * Violation catalog page (GE-031) — requires `violations:manage`. Lists ALL
 * catalog entries (incl. archived) and hands the injected Server Actions to the
 * client manager. The Issue-Ticket form only ever sees ACTIVE entries (served
 * through `listViolationCatalog`).
 */
import { store } from "@/lib/data";
import { requirePermission } from "@/lib/authz";
import { ViolationsManager } from "@/components/admin/violations-manager";
import {
  createViolationAction,
  updateViolationAction,
  deleteViolationAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ViolationsPage() {
  await requirePermission("violations:manage");
  const violations = await store.listAllViolations();
  return (
    <ViolationsManager
      violations={violations}
      createAction={createViolationAction}
      updateAction={updateViolationAction}
      deleteAction={deleteViolationAction}
    />
  );
}
