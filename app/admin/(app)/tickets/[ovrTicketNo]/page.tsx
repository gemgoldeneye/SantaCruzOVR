import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { store } from "@/lib/data";
import { TicketReceipt } from "@/components/shared/ticket-receipt";
import { PrintButton } from "@/components/shared/print-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminTicketDetail({
  params,
}: {
  params: Promise<{ ovrTicketNo: string }>;
}) {
  const { ovrTicketNo } = await params;
  const no = decodeURIComponent(ovrTicketNo);
  const ticket = await store.getTicketByNo(no);
  if (!ticket) notFound();

  const citizenHref = `/citizen/ticket/${encodeURIComponent(no)}?ln=${encodeURIComponent(
    ticket.violator.lastName,
  )}`;

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
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

      <TicketReceipt ticket={ticket} />
    </div>
  );
}
