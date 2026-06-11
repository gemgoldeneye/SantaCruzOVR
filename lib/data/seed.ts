/**
 * Seed data for the mock store.
 *
 * NOTE: the violation codes below are PLACEHOLDERS — two are copied from the QC
 * sample documents (`A25 …`) and the rest are plausible stand-ins. Replace this
 * catalog with the Municipality of Santa Cruz's actual ordinance schedule before any
 * real use.
 */

import type { Officer, TicketRecord, ViolationCatalogItem } from "@/lib/types";

export const CATALOG: ViolationCatalogItem[] = [
  // ── Traffic ──
  {
    code: "A25 S1-9 S-2021",
    title: "Violation of Other General Driving Rules",
    category: "TRAFFIC",
    basicFine: 500,
    legalText: "Article 25, Section 1 — General driving rules. (placeholder)",
  },
  {
    code: "A25 S7-30 S-2021",
    title: "Violation of PUV Stop / Loading & Unloading Segregation Scheme",
    category: "TRAFFIC",
    basicFine: 500,
    legalText: "Article 25, Section 7 — PUV loading/unloading. (placeholder)",
  },
  {
    code: "TRF-DSGN-01",
    title: "Disregarding Traffic Signs / Signals",
    category: "TRAFFIC",
    basicFine: 1000,
  },
  {
    code: "TRF-HLMT-01",
    title: "Driving / Riding Without a Helmet",
    category: "TRAFFIC",
    basicFine: 1500,
  },
  {
    code: "TRF-LCNS-01",
    title: "Driving Without a License",
    category: "TRAFFIC",
    basicFine: 3000,
  },
  {
    code: "TRF-PARK-01",
    title: "Illegal Parking",
    category: "TRAFFIC",
    basicFine: 1000,
  },
  {
    code: "TRF-RECK-01",
    title: "Reckless Driving",
    category: "TRAFFIC",
    basicFine: 2000,
  },
  {
    code: "TRF-OVLD-01",
    title: "Overloading of Passengers / Cargo",
    category: "TRAFFIC",
    basicFine: 2000,
  },
  {
    code: "TRF-CODE-01",
    title: "Number / Color Coding Violation",
    category: "TRAFFIC",
    basicFine: 500,
  },
  // ── Ordinance ──
  {
    code: "ORD-LITR-01",
    title: "Anti-Littering Ordinance",
    category: "ORDINANCE",
    basicFine: 500,
  },
  {
    code: "ORD-SMOK-01",
    title: "Smoking in a Public Place",
    category: "ORDINANCE",
    basicFine: 1000,
  },
  {
    code: "ORD-CURF-01",
    title: "Curfew for Minors",
    category: "ORDINANCE",
    basicFine: 500,
  },
  {
    code: "ORD-NOIS-01",
    title: "Excessive Noise / Noise Pollution",
    category: "ORDINANCE",
    basicFine: 1000,
  },
  {
    code: "ORD-SANI-01",
    title: "Violation of the Sanitation Code",
    category: "ORDINANCE",
    basicFine: 1500,
  },
];

export const OFFICERS: Officer[] = [
  { id: "off-novelo", name: "NOVELO, RAYMUNDO V.", badgeNo: "A176", office: "POSO" },
  { id: "off-santos", name: "SANTOS, MARIA L.", badgeNo: "B204", office: "POSO" },
  { id: "off-delacruz", name: "DELA CRUZ, JUAN P.", badgeNo: "C091", office: "POSO" },
];

/** Next sequence number after the seeded tickets. */
export const SEED_NEXT_SEQ = 4;

export const SEED_TICKETS: TicketRecord[] = [
  // 1 — recently issued, within the due window → OUTSTANDING
  {
    ovrTicketNo: "STC-2026-000001",
    orderOfPaymentNo: "STC-2026-000001-01",
    billNo: "M-2026-06-01-POSO-A176-000001",
    violator: {
      firstName: "Ramil",
      middleName: "Vinarao",
      lastName: "Guiwo",
      address: "Purok 3, Poblacion North, Santa Cruz, Zambales",
      licenseNumber: "N03-12-345678",
      plateNumber: "ABC 1234",
      contactNo: "0917 555 0101",
    },
    apprehendedAt: "2026-06-01T09:15:00+08:00",
    placeOfViolation: "National Highway cor. Rizal St., Santa Cruz",
    officer: OFFICERS[0],
    violations: [
      {
        catalogCode: "A25 S1-9 S-2021",
        title: "Violation of Other General Driving Rules",
        basicFine: 500,
        details: "Counter-flowing along Rizal Ave.",
      },
    ],
    assessedAt: "2026-06-01T09:40:00+08:00",
    dueDate: "2026-06-08T09:40:00+08:00",
    basicFinesTotal: 500,
    paymentStatus: "UNPAID",
    createdAt: "2026-06-01T09:40:00+08:00",
  },
  // 2 — apprehended months ago, unpaid → OVERDUE (surcharge accrues)
  {
    ovrTicketNo: "STC-2026-000002",
    orderOfPaymentNo: "STC-2026-000002-01",
    billNo: "M-2026-02-06-POSO-B204-000002",
    violator: {
      firstName: "Gian",
      middleName: "Reyes",
      lastName: "Kamaro",
      address: "Purok 2, Lipay, Santa Cruz, Zambales",
      licenseNumber: "D12-98-765432",
      plateNumber: "XYZ 5678",
    },
    apprehendedAt: "2026-02-06T14:42:00+08:00",
    placeOfViolation: "Public Market loading bay, Santa Cruz",
    officer: OFFICERS[1],
    violations: [
      {
        catalogCode: "A25 S7-30 S-2021",
        title: "Violation of PUV Stop / Loading & Unloading Segregation Scheme",
        basicFine: 500,
        details: "Loading passengers outside designated zone.",
      },
      {
        catalogCode: "TRF-PARK-01",
        title: "Illegal Parking",
        basicFine: 1000,
        details: "Tricycle parked on a no-parking lane.",
      },
    ],
    assessedAt: "2026-02-06T15:10:00+08:00",
    dueDate: "2026-02-13T15:10:00+08:00",
    basicFinesTotal: 1500,
    paymentStatus: "UNPAID",
    createdAt: "2026-02-06T15:10:00+08:00",
  },
  // 3 — paid within the due window → PAID
  {
    ovrTicketNo: "STC-2026-000003",
    orderOfPaymentNo: "STC-2026-000003-01",
    billNo: "M-2026-05-20-POSO-C091-000003",
    violator: {
      firstName: "Maria",
      middleName: "Clara",
      lastName: "Delos Reyes",
      address: "Sitio Proper, Bolitoc, Santa Cruz, Zambales",
      licenseNumber: "N01-22-334455",
      plateNumber: "MNL 2468",
      contactNo: "0928 555 0199",
    },
    apprehendedAt: "2026-05-20T16:05:00+08:00",
    placeOfViolation: "Bolitoc junction, Santa Cruz",
    officer: OFFICERS[2],
    violations: [
      {
        catalogCode: "TRF-HLMT-01",
        title: "Driving / Riding Without a Helmet",
        basicFine: 1500,
      },
    ],
    assessedAt: "2026-05-20T16:30:00+08:00",
    dueDate: "2026-05-27T16:30:00+08:00",
    basicFinesTotal: 1500,
    paymentStatus: "PAID",
    payment: {
      method: "GCASH",
      amount: 1500,
      referenceNo: "GCA-20260522-101500",
      paidAt: "2026-05-22T10:15:00+08:00",
    },
    createdAt: "2026-05-20T16:30:00+08:00",
  },
];
