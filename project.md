# e-OVR — Online Ordinance Violation Receipt

**Municipality of Iba, Zambales**

A modern web application for **issuing, looking up, and settling** traffic and
city/municipality ordinance violation tickets online. It modernizes the
Quezon City e-Services "OVR Online Payment" flow (see `reference/` for the
original sample screens) with a cleaner UI and an enforcer-facing issuance flow.

---

## 1. Vision

Replace paper-based and dated portal-based violation handling with a single,
fast, trustworthy online experience for two audiences:

- **Citizens** look up a ticket, review the charges, and pay the fine — on any
  device, in minutes.
- **Enforcers** issue a violation ticket on the spot; the moment it is
  confirmed, it becomes a record the citizen can find and pay.

> **The linchpin:** the ticket an enforcer issues **is** the record a citizen
> searches **is** the printable receipt — *one canonical record, three views.*
> Every design and data decision serves that single shared record.

---

## 2. Scope

### In scope (this build — front-end first)
- Public **citizen** portal (`/citizen`): ticket search → Order of Payment view →
  simulated checkout → printable receipt.
- **Admin / enforcer** portal (`/admin`): mock login, dashboard, ticket list, and
  the **issuance form** with a live ticket preview.
- A modern, responsive, accessible UI with light/dark themes.
- The three living docs: this file, `progress.md`, `learnings.md`.

### Out of scope (deferred)
- Real payment-gateway integration (GCash/Maya/Landbank are **simulated**).
- Real authentication / user accounts (admin login is **mocked**).
- SMS/email notifications.
- The SQLite + Prisma backend — the data-access **interface is built now**; the
  real implementation swaps in during a later backend phase without UI changes.

---

## 3. Personas

| Persona | Portal | Needs |
|---|---|---|
| **Citizen / motorist** | `/citizen` (public) | Find my ticket by number + last name, understand what I owe, pay quickly, keep a receipt. |
| **Enforcer (POSO)** | `/admin` (mock auth) | Issue an accurate ticket fast in the field; see it reflected instantly. |
| **Treasury / reviewer (MTO)** | `/admin` | Review issued tickets, track outstanding vs. paid, reprint documents. |

---

## 4. The domain (OVR)

An **Ordinance Violation Receipt** records a traffic/ordinance violation and the
fine owed. Key concepts:

- **Violation catalog** — the schedule of ordinance codes, titles, and basic
  fines that enforcers pick from (e.g. `A25 S1-9`, ₱500). *Seeded values are
  placeholders from the QC samples; replace with Iba's real schedule later.*
- **Ticket** — one issued record: violator, apprehension date/time, officer, the
  ticked violations (+ enforcer details), generated numbers, dates, and totals.
- **Penalty** — a **5% / month surcharge** applied from the apprehension date
  once a ticket is past its due date.
- **Numbers** — OVR Ticket No. (`IBA-2026-000123`), Order of Payment No.
  (`…-01`), and Bill No. — all generated when a ticket is confirmed.

---

## 5. Tech stack & key decisions

| Area | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16 (App Router) + React 19 + TypeScript** | Route groups for `(citizen)` / `(admin)`. |
| Styling | **Tailwind CSS v4 + shadcn/ui (Base UI, Nova preset)** | Coastal-civic palette: navy primary, teal brand accent. |
| Persistence | **Server-side mock now → SQLite + Prisma later** | One `DataStore` interface; swap is a one-file change. |
| Data flow | **Server Components (reads) + Server Actions (writes)** | Mock lives where Prisma will, so no UI rewrite at swap. |
| Payment | **Simulated checkout** | Realistic UI, no real money. |
| Language | **English-first, i18n-ready** | All copy in `lib/i18n/en.ts`. |
| Admin auth | **Mock login** | `lib/config/iba.ts` → `DEMO_ADMIN`. |

---

## 6. Architecture

```
app/
  page.tsx                 landing — choose Citizen | Enforcer
  (citizen)/citizen/…      public flow: search → order of payment → pay → receipt
  (admin)/admin/…          login, dashboard, ticket list, issuance form, detail
components/
  ui/                      shadcn primitives
  shared/                  TicketReceipt, ViolationsTable, StatusBadge, Money, Seal…
  citizen/ · admin/        perspective-specific composites
lib/
  types.ts                 the canonical Ticket model (the linchpin)
  ids.ts · penalty.ts      number generation + surcharge math (pure)
  data/                    DataStore interface + in-memory mock store + factory
  config/iba.ts            ALL municipality strings & rules (one place to re-brand)
  i18n/en.ts               copy dictionary
reference/                 original QC sample screens (design reference)
```

**Data-access swap plan:** UI calls the `DataStore` interface only. Today the
factory returns a server-side `mockStore`; later it returns a `prismaStore`
hitting SQLite. Because both run server-side, Server Components and Server
Actions are unchanged.

---

## 7. Re-branding for another LGU

Everything municipality-specific lives in **`lib/config/iba.ts`**: name,
province, seal asset, office names (POSO/MTO), ID prefix, due window, surcharge
rate, currency, and demo credentials. Point those at another LGU and the app
re-skins itself.

---

## 8. Roadmap

See **`progress.md`** for the live phase-by-phase tracker and **`learnings.md`**
for milestones and decisions. High level:

0. Scaffold & docs → 1. Domain & mock data → 2. Citizen flow →
3. Admin + issuance (core) → 4. Simulated payment → 5. Polish & a11y →
*(later)* 6. Prisma/SQLite backend → 7. Real auth.
