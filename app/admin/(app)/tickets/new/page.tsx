"use client";

import { useRouter } from "next/navigation";
import { IssuanceForm } from "@/components/admin/issuance-form";
import { copy } from "@/lib/i18n/en";
import { RULES } from "@/lib/config/santa-cruz";
import { useCatalog, useOfficers, issueTicketOffline } from "@gelabs/ovr/offline";
import type { NewTicketInput } from "@/lib/data";

export default function NewTicketPage() {
  const catalog = useCatalog();
  const officers = useOfficers();
  const router = useRouter();

  // Offline-first issuance: write to the local store (+ outbox), then show the
  // receipt from the local copy. issueTicketOffline pushes to the server in the
  // background when online; the outbox flushes on reconnect. The catalog +
  // officers come from the local store (synced when last online).
  async function createAction(input: NewTicketInput) {
    const v = input.violator;
    if (!v?.firstName?.trim() || !v?.lastName?.trim())
      return { error: "Violator first and last name are required." };
    if (!v?.street?.trim() || !v?.cityMunicipality?.trim() || !v?.province?.trim())
      return {
        error: "Address line, city/municipality, and province are required.",
      };
    if (!v?.licenseNumber?.trim())
      return { error: "License number is required." };
    if (!input.apprehendedAt)
      return { error: "Date and time of apprehension is required." };
    if (!input.officerId) return { error: "Apprehending officer is required." };
    if (!input.violations?.length)
      return { error: "Select at least one violation." };

    try {
      const ticket = await issueTicketOffline(input, RULES);
      router.push(`/admin/tickets/${encodeURIComponent(ticket.ovrTicketNo)}`);
      return {};
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Failed to issue the ticket.",
      };
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {copy.admin.newTicketTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details — the ticket preview updates live, then confirm to
          issue it.
        </p>
      </div>
      {catalog && officers ? (
        <IssuanceForm
          catalog={catalog}
          officers={officers}
          createAction={createAction}
        />
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      )}
    </div>
  );
}
