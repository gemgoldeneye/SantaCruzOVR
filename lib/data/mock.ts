/**
 * Server-side mock implementation of `DataStore`.
 *
 * State is persisted to a small JSON file in the OS temp dir (override with
 * `EOVR_STORE_FILE`). Using a file rather than process memory means several dev
 * servers — e.g. the citizen portal and the admin portal on different ports —
 * read and write the SAME data, so a ticket issued on one is found on the other.
 * The file lives OUTSIDE the project so it never triggers a dev-server reload.
 * Durable, multi-process persistence here is also the stepping stone to the
 * Prisma/SQLite backend, which swaps in behind this same interface.
 *
 * Reads recompute status/penalty against "now", so a ticket's surcharge is always
 * current without any stored value going stale.
 */

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
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
import { RULES } from "@/lib/config/santa-cruz";

const STORE_PATH =
  process.env.EOVR_STORE_FILE || path.join(os.tmpdir(), "stacruz-eovr-store.json");
const SEED_VERSION = 1; // bump to re-seed after changing seed data

interface StoreShape {
  version: number;
  counter: number;
  tickets: TicketRecord[];
}

function seeded(): StoreShape {
  return {
    version: SEED_VERSION,
    counter: SEED_NEXT_SEQ,
    tickets: structuredClone(SEED_TICKETS),
  };
}

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const data = JSON.parse(raw) as StoreShape;
    if (
      !data ||
      data.version !== SEED_VERSION ||
      !Array.isArray(data.tickets) ||
      typeof data.counter !== "number"
    ) {
      const fresh = seeded();
      await writeStore(fresh);
      return fresh;
    }
    return data;
  } catch {
    const fresh = seeded();
    await writeStore(fresh);
    return fresh;
  }
}

async function writeStore(data: StoreShape): Promise<void> {
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const norm = (s: string) => s.trim().toLowerCase();

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
    const store = await readStore();
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
    await writeStore(store);
    return enrich(rec, now);
  },

  async searchTicket(ovrTicketNo: string, lastName: string) {
    const store = await readStore();
    const rec = store.tickets.find(
      (t) =>
        norm(t.ovrTicketNo) === norm(ovrTicketNo) &&
        norm(t.violator.lastName) === norm(lastName),
    );
    return rec ? enrich(rec, new Date()) : null;
  },

  async getTicketByNo(ovrTicketNo: string) {
    const store = await readStore();
    const rec = store.tickets.find((t) => norm(t.ovrTicketNo) === norm(ovrTicketNo));
    return rec ? enrich(rec, new Date()) : null;
  },

  async listTickets(filter?: TicketFilter) {
    const store = await readStore();
    const now = new Date();
    let items = store.tickets
      .map((r) => enrich(r, now))
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
    const store = await readStore();
    const rec = store.tickets.find((t) => norm(t.ovrTicketNo) === norm(ovrTicketNo));
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
    await writeStore(store);
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
