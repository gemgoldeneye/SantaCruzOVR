/**
 * Per-LGU config INSTANCE for the Municipality of Santa Cruz e-OVR deployment.
 *
 * Validated against the SDK config contract (`@gelabs/ovr/config`). Everything
 * municipality-specific lives here — change the values to re-point the app.
 *
 * The named exports (MUNICIPALITY/OFFICES/RULES/PAYMENT_METHODS/DEMO_ADMIN) are
 * kept so `@/lib/config/santa-cruz` imports resolve across the app.
 */
import { defineOvrConfig } from "@gelabs/ovr/config";

export const santaCruzConfig = defineOvrConfig({
  municipality: {
    name: "Municipality of Santa Cruz",
    province: "Zambales",
    fullName: "Municipality of Santa Cruz, Zambales",
    shortName: "Santa Cruz",
    /** Drop the official seal PNG at /public/santa-cruz-seal.png to replace the placeholder. */
    sealSrc: "/santa-cruz-seal.png",
    tagline: "Online Ordinance Violation Receipt",
    country: "Republic of the Philippines",
    region: "Region III (Central Luzon)",
  },
  offices: {
    enforcement: {
      name: "Public Order and Safety Office",
      abbr: "POSO",
    },
    treasury: {
      name: "Municipal Treasurer's Office",
      abbr: "MTO",
      redemptionCenter: "OVR Redemption Center, Municipal Treasurer's Office",
      address:
        "Ground Floor, Santa Cruz Municipal Hall, Poblacion South, Santa Cruz, Zambales",
      hours: "Monday to Friday, 8:00 AM – 5:00 PM",
      email: "treasury@santacruz-zambales.gov.ph",
    },
  },
  rules: {
    idPrefix: "STC",
    dueWindowDays: 7,
    surchargeRatePerMonth: 0.05,
    currency: "PHP",
    currencySymbol: "₱",
    locale: "en-PH",
    timeZone: "Asia/Manila",
  },
  paymentMethods: [
    { id: "GCASH", label: "GCash", blurb: "Pay instantly with your GCash wallet." },
    { id: "MAYA", label: "Maya", blurb: "Pay using your Maya account." },
    { id: "LANDBANK", label: "Landbank Link.BizPortal", blurb: "Online bank transfer." },
    {
      id: "OVER_THE_COUNTER",
      label: "Over the counter",
      blurb: "Pay in person at the Municipal Treasurer's Office.",
    },
  ],
  demoAdmin: {
    username: "enforcer",
    password: "stacruz2026",
    hint: "Demo login — username: enforcer · password: stacruz2026",
  },
});

/** Back-compat named exports. */
export const MUNICIPALITY = santaCruzConfig.municipality;
export const OFFICES = santaCruzConfig.offices;
export const RULES = santaCruzConfig.rules;
export const PAYMENT_METHODS = santaCruzConfig.paymentMethods;
export const DEMO_ADMIN = santaCruzConfig.demoAdmin;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];
