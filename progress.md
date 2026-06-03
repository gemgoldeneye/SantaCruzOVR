# Progress Tracker — e-OVR

Phase-by-phase build log. Each phase lists its tasks and a demoable outcome.
Status: ⬜ todo · 🟦 in progress · ✅ done.

_Last updated: 2026-06-03_

---

## Phase 0 — Scaffold & foundations 🟦
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
- [ ] `git init` + initial commit

---

## Phase 1 — Domain model & mock data layer ⬜
**Demo:** create a ticket and search it back through the mock store.

- [ ] `lib/types.ts` — canonical `Ticket`, `ViolationCatalogItem`, `IssuedViolation`, `Violator`, `Officer`, `Payment`, `TicketStatus`
- [ ] `lib/ids.ts` — OVR Ticket No. / Order of Payment No. / Bill No. generators
- [ ] `lib/penalty.ts` — pure `computeCharges()` (basic fines + 5%/month surcharge)
- [ ] `lib/money.ts` (or util) — ₱ formatter with tabular numerals
- [ ] `DataStore` interface (`lib/data/store.ts`)
- [ ] Server-side `mockStore` + `store.json` persistence (`lib/data/mock.ts`)
- [ ] Seed data: ~12 catalog items, officers, 2–3 example tickets (`lib/data/seed.ts`)
- [ ] Factory `lib/data/index.ts`

---

## Phase 2 — Citizen flow UI ⬜
**Demo:** look up a seeded ticket, view the Order of Payment, print the receipt.

- [ ] Citizen layout/shell (friendly header + footer)
- [ ] `/citizen` home — hero + "how it works"
- [ ] `/citizen/search` — ticket no. + last name + End-User Agreement
- [ ] `/citizen/ticket/[ovrTicketNo]` — Order of Payment view
- [ ] `/citizen/ticket/[ovrTicketNo]/receipt` — printable receipt
- [ ] Shared: `TicketReceipt`, `ViolationsTable`, `StatusBadge`, `Money`, `OfficialHeader`

---

## Phase 3 — Admin shell + issuance form (CORE) ⬜
**Demo:** issue a ticket in `/admin`, then find it on the citizen side.

- [ ] Admin layout/shell (sidebar, staff chrome)
- [ ] `/admin/login` — mock enforcer login
- [ ] `/admin` — dashboard (stat cards + recent tickets)
- [ ] `/admin/tickets` — filterable ticket list
- [ ] `/admin/tickets/new` — **issuance form** (violator, apprehension, violations + details) with **live ticket preview** and confirm (Server Action)
- [ ] `/admin/tickets/[ovrTicketNo]` — detail/review (+ view-as-citizen, print)

---

## Phase 4 — Simulated payment + receipt ⬜
**Demo:** pay a ticket end-to-end; status flips to PAID with a reference no.

- [ ] `/citizen/ticket/[ovrTicketNo]/pay` — method tiles + simulated processing
- [ ] `payTicket` Server Action → status `PAID`, payment ref
- [ ] Receipt reflects payment

---

## Phase 5 — Polish & accessibility ⬜
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
