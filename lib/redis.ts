/**
 * Redis client — thin app barrel re-exporting `@gelabs/ovr/auth/redis`, so
 * existing `@/lib/redis` imports resolve unchanged. `server-only` rides along.
 */
export { getRedis } from "@gelabs/ovr/auth/redis";
