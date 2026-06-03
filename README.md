# e-OVR — Online Ordinance Violation Receipt

Modern web app for issuing and settling traffic / ordinance violation tickets online
for the **Municipality of Iba, Zambales**. Next.js 16 · TypeScript · Tailwind v4 ·
shadcn/ui. One canonical ticket record, three views (enforcer issues → citizen
searches & pays → printable receipt).

## Quick start

```bash
npm install
npm run dev   # if port 3000 is busy, Next auto-picks 3001 — watch the console
```

- **Citizen portal:** `/citizen` (public) — search a ticket, view the Order of
  Payment, pay (simulated), print the receipt.
- **Enforcer portal:** `/admin` — sign in (`enforcer` / `iba2026`), issue tickets
  with a live preview, manage issued tickets.

### Demo data
Tickets `IBA-2026-000001` (Guiwo — outstanding), `IBA-2026-000002` (Kamaro —
overdue + surcharge), `IBA-2026-000003` (Delos Reyes — paid). The store is
in-memory, so **data resets when the dev server restarts**.

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
