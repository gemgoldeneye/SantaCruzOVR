/**
 * App barrel: the mock DataStore implementation now lives in `@gelabs/ovr/data`.
 * Bound here to the Santa Cruz rules + the app's seed data. Kept so existing
 * `@/lib/data/mock` imports (and `lib/data/index.ts`) resolve unchanged.
 */
import "server-only";
import { createMockStore } from "@gelabs/ovr/data/mock-store";
import { santaCruzConfig } from "@/lib/config/santa-cruz";
import {
  CATALOG,
  OFFICERS,
  SEED_TICKETS,
  SEED_NEXT_SEQ,
  USERS,
  ROLES,
} from "@/lib/data/seed";

export const mockStore = createMockStore(santaCruzConfig.rules, {
  CATALOG,
  OFFICERS,
  SEED_TICKETS,
  SEED_NEXT_SEQ,
  USERS,
  ROLES,
});
