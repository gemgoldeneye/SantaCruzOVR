/**
 * Server-side mock implementation of `DataStore`.
 *
 * State lives in a `globalThis` singleton so it persists across requests and
 * across dev hot-reloads (the standard Next.js singleton pattern). It is
 * intentionally in-memory: it gives true cross-device behavior (every client
 * hits the same server) and a clean slate on restart. Durable cross-restart
 * persistence arrives with the Prisma/SQLite backend, swapped in behind this
 * same interface — UI code is unaffected.
 *
 * Because reads recompute status/penalty against "now", a ticket's surcharge is
 * always current without any stored value going stale.
 */

import type {
  Officer,
  Ticket,
  TicketRecord,
  ViolationCatalogItem,
  ViolationCategory,
} from "@/lib/types";
import {
  CATALOG,
  OFFICERS,
  SEED_NEXT_SEQ,
  SEED_TICKETS,
} from "@/lib/data/seed";
import type {
  DataStore,
  NewPaymentInput,
  NewTicketInput,
  TicketFilter,
  TicketStats,
} from "@/lib/data/store";
import { computeCharges } from "@/lib/penalty";
import {
  makeBillNo,
  makeOrderOfPaymentNo,
  makeOvrTicketNo,
  makePaymentRef,
} from "@/lib/ids";
import { addDays, fullName } from "@/lib/format";
import { RULES } from "@/lib/config/iba";

interface StoreShape {
  counter: number;
  tickets: TicketRecord[];
}

const g = globalThis as unknown as { __eovrStore?: StoreShape };

function db(): StoreShape {
  if (!g.__eovrStore) {
    g.__eovrStore = {
      counter: SEED_NEXT_SEQ,
      tickets: structuredClone(SEED_TICKETS),
    };
  }
  return g.__eovrStore;
}

/** Enrich a stored record with live-derived status and charges. */
function enrich(rec: TicketRecord, asOf: Date): Ticket {
  if (rec.paymentStatus === "PAID") {
    const paid = rec.payment?.amount ?? rec.basicFinesTotal;
    return {
      ...rec,
      status: "PAID",
      penaltyAmount: Math.max(0, round2(paid - rec.basicFinesTotal)),
      totalAmountDue: 0,
    };
  }
  const { penalty, total } = computeCharges({
    basicFines: rec.basicFinesTotal,
    apprehendedAt: new Date(rec.apprehendedAt),
    asOf,
    dueDate: new Date(rec.dueDate),
  });
  if (rec.paymentStatus === "CONTESTED") {
    return { ...rec, status: "CONTESTED", penaltyAmount: penalty, totalAmountDue: total };
  }
  const overdue = asOf.getTime() > new Date(rec.dueDate).getTime();
  return {
    ...rec,
    status: overdue ? "OVERDUE" : "OUTSTANDING",
    penaltyAmount: penalty,
    totalAmountDue: total,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const norm = (s: string) => s.trim().toLowerCase();

export const mockStore: DataStore = {
  async listViolationCatalog(category?: ViolationCategory) {
    const items: ViolationCatalogItem[] = category
      ? CATALOG.filter((c) => c.category === category)
      : CATALOG;
    return structuredClone(items);
  },

  async listOfficers() {
    return structuredClone(OFFICERS);
  },

  async getOfficer(id: string) {
    return OFFICERS.find((o) => o.id === id) ?? null;
  },

  async createTicket(input: NewTicketInput) {
    const store = db();
    const now = new Date();
    const seq = store.counter;

    const officer: Officer =
      OFFICERS.find((o) => o.id === input.officerId) ?? OFFICERS[0];

    const violations = input.violations.map((v) => {
      const c = CATALOG.find((x) => x.code === v.catalogCode);
      if (!c) throw new Error(`Unknown violation code: ${v.catalogCode}`);
      return {
        catalogCode: c.code,
        title: c.title,
        basicFine: c.basicFine,
        details: v.details?.trim() || undefined,
      };
    });
    if (violations.length === 0) {
      throw new Error("A ticket must include at least one violation.");
    }

    const basicFinesTotal = violations.reduce((s, v) => s + v.basicFine, 0);
    const ovrTicketNo = makeOvrTicketNo(now.getFullYear(), seq);
    const assessedAt = now.toISOString();

    const rec: TicketRecord = {
      ovrTicketNo,
      orderOfPaymentNo: makeOrderOfPaymentNo(ovrTicketNo),
      billNo: makeBillNo(now, officer.office, officer.badgeNo ?? "X000", seq),
      violator: input.violator,
      apprehendedAt: input.apprehendedAt,
      placeOfViolation: input.placeOfViolation?.trim() || undefined,
      officer,
      violations,
      remarks: input.remarks?.trim() || undefined,
      assessedAt,
      dueDate: addDays(now, RULES.dueWindowDays).toISOString(),
      basicFinesTotal,
      paymentStatus: "UNPAID",
      createdAt: assessedAt,
    };

    store.tickets.unshift(rec);
    store.counter += 1;
    return enrich(rec, now);
  },

  async searchTicket(ovrTicketNo: string, lastName: string) {
    const rec = db().tickets.find(
      (t) =>
        norm(t.ovrTicketNo) === norm(ovrTicketNo) &&
        norm(t.violator.lastName) === norm(lastName),
    );
    return rec ? enrich(rec, new Date()) : null;
  },

  async getTicketByNo(ovrTicketNo: string) {
    const rec = db().tickets.find((t) => norm(t.ovrTicketNo) === norm(ovrTicketNo));
    return rec ? enrich(rec, new Date()) : null;
  },

  async listTickets(filter?: TicketFilter) {
    const now = new Date();
    let items = db()
      .tickets.map((r) => enrich(r, now))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    if (filter?.status && filter.status !== "ALL") {
      items = items.filter((t) => t.status === filter.status);
    }
    if (filter?.query) {
      const q = norm(filter.query);
      items = items.filter(
        (t) =>
          norm(fullName(t.violator)).includes(q) ||
          norm(t.ovrTicketNo).includes(q) ||
          norm(t.violator.plateNumber ?? "").includes(q),
      );
    }
    return items;
  },

  async payTicket(ovrTicketNo: string, payment: NewPaymentInput) {
    const rec = db().tickets.find((t) => norm(t.ovrTicketNo) === norm(ovrTicketNo));
    if (!rec) throw new Error("Ticket not found.");
    const now = new Date();
    if (rec.paymentStatus === "PAID") return enrich(rec, now); // idempotent

    const { total } = computeCharges({
      basicFines: rec.basicFinesTotal,
      apprehendedAt: new Date(rec.apprehendedAt),
      asOf: now,
      dueDate: new Date(rec.dueDate),
    });
    rec.paymentStatus = "PAID";
    rec.payment = {
      method: payment.method,
      amount: total,
      referenceNo: makePaymentRef(payment.method, now),
      paidAt: now.toISOString(),
    };
    return enrich(rec, now);
  },

  async stats(): Promise<TicketStats> {
    const items = await mockStore.listTickets();
    const collected = items
      .filter((t) => t.status === "PAID")
      .reduce((s, t) => s + (t.payment?.amount ?? 0), 0);
    const todayKey = new Date().toLocaleDateString(RULES.locale, {
      timeZone: RULES.timeZone,
    });
    return {
      total: items.length,
      outstanding: items.filter((t) => t.status === "OUTSTANDING").length,
      overdue: items.filter((t) => t.status === "OVERDUE").length,
      paid: items.filter((t) => t.status === "PAID").length,
      contested: items.filter((t) => t.status === "CONTESTED").length,
      collected: round2(collected),
      issuedToday: items.filter(
        (t) =>
          new Date(t.createdAt).toLocaleDateString(RULES.locale, {
            timeZone: RULES.timeZone,
          }) === todayKey,
      ).length,
    };
  },
};
