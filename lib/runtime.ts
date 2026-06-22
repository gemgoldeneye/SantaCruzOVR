/**
 * OVR runtime setup for the Santa Cruz app — assembles config + store + providers once
 * per server process. Import this module (for its side effect) before using the
 * SDK service (`issueTicket` / `initiatePayment`).
 *
 * Defaults are used for now: the simulated payment provider + a no-op notifier
 * (no real integrations). Wire a real PaymentProvider / NotificationProvider here
 * to light up GCash/Maya/SMS/etc. for this LGU — no core changes needed.
 *
 * Imports flow through the single `@gelabs/ovr` SDK surface.
 */
import "server-only";
import { defineOvrRuntime } from "@gelabs/ovr/runtime";
import type { OvrConfig } from "@gelabs/ovr/config";
import { santaCruzConfig } from "@/lib/config/santa-cruz";
import { store } from "@/lib/data";

export const runtime = defineOvrRuntime({
  config: santaCruzConfig as OvrConfig,
  store,
});
