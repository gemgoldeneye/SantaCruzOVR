"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { store } from "@/lib/data";
import { initiatePayment } from "@gelabs/ovr/runtime";
import "@/lib/runtime"; // register the runtime (config + store + providers) before use

export interface PayResult {
  error?: string;
}

export async function payTicketAction(args: {
  ovrTicketNo: string;
  lastName: string;
  method: string;
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

  let result;
  try {
    // Service layer resolves the payment provider. The simulated provider settles
    // immediately (records the payment + afterPay hook + notify); a real gateway
    // would return a redirect/QR for the citizen to complete off-site.
    result = await initiatePayment({
      ovrTicketNo,
      methodId: method,
      returnUrl: `${receiptUrl}&paid=1`,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Payment failed." };
  }

  revalidatePath(`/citizen/ticket/${ovrTicketNo}`);
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");

  if (result.kind === "redirect") {
    redirect(result.url);
  }
  redirect(`${receiptUrl}&paid=1`);
}
