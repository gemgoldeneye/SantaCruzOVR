/**
 * Penalty / total computation.
 *
 * Rule (from the OVR): pay on or before the due date to avoid a 5% surcharge
 * **per month, counted from the date of apprehension**. Within the due date the
 * penalty is zero; once overdue, each started month since apprehension adds 5%.
 */

import { RULES } from "@/lib/config/santa-cruz";

const MS_PER_DAY = 86_400_000;

/** Started months between two dates, using a 30-day month (ceil). */
export function startedMonthsSince(from: Date, to: Date): number {
  const days = Math.max(0, (to.getTime() - from.getTime()) / MS_PER_DAY);
  return Math.ceil(days / 30);
}

export interface ChargeInput {
  basicFines: number;
  apprehendedAt: Date;
  asOf: Date;
  dueDate: Date;
  ratePerMonth?: number;
}

export interface ChargeResult {
  basicFines: number;
  penalty: number;
  total: number;
  monthsOverdue: number;
}

/** Pure function — no I/O, no clock; pass `asOf` explicitly. */
export function computeCharges({
  basicFines,
  apprehendedAt,
  asOf,
  dueDate,
  ratePerMonth = RULES.surchargeRatePerMonth,
}: ChargeInput): ChargeResult {
  if (asOf.getTime() <= dueDate.getTime()) {
    return { basicFines, penalty: 0, total: basicFines, monthsOverdue: 0 };
  }
  const months = Math.max(1, startedMonthsSince(apprehendedAt, asOf));
  const penalty = Math.round(basicFines * ratePerMonth * months * 100) / 100;
  return {
    basicFines,
    penalty,
    total: Math.round((basicFines + penalty) * 100) / 100,
    monthsOverdue: months,
  };
}
