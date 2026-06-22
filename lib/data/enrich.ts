/**
 * App wrapper — binds the Santa Cruz surcharge rate; the derivation lives in
 * `@gelabs/ovr/core`. Kept so existing `@/lib/data/enrich` imports resolve
 * unchanged.
 */
import { RULES } from "@/lib/config/santa-cruz";
import { enrich as enrichCore } from "@gelabs/ovr/core";
import type { Ticket, TicketRecord } from "@/lib/types";

export { round2 } from "@gelabs/ovr/core";

export function enrich(rec: TicketRecord, asOf: Date): Ticket {
  return enrichCore(rec, asOf, RULES.surchargeRatePerMonth);
}
