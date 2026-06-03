<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# e-OVR — agent guide

Online Ordinance Violation Receipt for the Municipality of Iba, Zambales.
Full context: see `project.md`. Live status: `progress.md`. Decisions/gotchas: `learnings.md`.

## Core model — read this first
One canonical record, three views: an enforcer **issues** a ticket → a citizen
**searches & pays** it → both **print** the same receipt. Everything centers on
the `Ticket` type in `lib/types.ts`.

## Conventions
- **Data access only via the `DataStore` interface** (`lib/data/`). Today it's a
  server-side mock (`mock.ts` + `store.json`); later it's Prisma. Never read/write
  data from components directly — use Server Components (reads) + Server Actions (writes).
- **All municipality strings/rules live in `lib/config/iba.ts`.** Don't hardcode
  office names, fines, prefixes, or due windows elsewhere.
- **All user-facing copy lives in `lib/i18n/en.ts`** (i18n-ready). No hardcoded strings in components.
- **UI:** Tailwind v4 + shadcn/ui (Base UI). Note Base UI `Button` has no `asChild` —
  use `buttonVariants()` on `<Link>` for navigation, or the `render` prop.
- **Theme colors:** use semantic tokens (`primary`, `brand`, `success`, `warning`,
  `destructive`, `muted`) — they adapt to dark mode. `brand` = teal accent.
- **Next 16:** dynamic route `params` is a `Promise` — `await` it.

## Commands
- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build / typecheck gate
- `npm run lint` — ESLint
