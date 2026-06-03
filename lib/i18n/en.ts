/**
 * English copy dictionary (i18n-ready).
 *
 * All user-facing strings route through this object so a Tagalog (`tl`)
 * dictionary can be added later behind a locale switch without touching
 * components. Import `copy` and read nested keys, e.g. `copy.citizen.searchCta`.
 */

export const copy = {
  app: {
    name: "e-OVR",
    tagline: "Online Ordinance Violation Receipt",
    description:
      "Issue, look up, and settle traffic and ordinance violation tickets online.",
  },
  common: {
    search: "Search",
    clear: "Clear",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    print: "Print",
    payNow: "Pay now",
    payFine: "Pay fine",
    loading: "Loading…",
    notFound: "Not found",
    amountDue: "Amount due",
    totalDue: "Total amount due",
    dueDate: "Due date",
    status: "Status",
  },
  landing: {
    heroTitle: "Settle violations online — fast, clear, and official.",
    heroSubtitle:
      "The Municipality of Iba's modern portal for traffic and ordinance violation receipts.",
    citizenCardTitle: "I have a ticket",
    citizenCardBody:
      "Look up your Ordinance Violation Receipt, review the details, and pay your fine online.",
    citizenCardCta: "Find my ticket",
    adminCardTitle: "I'm an enforcer",
    adminCardBody:
      "Issue a violation ticket on the spot and manage issued receipts.",
    adminCardCta: "Open enforcer portal",
  },
  citizen: {
    searchTitle: "OVR Ticket Search",
    searchHelp:
      "Enter your OVR ticket number and last name to retrieve your violation record.",
    ticketNoLabel: "OVR Ticket No.",
    lastNameLabel: "Last name",
    euaLabel: "I accept the End-User Agreement",
    searchCta: "Search ticket",
    notFoundTitle: "No matching ticket",
    notFoundBody:
      "We couldn't find a ticket with that number and last name. Check your details and try again.",
    home: {
      title: "Find and settle your violation receipt",
      subtitle:
        "Enter your OVR ticket number and last name to view your Order of Payment and pay online.",
      searchCta: "Find my ticket",
      step1Title: "Find your ticket",
      step1Body: "Search using your OVR ticket number and last name.",
      step2Title: "Review the details",
      step2Body: "Check the violation, the basic fines, and any surcharge.",
      step3Title: "Pay online",
      step3Body: "Settle via GCash, Maya, or Landbank and keep your receipt.",
    },
    ticket: {
      orderOfPayment: "Order of Payment",
      violationDetails: "Violation details",
      reminders: "Reminders & end-user notice",
      payFine: "Pay fine",
      printReceipt: "Print receipt",
      viewReceipt: "View / print receipt",
      backToSearch: "Back to search",
      alreadyPaid: "This ticket has already been paid.",
    },
    pay: {
      title: "Pay your fine",
      subtitle: "Choose a payment method to settle this violation.",
      choose: "Choose payment method",
      payNow: "Pay",
      processing: "Processing payment…",
      secure: "Simulated checkout — no real payment is processed.",
      success: "Payment successful — your receipt is ready.",
    },
  },
  admin: {
    portal: "Enforcer Portal",
    dashboard: "Dashboard",
    tickets: "Tickets",
    issueTicket: "Issue ticket",
    newTicketTitle: "Issue Violation Ticket",
  },
} as const;

export type Copy = typeof copy;
