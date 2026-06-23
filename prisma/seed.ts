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

async function main() {
  const passwordHash = await hash(DEMO_ADMIN.password);
  await seedRunner(prisma, {
    catalog: CATALOG,
    officers: OFFICERS,
    tickets: SEED_TICKETS,
    users: SEED_USERS,
    roles: SYSTEM_ROLES,
    passwordHash,
  });

  // SUPER_ADMIN — env-configurable credentials with its OWN password hash (NOT
  // the shared demo password). Set SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD in
  // .env. Runs after seedRunner so the SUPER_ADMIN role (FK target) exists.
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

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
