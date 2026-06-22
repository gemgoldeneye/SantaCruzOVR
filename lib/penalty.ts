/**
 * App wrapper — binds the Santa Cruz surcharge rate; the pure logic lives in
 * `@gelabs/ovr/core`. Kept so existing `@/lib/penalty` imports resolve unchanged.
 */
import { RULES } from "@/lib/config/santa-cruz";
import {
  computeCharges as computeChargesCore,
  type ChargeInput,
  type ChargeResult,
} from "@gelabs/ovr/core";

export { startedMonthsSince } from "@gelabs/ovr/core";
export type { ChargeResult, ChargeInput } from "@gelabs/ovr/core";

/** Defaults `ratePerMonth` to the configured LGU rate when not supplied. */
export function computeCharges(
  input: Omit<ChargeInput, "ratePerMonth"> & { ratePerMonth?: number },
): ChargeResult {
  return computeChargesCore({
    ...input,
    ratePerMonth: input.ratePerMonth ?? RULES.surchargeRatePerMonth,
  });
}
