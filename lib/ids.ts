/**
 * App wrapper — binds the Santa Cruz ticket-number prefix; generation lives in
 * `@gelabs/ovr/core`. Kept so existing `@/lib/ids` imports resolve unchanged.
 */
import { RULES } from "@/lib/config/santa-cruz";
import { makeOvrTicketNo as makeOvrTicketNoCore } from "@gelabs/ovr/core";

export { makeOrderOfPaymentNo, makeBillNo, makePaymentRef } from "@gelabs/ovr/core";

export function makeOvrTicketNo(year: number, seq: number): string {
  return makeOvrTicketNoCore(RULES.idPrefix, year, seq);
}
