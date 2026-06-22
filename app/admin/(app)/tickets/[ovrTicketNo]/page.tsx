"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CloudOff, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { TicketReceipt } from "@/components/shared/ticket-receipt";
import { PrintButton } from "@/components/shared/print-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePendingSync, useTicket } from "@gelabs/ovr/offline";
import { copy } from "@/lib/i18n/en";

export default function AdminTicketDetail({
  params,
}: {
  params: Promise<{ ovrTicketNo: string }>;
}) {
  const { ovrTicketNo } = use(params);
  const no = decodeURIComponent(ovrTicketNo);
  // Read from the local store: shows tickets issued offline (not yet on the
  // server) as well as those pulled down by the sync loop.
  const ticket = useTicket(no);
  const pending = usePendingSync();

  if (ticket === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (ticket === null) notFound();

  const citizenHref = `/citizen/ticket/${encodeURIComponent(no)}?ln=${encodeURIComponent(
    ticket.violator.lastName,
  )}`;

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8 print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/admin/tickets"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5",
          )}
        >
          <ArrowLeft className="size-4" />
          Back to tickets
        </Link>
        <div className="flex gap-2">
          <Link
            href={citizenHref}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5",
            )}
          >
            <ExternalLink className="size-4" />
            View as citizen
          </Link>
          <PrintButton label="Print" />
        </div>
      </div>

      {pending.has(no) ? (
        <div className="no-print mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <CloudOff className="size-4 shrink-0" />
          {copy.admin.sync.willSync}
        </div>
      ) : null}

      <TicketReceipt ticket={ticket} />
    </div>
  );
}
