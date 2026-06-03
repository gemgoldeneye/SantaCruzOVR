# Progress Tracker — e-OVR

Phase-by-phase build log. Each phase lists its tasks and a demoable outcome.
Status: ⬜ todo · 🟦 in progress · ✅ done.

_Last updated: 2026-06-03_

---

## Phase 0 — Scaffold & foundations ✅
**Demo:** branded landing page with the two-portal choice.

- [x] Scaffold Next.js 16 + TypeScript + Tailwind v4 (into a temp folder, then merged into the repo root)
- [x] Move the original sample JPGs into `reference/`
- [x] Initialize shadcn/ui (Base UI, Nova preset) + add component set
- [x] Coastal-civic color palette in `app/globals.css` (navy primary, teal brand, success/warning tokens, print utilities)
- [x] Theme provider + theme toggle (light/dark/system via `next-themes`)
- [x] Root layout: fonts (Geist), metadata, `Toaster`
- [x] `lib/config/iba.ts` — central municipality config (offices, rules, payment methods, demo login)
- [x] `lib/i18n/en.ts` — copy dictionary scaffold
- [x] Placeholder municipal seal (`components/shared/seal.tsx`)
- [x] Landing page (`app/page.tsx`)
- [x] `project.md`, `progress.md`, `learnings.md`
- [x] Production build passes
- [x] `git init` + initial commit

---

## Phase 1 — Domain model & mock data layer ✅
**Demo:** create a ticket and search it back through the mock store. _(Verified via self-test: surcharge math, paid state, and search all correct.)_

- [x] `lib/types.ts` — `TicketRecord` (stored) + enriched `Ticket`, catalog, violation, violator, officer, payment, status
- [x] `lib/ids.ts` — OVR Ticket No. / Order of Payment No. / Bill No. / payment-ref generators
- [x] `lib/penalty.ts` — pure `computeCharges()` (basic fines + 5%/month surcharge)
- [x] `lib/format.ts` — ₱ formatter, TZ-pinned dates, name helpers
- [x] `DataStore` interface (`lib/data/store.ts`)
- [x] Server-side in-memory `mockStore` (globalThis singleton) (`lib/data/mock.ts`)
- [x] Seed data: 14 catalog items, 3 officers, 3 example tickets (`lib/data/seed.ts`)
- [x] Factory `lib/data/index.ts`

---

## Phase 2 — Citizen flow UI ✅
**Demo:** look up a seeded ticket, view the Order of Payment, print the receipt. _(Verified: overdue ticket renders ₱1,500 + ₱300 surcharge = ₱1,800; receipt prints.)_

- [x] Citizen layout/shell (friendly header + footer)
- [x] `/citizen` home — hero + "how it works"
- [x] `/citizen/search` — ticket no. + last name + End-User Agreement (server action)
- [x] `/citizen/ticket/[ovrTicketNo]` — Order of Payment view (last-name gated via `?ln=`)
- [x] `/citizen/ticket/[ovrTicketNo]/receipt` — printable receipt + print button
- [x] Shared: `TicketReceipt`, `ViolationsTable`, `StatusBadge`, `Money`, `AmountSummary`, `OfficialHeader`, `Seal`
- [ ] _Pay-fine link targets `/pay` (built in Phase 4)_

---

## Phase 3 — Admin shell + issuance form (CORE) ✅
**Demo:** issue a ticket in `/admin`, then find it on the citizen side. _(Verified: real `createTicketAction` issued `IBA-2026-000004`; citizen `searchTicket` found it.)_

- [x] Admin layout/shell (sidebar, staff chrome, mobile top bar) + `server-only` guard on the data layer
- [x] `/admin/login` — mock enforcer login (cookie) + auth guard via `(app)` route group
- [x] `/admin` — dashboard (stat cards + recent tickets)
- [x] `/admin/tickets` — filterable ticket list (status tabs + search)
- [x] `/admin/tickets/new` — **issuance form** with **live ticket preview** + confirm (Server Action, `revalidatePath`)
- [x] `/admin/tickets/[ovrTicketNo]` — detail/review (view-as-citizen, print)

---

## Phase 4 — Simulated payment + receipt ✅
**Demo:** pay a ticket end-to-end; status flips to PAID with a reference no. _(Verified: IBA-2026-000001 OUTSTANDING → PAID via GCash, ref GCA-…, receipt shows "Payment successful".)_

- [x] `/citizen/ticket/[ovrTicketNo]/pay` — method tiles (GCash/Maya/Landbank/OTC) + processing state
- [x] `payTicket` Server Action (last-name authorized) → status `PAID`, payment ref, `revalidatePath`
- [x] Receipt reflects payment (success banner, amount paid, reference)

---

## Phase 5 — Polish & accessibility 🟦
**Demo:** production-feel front-end.

- [ ] Responsive pass (mobile-first citizen, dense admin)
- [ ] Dark mode pass
- [ ] Empty / error / loading states
- [ ] Print stylesheet refinement
- [ ] i18n audit — no hardcoded copy
- [ ] Microcopy + final review

---

## Later (post front-end)
- [ ] Phase 6 — Prisma/SQLite backend behind `DataStore`
- [ ] Phase 7 — Real authentication
