# Learnings & Milestones — e-OVR

A running log of breakthroughs, milestones, key decisions, and gotchas.
Newest entries on top.

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
  The mock runs server-side (in-memory + `store.json`) behind a `DataStore`
  interface, accessed via Server Components (reads) + Server Actions (writes) —
  exactly where Prisma will live, so the later swap is a one-file change.
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
