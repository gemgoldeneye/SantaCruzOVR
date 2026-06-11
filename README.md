# e-OVR — Online Ordinance Violation Receipt

Modern web app for issuing and settling traffic / ordinance violation tickets online
for the **Municipality of Santa Cruz, Zambales**. Next.js 16 · TypeScript · Tailwind v4 ·
shadcn/ui. One canonical ticket record, three views (enforcer issues → citizen
searches & pays → printable receipt).

## Quick start

```bash
npm install
npm run dev          # single server on http://localhost:4400 (both portals)
```

To run the two portals on **separate ports** (handy alongside other local
projects on 3000/3001), use two terminals — they share the same ticket data:

```bash
npm run dev:citizen  # http://localhost:4410  →  open /citizen
npm run dev:admin    # http://localhost:4420  →  open /admin
npm run dev:both     # both at once (Ctrl-C stops both)
```

- **Citizen portal:** `/citizen` (public) — search a ticket, view the Order of
  Payment, pay (simulated), print the receipt.
- **Enforcer portal:** `/admin` — sign in (`enforcer` / `stacruz2026`), issue tickets
  with a live preview, manage issued tickets.

Both ports read/write one shared store, so a ticket issued in the admin portal is
immediately found in the citizen portal.

### Demo data
Tickets `STC-2026-000001` (Guiwo — outstanding), `STC-2026-000002` (Kamaro —
overdue + surcharge), `STC-2026-000003` (Delos Reyes — paid). Data persists in
`/tmp/stacruz-eovr-store.json` (override with `EOVR_STORE_FILE`); **delete that file to
reset to the seed data.**

## Scripts
- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build / typecheck
- `npm run lint` — ESLint

## Docs
- [`project.md`](./project.md) — vision, scope, architecture, decisions
- [`progress.md`](./progress.md) — phase-by-phase build tracker
- [`learnings.md`](./learnings.md) — milestones, decisions, gotchas
- [`AGENTS.md`](./AGENTS.md) — conventions for contributors/agents
- [`reference/`](./reference/) — original QC sample screens (design reference)

> Payments and admin auth are simulated for this MVP. The data layer is built behind
> a `DataStore` interface (`lib/data/`) so the SQLite + Prisma backend swaps in
> without UI changes.
