/**
 * Apprehending officers page (GE-025) — requires `officers:manage`. Lists the
 * Officer records and hands the injected Server Actions to the client manager.
 */
import { store } from "@/lib/data";
import { requirePermission } from "@/lib/authz";
import { OfficersManager } from "@/components/admin/officers-manager";
import {
  createOfficerAction,
  updateOfficerAction,
  deleteOfficerAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function OfficersPage() {
  await requirePermission("officers:manage");
  const officers = await store.listOfficers();
  return (
    <OfficersManager
      officers={officers}
      createAction={createOfficerAction}
      updateAction={updateOfficerAction}
      deleteAction={deleteOfficerAction}
    />
  );
}
