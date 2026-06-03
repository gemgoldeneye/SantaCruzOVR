/**
 * Display formatters — currency, dates, and names.
 * Date formatters pin the timezone (Asia/Manila) so server and client render
 * identically and avoid hydration mismatches.
 */

import { RULES } from "@/lib/config/iba";
import type { Violator } from "@/lib/types";

const pesoFmt = new Intl.NumberFormat(RULES.locale, {
  style: "currency",
  currency: RULES.currency,
});

export function formatPeso(amount: number): string {
  return pesoFmt.format(amount);
}

const dateFmt = new Intl.DateTimeFormat(RULES.locale, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: RULES.timeZone,
});

const dateTimeFmt = new Intl.DateTimeFormat(RULES.locale, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  timeZone: RULES.timeZone,
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

/** Natural order: "Ramil Vinarao Guiwo". */
export function fullName(v: Violator): string {
  return [v.firstName, v.middleName, v.lastName].filter(Boolean).join(" ");
}

/** Official order, as on the receipt: "GUIWO, Ramil Vinarao". */
export function formalName(v: Violator): string {
  const given = [v.firstName, v.middleName].filter(Boolean).join(" ");
  return `${v.lastName}, ${given}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * A `<input type="datetime-local">` value carries no timezone. Interpret it as
 * Manila local time and normalize to a UTC ISO string so the preview and the
 * stored value always agree.
 */
export function localToManilaISO(local: string): string {
  if (!local) return new Date().toISOString();
  const withSeconds = local.length === 16 ? `${local}:00` : local;
  return new Date(`${withSeconds}+08:00`).toISOString();
}

/** Current Manila time formatted for a datetime-local input ("YYYY-MM-DDTHH:mm"). */
export function nowManilaLocalInput(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: RULES.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
