/**
 * Central configuration for the e-OVR deployment.
 *
 * Everything municipality-specific lives here so the app can be re-pointed to a
 * different LGU by editing one file. Adjust office names, the seal asset, ID
 * prefixes, the due window, and the surcharge rate to match the real ordinance.
 */

export const MUNICIPALITY = {
  name: "Municipality of Iba",
  province: "Zambales",
  fullName: "Municipality of Iba, Zambales",
  shortName: "Iba",
  /** Drop the official seal PNG at /public/iba-seal.png to replace the placeholder. */
  sealSrc: "/iba-seal.png",
  tagline: "Online Ordinance Violation Receipt",
  country: "Republic of the Philippines",
  region: "Region III (Central Luzon)",
} as const;

/** Offices referenced on tickets and receipts. Edit to match Iba's actual org. */
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
      "Ground Floor, Iba Municipal Hall, Zone 4, Iba, Zambales",
    hours: "Monday to Friday, 8:00 AM – 5:00 PM",
    email: "treasury@iba.gov.ph",
  },
} as const;

/** Ticket / numbering and assessment rules. */
export const RULES = {
  /** Prefix for OVR ticket numbers, e.g. IBA-2026-000123. */
  idPrefix: "IBA",
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
  password: "iba2026",
  hint: "Demo login — username: enforcer · password: iba2026",
} as const;
