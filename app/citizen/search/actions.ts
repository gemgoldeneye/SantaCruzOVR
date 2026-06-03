"use server";

import { redirect } from "next/navigation";
import { store } from "@/lib/data";

export interface SearchState {
  error?: string;
}

export async function searchTicketAction(
  _prev: SearchState,
  formData: FormData,
): Promise<SearchState> {
  const ticketNo = String(formData.get("ticketNo") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const accepted = formData.get("eua") != null;

  if (!ticketNo || !lastName) {
    return { error: "Please enter both your OVR ticket number and last name." };
  }
  if (!accepted) {
    return { error: "Please accept the End-User Agreement to continue." };
  }

  const ticket = await store.searchTicket(ticketNo, lastName);
  if (!ticket) {
    return {
      error:
        "No matching ticket found. Double-check your OVR ticket number and last name.",
    };
  }

  redirect(
    `/citizen/ticket/${encodeURIComponent(ticket.ovrTicketNo)}?ln=${encodeURIComponent(lastName)}`,
  );
}
