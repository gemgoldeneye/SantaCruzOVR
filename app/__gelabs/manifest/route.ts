// SDK manifest endpoint — lets the central @gelabs/ovr dashboard poll this
// deployment's live state (version, DB tables/migrations, health). Token-gated via
// the GELABS_MANIFEST_TOKEN env var; the SDK ships the logic (@gelabs/ovr/manifest),
// this is the Next glue. Served at /__gelabs/manifest.
import { createRequire } from "node:module";
import { NextResponse } from "next/server";
import { createManifestHandler } from "@gelabs/ovr/manifest";
import { prisma } from "@gelabs/ovr/data/db";

const require = createRequire(import.meta.url);
const { version } = require("@gelabs/ovr/package.json") as { version: string };

export const dynamic = "force-dynamic";

const handle = createManifestHandler({
  app: { name: "santacruz", env: process.env.NODE_ENV ?? "development" },
  version,
  query: (sql) => prisma.$queryRawUnsafe(sql),
  bootMode: process.env.SEED_MODE,
  token: process.env.GELABS_MANIFEST_TOKEN,
});

export async function GET(req: Request): Promise<Response> {
  const { status, body } = await handle({
    headers: Object.fromEntries(req.headers) as Record<string, string | string[] | undefined>,
  });
  return NextResponse.json(body, { status });
}
