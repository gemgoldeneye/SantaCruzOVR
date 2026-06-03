/**
 * Number generation for tickets, derived from the sample documents.
 *  - OVR Ticket No.:      IBA-2026-000123
 *  - Order of Payment No: IBA-2026-000123-01   (ticket no. + "-01")
 *  - Bill No.:            M-2026-06-03-POSO-A176-000123
 *  - Payment reference:   GCA-20260603-142233
 */

import { RULES } from "@/lib/config/iba";
import type { PaymentMethod } from "@/lib/types";

const pad = (n: number, len: number) => String(n).padStart(len, "0");
const two = (n: number) => pad(n, 2);

export function makeOvrTicketNo(year: number, seq: number): string {
  return `${RULES.idPrefix}-${year}-${pad(seq, 6)}`;
}

export function makeOrderOfPaymentNo(ovrTicketNo: string): string {
  return `${ovrTicketNo}-01`;
}

export function makeBillNo(
  date: Date,
  officeAbbr: string,
  officerCode: string,
  seq: number,
): string {
  const ymd = `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
  return `M-${ymd}-${officeAbbr}-${officerCode}-${pad(seq, 6)}`;
}

export function makePaymentRef(method: PaymentMethod, at: Date): string {
  const prefix = method.slice(0, 3);
  const ymd = `${at.getFullYear()}${two(at.getMonth() + 1)}${two(at.getDate())}`;
  const hms = `${two(at.getHours())}${two(at.getMinutes())}${two(at.getSeconds())}`;
  return `${prefix}-${ymd}-${hms}`;
}
