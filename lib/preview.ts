/**
 * Builds a live PREVIEW `Ticket` from the in-progress issuance form, so the
 * enforcer sees the exact record the citizen will later see — "one record, three
 * views." Pure and client-safe (no server/data dependencies). IDs are
 * placeholders until the ticket is confirmed.
 */

import { computeCharges } from "@/lib/penalty";
import { addDays } from "@/lib/format";
import { RULES } from "@/lib/config/santa-cruz";
import type {
  Officer,
  Ticket,
  ViolationCatalogItem,
  Violator,
} from "@/lib/types";

export const PREVIEW_PLACEHOLDER = "— assigned on confirm —";

export interface IssuanceDraft {
  violator: Violator;
  apprehendedAtISO: string;
  placeOfViolation?: string;
  officer?: Officer;
  violations: { item: ViolationCatalogItem; details?: string }[];
  remarks?: string;
}

export function toPreviewTicket(draft: IssuanceDraft, now: Date): Ticket {
  const basicFinesTotal = draft.violations.reduce(
    (s, v) => s + v.item.basicFine,
    0,
  );
  const apprehendedAt = draft.apprehendedAtISO || now.toISOString();
  const dueDate = addDays(now, RULES.dueWindowDays);
  const { penalty, total } = computeCharges({
    basicFines: basicFinesTotal,
    apprehendedAt: new Date(apprehendedAt),
    asOf: now,
    dueDate,
  });
  const officer: Officer =
    draft.officer ?? { id: "", name: PREVIEW_PLACEHOLDER, office: "" };

  return {
    ovrTicketNo: PREVIEW_PLACEHOLDER,
    orderOfPaymentNo: PREVIEW_PLACEHOLDER,
    billNo: PREVIEW_PLACEHOLDER,
    violator: draft.violator,
    apprehendedAt,
    placeOfViolation: draft.placeOfViolation,
    officer,
    violations: draft.violations.map((v) => ({
      catalogCode: v.item.code,
      title: v.item.title,
      basicFine: v.item.basicFine,
      details: v.details?.trim() || undefined,
    })),
    remarks: draft.remarks,
    assessedAt: now.toISOString(),
    dueDate: dueDate.toISOString(),
    basicFinesTotal,
    paymentStatus: "UNPAID",
    status: "OUTSTANDING",
    penaltyAmount: penalty,
    totalAmountDue: total,
    createdAt: now.toISOString(),
  };
}
