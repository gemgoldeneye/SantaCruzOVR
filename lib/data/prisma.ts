/**
 * App barrel: the Prisma DataStore implementation now lives in `@gelabs/ovr/data`.
 * Bound here to the Santa Cruz per-LGU rules. Kept so existing `@/lib/data/prisma` imports
 * (and `lib/data/index.ts`) resolve unchanged.
 */
import "server-only";
import { createPrismaStore } from "@gelabs/ovr/data/prisma-store";
import { santaCruzConfig } from "@/lib/config/santa-cruz";

export const prismaStore = createPrismaStore(santaCruzConfig.rules);
