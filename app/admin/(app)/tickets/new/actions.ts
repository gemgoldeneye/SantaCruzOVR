"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { store } from "@/lib/data";
import type { NewTicketInput } from "@/lib/data";

export interface CreateResult {
  error?: string;
}

export async function createTicketAction(
  input: NewTicketInput,
): Promise<CreateResult> {
  const v = input.violator;
  if (!v?.firstName?.trim() || !v?.lastName?.trim()) {
    return { error: "Violator first and last name are required." };
  }
  if (!v?.address?.trim()) return { error: "Violator address is required." };
  if (!v?.licenseNumber?.trim()) {
    return { error: "License number is required." };
  }
  if (!input.apprehendedAt) {
    return { error: "Date and time of apprehension is required." };
  }
  if (!input.officerId) {
    return { error: "Apprehending officer is required." };
  }
  if (!input.violations || input.violations.length === 0) {
    return { error: "Select at least one violation." };
  }

  let ticketNo: string;
  try {
    const ticket = await store.createTicket(input);
    ticketNo = ticket.ovrTicketNo;
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to issue the ticket.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  redirect(`/admin/tickets/${encodeURIComponent(ticketNo)}`);
}
