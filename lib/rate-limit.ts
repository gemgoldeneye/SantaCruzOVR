/**
 * Login rate limiting — thin app barrel re-exporting `@gelabs/ovr/auth/rate-limit`,
 * so existing `@/lib/rate-limit` imports resolve unchanged. `server-only` rides along.
 */
export { rateLimit } from "@gelabs/ovr/auth/rate-limit";
export type { RateLimitResult } from "@gelabs/ovr/auth/rate-limit";
