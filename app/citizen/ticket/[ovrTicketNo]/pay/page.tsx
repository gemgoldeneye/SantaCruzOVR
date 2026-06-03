import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { store } from "@/lib/data";
import { PaymentForm } from "@/components/citizen/payment-form";
import { TicketNotFound } from "@/components/citizen/ticket-not-found";
import { buttonVariants } from "@/components/ui/button";
import { formalName } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PayPage({
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
  if (ticket.status === "PAID") {
    redirect(
      `/citizen/ticket/${encodeURIComponent(no)}/receipt?ln=${encodeURIComponent(ln ?? "")}`,
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6">
      <Link
        href={`/citizen/ticket/${encodeURIComponent(no)}?ln=${encodeURIComponent(ln ?? "")}`}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-4 gap-1.5",
        )}
      >
        <ArrowLeft className="size-4" />
        Back to ticket
      </Link>
      <PaymentForm
        ovrTicketNo={no}
        lastName={ln ?? ""}
        violatorName={formalName(ticket.violator)}
        basicFines={ticket.basicFinesTotal}
        penalty={ticket.penaltyAmount}
        amount={ticket.totalAmountDue}
      />
    </div>
  );
}
