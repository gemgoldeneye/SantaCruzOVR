/**
 * Admin auth — thin app barrel. Binds the injected `@gelabs/ovr/auth` factory to
 * Santa Cruz's backend mode (`lib/backend.ts`) + demo creds (`lib/config/santa-cruz.ts`), so
 * every existing `@/lib/auth` call site resolves unchanged. `server-only` rides
 * along from the package. See the package for the two-mode behavior.
 *
 * `useDbBackend` is evaluated here from the APP's env — the dev-gate stays in the
 * app; the package cannot reach the mock branch unless this passes `false`.
 * `DEMO_ADMIN` (the dev password) is read here but this module is server-only
 * (transitively, via the package), so it cannot leak to the client.
 */

import { createAuth, ADMIN_COOKIE } from "@gelabs/ovr/auth/auth";
import { useDbBackend } from "@/lib/backend";
import { DEMO_ADMIN } from "@/lib/config/santa-cruz";

const auth = createAuth({ useDbBackend, demoAdmin: DEMO_ADMIN });

export { ADMIN_COOKIE };
export const isAdminAuthed = () => auth.isAdminAuthed();
export const currentUser = () => auth.currentUser();
export type { SessionData } from "@gelabs/ovr/auth/session";
