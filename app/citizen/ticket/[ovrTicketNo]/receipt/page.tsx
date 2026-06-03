import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { store } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { TicketReceipt } from "@/components/shared/ticket-receipt";
import { PrintButton } from "@/components/shared/print-button";
import { TicketNotFound } from "@/components/citizen/ticket-not-found";
import { copy } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ ovrTicketNo: string }>;
  searchParams: Promise<{ ln?: string }>;
}) {
  const { ovrTicketNo } = await params;
  const { ln } = await searchParams;
  const no = decodeURIComponent(ovrTicketNo);
  const ticket = ln ? await store.searchTicket(no, ln) : null;

  if (!ticket) return <TicketNotFound />;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link
          href={`/citizen/ticket/${encodeURIComponent(no)}?ln=${encodeURIComponent(ln ?? "")}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <PrintButton label={copy.citizen.ticket.printReceipt} />
      </div>

      <TicketReceipt ticket={ticket} />
    </div>
  );
}
