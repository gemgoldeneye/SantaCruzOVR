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
 * Seed logins; all share the demo password for local/dev use (GE-013 roles):
 *  - superadmin → SUPER_ADMIN (manages accounts)
 *  - admin      → ADMIN (dashboard + tickets, no account management)
 *  - enforcer/santos/delacruz → ENFORCER, each linked to an officer
 */
const SEED_USERS: SeedUser[] = [
  { username: "superadmin", role: "SUPER_ADMIN" },
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
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
