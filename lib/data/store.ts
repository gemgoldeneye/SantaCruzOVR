/**
 * The data-access contract. UI code depends ONLY on this interface — never on a
 * concrete store. Today it's backed by a server-side mock (`mock.ts`); later it
 * swaps to a Prisma/SQLite implementation behind the same interface, with no UI
 * changes (see `lib/data/index.ts`).
 */

import type {
  Officer,
  PaymentMethod,
  Ticket,
  TicketStatus,
  ViolationCatalogItem,
  ViolationCategory,
  Violator,
} from "@/lib/types";

/** What an enforcer submits to issue a ticket. */
export interface NewTicketInput {
  violator: Violator;
  apprehendedAt: string; // ISO
  placeOfViolation?: string;
  officerId: string;
  violations: { catalogCode: string; details?: string }[];
  remarks?: string;
}

export interface NewPaymentInput {
  method: PaymentMethod;
}

export interface TicketFilter {
  status?: TicketStatus | "ALL";
  query?: string; // matches name / ticket no. / plate
}

export interface TicketStats {
  total: number;
  outstanding: number;
  overdue: number;
  paid: number;
  contested: number;
  collected: number; // total pesos collected from paid tickets
  issuedToday: number;
}

export interface DataStore {
  listViolationCatalog(
    category?: ViolationCategory,
  ): Promise<ViolationCatalogItem[]>;
  listOfficers(): Promise<Officer[]>;
  getOfficer(id: string): Promise<Officer | null>;

  createTicket(input: NewTicketInput): Promise<Ticket>;
  searchTicket(ovrTicketNo: string, lastName: string): Promise<Ticket | null>;
  getTicketByNo(ovrTicketNo: string): Promise<Ticket | null>;
  listTickets(filter?: TicketFilter): Promise<Ticket[]>;
  payTicket(ovrTicketNo: string, payment: NewPaymentInput): Promise<Ticket>;

  stats(): Promise<TicketStats>;
}
