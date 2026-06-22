/**
 * Roles & permissions page (GE-013 custom roles) — requires `roles:manage`
 * (Super Admin). Lists roles with their permission checklists + usage counts and
 * hands the injected Server Actions to the client RolesManager. Online-only.
 */
import { store } from "@/lib/data";
import { requirePermission } from "@/lib/authz";
import { RolesManager } from "@/components/admin/roles-manager";
import {
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  await requirePermission("roles:manage");
  const [roles, users] = await Promise.all([
    store.listRoles(),
    store.listUsers(),
  ]);

  // How many accounts use each role (shown in the editor, blocks delete).
  const usage: Record<string, number> = {};
  for (const u of users) usage[u.role] = (usage[u.role] ?? 0) + 1;

  return (
    <RolesManager
      roles={roles}
      usage={usage}
      createAction={createRoleAction}
      updateAction={updateRoleAction}
      deleteAction={deleteRoleAction}
    />
  );
}
