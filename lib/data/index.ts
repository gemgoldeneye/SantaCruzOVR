/**
 * Data-access entry point. Import `store` everywhere; never import a concrete
 * implementation directly.
 *
 * SWAP POINT: the backend is selected by `useDbBackend` (see `lib/backend.ts`):
 * the real Postgres `prismaStore` when `DATABASE_URL`/`EOVR_DATA_BACKEND=prisma`
 * is set, otherwise the file-backed `mockStore`. Because both run server-side
 * behind the same interface, no UI/Server-Component/Action changes are needed.
 */

import "server-only"; // fail loudly if the store is ever imported into a client bundle

import type { DataStore } from "@/lib/data/store";
import { mockStore } from "@/lib/data/mock";
import { prismaStore } from "@/lib/data/prisma";
import { useDbBackend } from "@/lib/backend";

// One store, two implementations behind the same interface. Both the admin and
// citizen portals import THIS `store`; flipping the backend swaps them onto
// Postgres transparently — no citizen source file changes.
export const store: DataStore = useDbBackend ? prismaStore : mockStore;

export type {
  DataStore,
  NewTicketInput,
  NewPaymentInput,
  TicketFilter,
  TicketStats,
} from "@/lib/data/store";
