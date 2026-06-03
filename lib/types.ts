/**
 * Canonical domain model for e-OVR — the single source of truth shared by the
 * enforcer (issue), the citizen (search/pay), and the printable receipt.
 *
 * Two shapes:
 *  - `TicketRecord` is what gets PERSISTED (immutable facts + payment status).
 *  - `Ticket` is what the data layer RETURNS to the UI: a record enriched with a
 *    live-derived `status` and freshly-computed `penaltyAmount` / `totalAmountDue`
 *    (so a surcharge that grows monthly is always current, never stale).
 */

export type ViolationCategory = "TRAFFIC" | "ORDINANCE";

/** An entry in the violation schedule enforcers pick from. */
export interface ViolationCatalogItem {
  code: string; // e.g. "A25 S1-9 S-2021"
  title: string; // e.g. "Violation of Other General Driving Rules"
  category: ViolationCategory;
  basicFine: number; // in pesos
  legalText?: string;
}

/** A catalog item as attached to a ticket, snapshotted + enforcer details. */
export interface IssuedViolation {
  catalogCode: string;
  title: string; // snapshot at issue time
  basicFine: number; // snapshot at issue time
  details?: string; // enforcer's free-text specifics
}

export interface Violator {
  firstName: string;
  middleName?: string;
  lastName: string;
  address: string;
  licenseNumber: string;
  plateNumber?: string;
  contactNo?: string;
}

export interface Officer {
  id: string;
  name: string; // "NOVELO, RAYMUNDO V."
  badgeNo?: string;
  office: string; // e.g. "POSO"
}

export type PaymentMethod = "GCASH" | "MAYA" | "LANDBANK" | "OVER_THE_COUNTER";

export interface Payment {
  method: PaymentMethod;
  amount: number; // total actually paid (basic fines + any surcharge)
  referenceNo: string;
  paidAt: string; // ISO
}

/** Persisted, explicit payment state (not the displayed status). */
export type PaymentStatus = "UNPAID" | "PAID" | "CONTESTED";

/** Status shown in the UI (OUTSTANDING vs OVERDUE is derived from the due date). */
export type TicketStatus = "OUTSTANDING" | "OVERDUE" | "PAID" | "CONTESTED";

/** The persisted ticket — immutable facts plus payment state. */
export interface TicketRecord {
  // system-generated identifiers
  ovrTicketNo: string; // "IBA-2026-000123"
  orderOfPaymentNo: string; // "IBA-2026-000123-01"
  billNo: string; // "M-2026-06-03-POSO-A176-000123"
  // enforcer-entered
  violator: Violator;
  apprehendedAt: string; // ISO date+time of the violation
  placeOfViolation?: string;
  officer: Officer;
  violations: IssuedViolation[];
  remarks?: string;
  // system-generated on confirm
  assessedAt: string; // ISO
  dueDate: string; // ISO
  basicFinesTotal: number;
  paymentStatus: PaymentStatus;
  payment?: Payment;
  createdAt: string; // ISO
}

/** The enriched ticket returned to the UI (record + live-derived fields). */
export interface Ticket extends TicketRecord {
  status: TicketStatus;
  penaltyAmount: number; // surcharge as of now (0 within due date)
  totalAmountDue: number; // 0 once paid
}
