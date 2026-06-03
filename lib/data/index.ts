/**
 * Data-access entry point. Import `store` everywhere; never import a concrete
 * implementation directly.
 *
 * SWAP POINT: to move from the mock to the real backend, change the single line
 * below to `export const store: DataStore = prismaStore`. Because both run
 * server-side behind the same interface, no UI/Server-Component/Action changes
 * are needed.
 */

import type { DataStore } from "@/lib/data/store";
import { mockStore } from "@/lib/data/mock";

export const store: DataStore = mockStore;

export type {
  DataStore,
  NewTicketInput,
  NewPaymentInput,
  TicketFilter,
  TicketStats,
} from "@/lib/data/store";
