/**
 * Admin sessions — thin app barrel re-exporting `@gelabs/ovr/auth/session`, so
 * existing `@/lib/session` imports resolve unchanged. `server-only` rides along.
 */
export {
  SESSION_COOKIE,
  cookieSecure,
  createSession,
  getSession,
  destroySession,
} from "@gelabs/ovr/auth/session";
export type { SessionData } from "@gelabs/ovr/auth/session";
