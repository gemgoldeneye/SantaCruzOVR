/**
 * Single source of truth for which backend the app runs on.
 *
 * `true`  -> real Postgres (`prismaStore`) + real admin auth (Redis sessions).
 * `false` -> in-memory/file mock (`mockStore`) + legacy demo-cookie auth, so the
 *            app still runs with ZERO infrastructure (`npm run dev`).
 *
 * Both the data-layer swap (`lib/data/index.ts`) and the auth layer read this,
 * so they can never disagree about which mode is active.
 */

export const useDbBackend =
  !!process.env.DATABASE_URL || process.env.EOVR_DATA_BACKEND === "prisma";
