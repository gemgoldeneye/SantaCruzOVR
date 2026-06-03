"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { store } from "@/lib/data";
import type { PaymentMethod } from "@/lib/types";

export interface PayResult {
  error?: string;
}

export async function payTicketAction(args: {
  ovrTicketNo: string;
  lastName: string;
  method: PaymentMethod;
}): Promise<PayResult> {
  const { ovrTicketNo, lastName, method } = args;

  // Authorize: the ticket must exist and match the last name.
  const ticket = await store.searchTicket(ovrTicketNo, lastName);
  if (!ticket) {
    return { error: "We couldn't verify this ticket. Please search again." };
  }

  const receiptUrl = `/citizen/ticket/${encodeURIComponent(
    ovrTicketNo,
  )}/receipt?ln=${encodeURIComponent(lastName)}`;

  if (ticket.status === "PAID") {
    redirect(receiptUrl);
  }

  try {
    await store.payTicket(ovrTicketNo, { method });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Payment failed." };
  }

  revalidatePath(`/citizen/ticket/${ovrTicketNo}`);
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  redirect(`${receiptUrl}&paid=1`);
}
