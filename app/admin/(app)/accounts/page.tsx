/**
 * Accounts page (GE-013) — Super-admin-only. A Server Component that reads the
 * accounts + officers server-side and hands the injected Server Actions to the
 * client `AccountsManager`. Permission is enforced here (server) and again in each
 * action. Online-only: account management needs the server (argon2 + DB).
 */
import { store } from "@/lib/data";
import { requirePermission } from "@/lib/authz";
import { AccountsManager } from "@/components/admin/accounts-manager";
import {
  createAccountAction,
  editAccountAction,
  setAccountActiveAction,
  resetAccountPasswordAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await requirePermission("accounts:manage");
  const [users, officers, roles] = await Promise.all([
    store.listUsers(),
    store.listOfficers(),
    store.listRoles(),
  ]);

  return (
    <AccountsManager
      users={users}
      officers={officers}
      roles={roles}
      currentUserId={user.userId}
      createAction={createAccountAction}
      editAction={editAccountAction}
      setActiveAction={setAccountActiveAction}
      resetPasswordAction={resetAccountPasswordAction}
    />
  );
}
