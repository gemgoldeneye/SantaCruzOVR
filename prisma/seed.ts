/**
 * Seed Postgres from the SAME source of truth as the mock store
 * (`lib/data/seed.ts`): catalog, officers, example tickets, enforcer logins, and
 * the aligned global ticket sequence. Idempotent — safe to re-run.
 *
 * Run via `pnpm db:seed` (tsx) — which first runs `db:generate` (see package.json).
 * Imports of `../lib/...` are RELATIVE because tsx does not resolve the `@/` alias;
 * lib/data/seed.ts and lib/config/santa-cruz.ts are pure data. The PrismaClient comes from
 * the data package's generated client (the schema's custom output), NOT from
 * @prisma/client's default location.
 */

import { PrismaClient } from "@gelabs/ovr/data/generated/client";
import { seedRunner } from "@gelabs/ovr/data/seed-runner";
import type { SeedUser } from "@gelabs/ovr/data";
import { SYSTEM_ROLES } from "@gelabs/ovr/types";
import { hash } from "@node-rs/argon2";
import { CATALOG, OFFICERS, SEED_TICKETS } from "../lib/data/seed";
import { DEMO_ADMIN } from "../lib/config/santa-cruz";

const prisma = new PrismaClient();

/**
 * SUPER_ADMIN credentials are CONFIGURABLE via env so each deployment can set
 * its own (instead of the shared demo password). Defaults preserve local-dev
 * behaviour — username `superadmin`, the demo password.
 *   SUPERADMIN_USERNAME  (default: "superadmin")
 *   SUPERADMIN_PASSWORD  (default: the demo password)
 */
const SUPERADMIN_USERNAME =
  process.env.SUPERADMIN_USERNAME?.trim() || "superadmin";
const SUPERADMIN_PASSWORD =
  process.env.SUPERADMIN_PASSWORD || DEMO_ADMIN.password;

/**
 * SEED_SCOPE controls how much of the seed runs:
 *   - "all" (default): demo catalog/officers/tickets/logins PLUS the superadmin.
 *   - "superadmin": ONLY (re)apply the env-driven superadmin — idempotent, meant to
 *     run on EVERY deploy so a rotated SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD
 *     takes effect WITHOUT re-touching demo data (see deploy/<env>/remote-deploy.sh).
 */
const SEED_SCOPE =
  process.env.SEED_SCOPE?.trim().toLowerCase() || "all";

/**
 * Seed logins; all share the demo password for local/dev use (GE-013 roles):
 *  - admin      → ADMIN (dashboard + tickets, no account management)
 *  - enforcer/santos/delacruz → ENFORCER, each linked to an officer
 * The SUPER_ADMIN is seeded separately below with its own env-driven password.
 */
const SEED_USERS: SeedUser[] = [
  { username: "admin", role: "ADMIN" },
  { username: DEMO_ADMIN.username, officerId: OFFICERS[0].id }, // "enforcer"
  { username: "santos", officerId: OFFICERS[1].id },
  { username: "delacruz", officerId: OFFICERS[2].id },
];

/**
 * (Re)apply the env-driven SUPER_ADMIN with its OWN password hash (NOT the shared
 * demo password). Idempotent — the `update` branch re-applies passwordHash so a
 * ROTATED SUPERADMIN_PASSWORD takes effect on re-run.
 */
async function upsertSuperadmin() {
  const superadminHash = await hash(SUPERADMIN_PASSWORD);
  await prisma.user.upsert({
    where: { username: SUPERADMIN_USERNAME },
    update: {
      passwordHash: superadminHash,
      role: "SUPER_ADMIN",
      active: true,
      officerId: null,
    },
    create: {
      username: SUPERADMIN_USERNAME,
      passwordHash: superadminHash,
      role: "SUPER_ADMIN",
      active: true,
      officerId: null,
    },
  });
  console.log(`✓ Superadmin ready (username: ${SUPERADMIN_USERNAME}).`);
}

async function main() {
  // superadmin-only: re-apply credentials each deploy without re-seeding demo data.
  if (SEED_SCOPE === "superadmin") {
    await upsertSuperadmin();
    return;
  }

  const passwordHash = await hash(DEMO_ADMIN.password);
  await seedRunner(prisma, {
    catalog: CATALOG,
    officers: OFFICERS,
    tickets: SEED_TICKETS,
    users: SEED_USERS,
    roles: SYSTEM_ROLES,
    passwordHash,
  });

  // SUPER_ADMIN runs after seedRunner so the SUPER_ADMIN role (FK target) exists.
  await upsertSuperadmin();
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
