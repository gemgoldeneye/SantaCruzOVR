# Upgrading `@gelabs/ovr` in this app

How to move this municipality app to a newer `@gelabs/ovr` version **without
losing data**.

> **TL;DR for production:** `npm install @gelabs/ovr@<new>` → review the new
> migrations → **`npm run db:deploy`**. That's it. Never run `migrate reset`,
> `db push`, or `db:seed` against a database with real data.

---

## Does upgrading the SDK touch my data?

An SDK upgrade is two separate things:

1. **Code** — new/changed components, types, helpers. Pure JS; no effect on the database.
2. **Schema** — the SDK ships Prisma **migrations** (`node_modules/@gelabs/ovr/prisma/migrations/`).
   Applying them changes the database *schema*. Whether your *data* survives depends
   on **what the migration does** and **which command you run** — not on the upgrade itself.

Your data is **not** automatically wiped. `prisma migrate deploy` only applies the
*pending* migrations in order; it never drops the database.

### Migration safety classes

| Class | Examples | Data impact |
|---|---|---|
| **Additive** | new table, new nullable column, new column with a default | ✅ Safe — nothing lost |
| **Converting** | type change / rename written with a `USING` cast or backfill | ✅ Safe *if authored correctly* |
| **Destructive** | drop column/table, add `NOT NULL` to existing data, narrow a type | ⚠️ Data in the affected column **can be lost** |

---

## Command safety — read before you touch a real database

| Command | Use it for | On real data? |
|---|---|---|
| `npm run db:deploy` (`prisma migrate deploy`) | Apply pending migrations in order | ✅ **Yes — the production path.** Does not wipe. |
| `prisma migrate reset` | Drop everything + re-seed | 🚫 **Dev only.** Destroys all data. |
| `prisma db push` | Prototype a schema with no migration history | 🚫 **Dev only.** Can drop data (`--accept-data-loss`). |
| `npm run db:seed` | Load demo catalog/officers/users/tickets | 🚫 **Dev only.** Deletes the demo tickets by number and upserts demo logins. |

> The bundled `docker-compose`, `.env` defaults, seeded logins, and known demo
> passwords are a **local-development sandbox**. Production is a separate,
> deliberate effort (managed Postgres/Redis, rotated secrets, TLS, real auth, a
> real payment gateway, backups, monitoring).

### Why `db:seed` is dev-only

The seed (`prisma/seed.ts`) is idempotent **for demo data**: it `upsert`s
roles/officers/catalog/users and, for each demo ticket, runs
`deleteMany({ where: { ovrTicketNo } })` before re-inserting. On a database with
real records it would re-introduce demo rows and reset the seeded demo tickets.
Migrations already create the system roles, so a real deployment needs only a
deliberate **one-time** bootstrap of a real admin account — not the demo seed.

---

## The safe upgrade recipe (database with real data)

```bash
# 0. BACKUP FIRST — always.
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d-%H%M%S).sql

# 1. Bump the SDK.
npm install @gelabs/ovr@<new-version>

# 2. Review what the new version will do to the schema.
ls node_modules/@gelabs/ovr/prisma/migrations/
#    -> read the migration.sql of any folder you have not applied yet.
#       Look for DROP / ALTER ... TYPE / SET NOT NULL — those are the ones to vet.

# 3. (Recommended) Rehearse on a copy/staging DB first.
#    Restore the backup into a scratch DB, point DATABASE_URL at it, run step 4,
#    smoke-test, then do production.

# 4. Apply — this is the only DB command you run in production.
npm run db:deploy        # = prisma migrate deploy --schema=node_modules/@gelabs/ovr/prisma/schema.prisma

#    DO NOT run: prisma migrate reset, prisma db push, npm run db:seed
```

`db:deploy` is safe to re-run; if there is nothing pending it reports "No pending
migrations" and exits.

---

## Recovering a database that was created with `db push`

If a database has **no `_prisma_migrations` history** (it was bootstrapped with
`prisma db push` instead of migrations), `migrate deploy` will fail — it tries to
re-apply the `init` migration over tables that already exist. **Do not** reach for
`migrate reset` (that wipes data). Instead, **baseline** the migrations the schema
already reflects, then deploy the rest. This is non-destructive.

```bash
# Inspect the schema to find which migrations are already represented, then mark
# each as applied WITHOUT running its SQL:
npx prisma migrate resolve --applied <migration_folder_name> \
  --schema=node_modules/@gelabs/ovr/prisma/schema.prisma
#   ...repeat for every migration the current schema already contains.

# Then apply only the genuinely-pending ones:
npm run db:deploy
```

`migrate resolve --applied` only writes a row into `_prisma_migrations`; it runs no
SQL and changes no data. Baseline **only** migrations whose effects truly exist in
the schema — baselining one whose columns are missing will leave the DB
inconsistent. Going forward the database has proper history, so future upgrades are
a plain `db:deploy`.

---

## Worked example: the 0.3.0 upgrade

0.3.0 added the RBAC admin suite. Its pending migrations were:

- `add_issued_by`, `add_apprehending_enforcer`, `add_activity_log` — **additive** (new column / new table).
- `add_super_admin_role` — **additive** (new enum value).
- `custom_roles` — **converting**: it creates the `Role` table, **`INSERT`s the
  system roles first**, then `ALTER ... TYPE TEXT USING "role"::text` and adds the
  `User.role → Role.name` foreign key. Because the roles exist before the FK, every
  existing user row stays valid. No data lost.

In practice the live LGU databases were upgraded two ways, both preserving data:

- Databases with proper migration history → a plain **`npm run db:deploy`**.
- Databases that were `db push`-created (no history) → **baselined** the
  already-present migrations with `migrate resolve --applied`, then `db:deploy`.

---

## Production checklist

Production is **not** the docker/seed sandbox. Before applying any migration to a
real municipality database:

- [ ] Automated, tested **backups** in place; take a fresh dump immediately before.
- [ ] Migration **reviewed** for destructive statements; rehearsed on a staging copy.
- [ ] Managed Postgres with rotated/secret-managed credentials, TLS (`COOKIE_SECURE=true`).
- [ ] Apply with **`prisma migrate deploy`** only. Never `reset` / `db push` / demo `db:seed`.
- [ ] Real admin accounts provisioned deliberately (not the demo logins).
