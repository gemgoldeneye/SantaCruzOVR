/**
 * Central configuration for the e-OVR deployment.
 *
 * Everything municipality-specific lives here so the app can be re-pointed to a
 * different LGU by editing one file. Adjust office names, the seal asset, ID
 * prefixes, the due window, and the surcharge rate to match the real ordinance.
 */

export const MUNICIPALITY = {
  name: "Municipality of Santa Cruz",
  province: "Zambales",
  fullName: "Municipality of Santa Cruz, Zambales",
  shortName: "Santa Cruz",
  /** Drop the official seal PNG at /public/santa-cruz-seal.png to replace the placeholder. */
  sealSrc: "/santa-cruz-seal.png",
  tagline: "Online Ordinance Violation Receipt",
  country: "Republic of the Philippines",
  region: "Region III (Central Luzon)",
} as const;

/** Offices referenced on tickets and receipts. Edit to match Santa Cruz's actual org. */
export const OFFICES = {
  /** Issues/enforces violations. */
  enforcement: {
    name: "Public Order and Safety Office",
    abbr: "POSO",
  },
  /** Collects payments / redemption center. */
  treasury: {
    name: "Municipal Treasurer's Office",
    abbr: "MTO",
    redemptionCenter: "OVR Redemption Center, Municipal Treasurer's Office",
    address:
      "Ground Floor, Santa Cruz Municipal Hall, Poblacion South, Santa Cruz, Zambales",
    hours: "Monday to Friday, 8:00 AM – 5:00 PM",
    email: "treasury@santacruz-zambales.gov.ph",
  },
} as const;

/** Ticket / numbering and assessment rules. */
export const RULES = {
  /** Prefix for OVR ticket numbers, e.g. STC-2026-000123. */
  idPrefix: "STC",
  /** Days from assessment until payment is due. */
  dueWindowDays: 7,
  /** Monthly surcharge rate applied after the due date (5% / month). */
  surchargeRatePerMonth: 0.05,
  /** Currency. */
  currency: "PHP",
  currencySymbol: "₱",
  locale: "en-PH",
  timeZone: "Asia/Manila",
} as const;

/** Simulated payment channels shown at checkout (no real money moves). */
export const PAYMENT_METHODS = [
  { id: "GCASH", label: "GCash", blurb: "Pay instantly with your GCash wallet." },
  { id: "MAYA", label: "Maya", blurb: "Pay using your Maya account." },
  { id: "LANDBANK", label: "Landbank Link.BizPortal", blurb: "Online bank transfer." },
  {
    id: "OVER_THE_COUNTER",
    label: "Over the counter",
    blurb: "Pay in person at the Municipal Treasurer's Office.",
  },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

/** Mock enforcer credentials for the admin portal (front-end only). */
export const DEMO_ADMIN = {
  username: "enforcer",
  password: "stacruz2026",
  hint: "Demo login — username: enforcer · password: stacruz2026",
} as const;
