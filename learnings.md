# Learnings & Milestones — e-OVR

A running log of breakthroughs, milestones, key decisions, and gotchas.
Newest entries on top.

---

## 2026-06-03 — Separate dev ports for citizen & admin (shared file store)

Per request, the portals can run on their own ports so they don't collide with
other local projects (which hold 3000/3001): `dev:citizen` → 4310, `dev:admin` →
4320, and `dev` → 4300 (both portals in one server).

### 🧭 Key change: file-backed mock store
Two dev servers are two processes, so the in-memory singleton would NOT share data
— a ticket issued on the admin port wouldn't appear on the citizen port. Switched
the mock to a small JSON file at `/tmp/eovr-store.json` (override via
`EOVR_STORE_FILE`), read/written per operation, so all processes share one store.
The file lives outside the project so it never triggers a dev-server reload, and
each server gets its own `NEXT_DIST_DIR` (`.next-citizen` / `.next-admin`) so two
`next dev` instances don't clobber `.next`. Verified: created `IBA-2026-000004` on
:4320, found it on :4310. Bonus — data now survives restarts (delete the file to
reset to seeds).

---

## 2026-06-03 — Phases 4–5: payment, polish, front-end MVP complete

### 🎯 Milestone: front-end MVP complete
Both journeys built and verified at the **data + Server Action layer**: citizen
search → Order of Payment → simulated pay → receipt; enforcer login → issue (with
live preview) → the citizen finds and pays it. Production build and ESLint are clean;
all 12 routes smoke-tested via SSR. **Still pending:** an interactive browser pass
(form submit + client hydration) — no browser-automation tool is available in this
environment, so that last layer is verified-by-construction, not exercised.

### 🐛 Gotcha: the `react-hooks/set-state-in-effect` lint rule
The new rule flags the common mount/now-initialization pattern. Removed the
redundant `mounted` flag in the theme toggle (next-themes already returns an
undefined theme on the first render, so there is no mismatch); scope-disabled the
rule for the issuance form's wall-clock initialization, which legitimately must run
after mount to avoid a hydration mismatch on the datetime field.

---

## 2026-06-03 — Phases 1–3: data layer, citizen flow, enforcer issuance

### 🎯 Milestone: the core loop works end-to-end
An enforcer issues a ticket; the citizen finds it by ticket number + last name and
sees the Order of Payment. Verified browserlessly by invoking the real
`createTicketAction` and confirming the citizen `searchTicket` resolves the new
number (issued `IBA-2026-000004` → found, ₱2,000, "Reckless Driving").

### 💡 Live preview = the citizen's view
The issuance form renders a live `Ticket` (via `toPreviewTicket`) through the same
components the citizen sees — "one record, three views," updating as the enforcer types.

### 🧭 Decisions
- `server-only` guard on `lib/data` so the store can never leak into a client bundle.
- Seed data fetched in a Server Component and passed to the client `<IssuanceForm>`;
  confirm calls a Server Action that `revalidatePath`s the admin views, then redirects.
- Mock admin auth via a single cookie; protected routes live under an `(app)` route
  group so `/admin/login` sits outside the guard (no redirect loop).
- Native `<select>` for the officer field — robust in forms, avoids Base UI Select API risk.

### 🐛 Gotchas
- App Router **private folders**: a route folder prefixed with `_` is excluded from
  routing → 404. Renamed without the underscore.
- No browser-automation tool in this environment, so the final UI click-through is
  unverified by automation; the data + Server Action path is fully verified instead.

---

## 2026-06-03 — Project kickoff & Phase 0

### 🎯 Milestone: foundation scaffolded and building
Next.js 16 + React 19 + Tailwind v4 + shadcn/ui app stands up, branded landing
page renders, production build is green.

### 💡 Breakthrough: the "one record, three views" model
The single most clarifying insight: the enforcer's issued ticket, the citizen's
searchable Order of Payment, and the printable receipt are **the same record**
shown three ways. The whole architecture is built around one canonical `Ticket`.

### 🧭 Key decisions
- **Server-side mock, not localStorage.** Prisma is server-only; a browser-only
  mock would force a full client-render and a separate API layer at swap time,
  and would break the cross-device "enforcer issues → citizen looks up" story.
  The mock runs server-side (in-memory `globalThis` singleton) behind a
  `DataStore` interface, accessed via Server Components (reads) + Server Actions
  (writes) — exactly where Prisma will live, so the later swap is a one-file
  change. (Chose an in-memory singleton over a JSON file to avoid Turbopack's dev
  watcher reloading on every write; durable persistence arrives with Prisma.)
- **Re-branding via one config file** (`lib/config/iba.ts`) so the app can be
  pointed at any LGU.
- **Stack/scope confirmed with the user:** Next.js + Tailwind + shadcn; SQLite +
  Prisma (deferred); simulated payments; English-first (i18n-ready).

### 🐛 Gotchas
- **`create-next-app` refuses a non-empty directory**, and `OVR` has capital
  letters (invalid as an npm package name). Workaround: scaffold into a
  temp sibling folder with `--skip-install`, `rsync` into the repo, then
  `npm install`; package `name` set to `e-ovr`.
- **shadcn CLI changed:** `-b/--base` now selects the component library
  (`radix` | `base`), not the color; base color/theme is chosen via a **preset**.
  `-y` does **not** skip the preset prompt — used `--defaults` (Next template +
  `base-nova` preset: Base UI + Lucide + Geist) for a non-interactive init.
- **Base UI `Button` has no `asChild`** (Radix-ism). It uses a `render` prop;
  for navigation we apply `buttonVariants()` to a Next `<Link>` instead.
- **Font variable alignment:** shadcn's `globals.css` expects `--font-sans`;
  the scaffold's layout defined `--font-geist-sans`. Aligned the Geist loader to
  `--font-sans` so `font-sans` resolves.
- **Next 16 note (for later):** dynamic route `params` is a `Promise` — must be
  awaited in `[ovrTicketNo]` pages.

### 📌 Versions observed
Next.js 16.2.7 · React 19.2.4 · Tailwind v4 · shadcn 4.10 (Base UI 1.5).
