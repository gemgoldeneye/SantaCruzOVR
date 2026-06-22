/**
 * Prisma client singleton — re-exported from the data package
 * (`@gelabs/ovr/data/db`). RETAINED purely to preserve the one `@/lib/db` call
 * site (`app/admin/login/actions.ts`) with zero churn; the singleton + globalThis
 * HMR cache live in the package. `server-only` rides along from the package.
 */
export { prisma } from "@gelabs/ovr/data/db";
