import Link from "next/link";
import { ArrowLeft, CreditCard, Printer, CheckCircle2 } from "lucide-react";
import { store } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ViolationsTable } from "@/components/shared/violations-table";
import { AmountSummary } from "@/components/shared/amount-summary";
import { StatusBadge } from "@/components/shared/status-badge";
import { TicketNotFound } from "@/components/citizen/ticket-not-found";
import { formalName, formatDate, formatDateTime } from "@/lib/format";
import { OFFICES } from "@/lib/config/iba";
import { copy } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium tabular-nums">{value || "—"}</span>
    </div>
  );
}

export default async function TicketPage({
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

  const lnQuery = `?ln=${encodeURIComponent(ln ?? "")}`;
  const paid = ticket.status === "PAID";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/citizen/search"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-4 gap-1.5",
        )}
      >
        <ArrowLeft className="size-4" />
        {copy.citizen.ticket.backToSearch}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {copy.citizen.ticket.orderOfPayment}
                  </p>
                  <CardTitle className="mt-1 text-xl uppercase">
                    {formalName(ticket.violator)}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ticket.violator.address}
                  </p>
                </div>
                <StatusBadge status={ticket.status} className="mt-1" />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 rounded-lg border bg-muted/20 p-3 sm:grid-cols-3">
                <div className="text-sm">
                  <dt className="text-xs text-muted-foreground">OVR Ticket No.</dt>
                  <dd className="font-medium">{ticket.ovrTicketNo}</dd>
                </div>
                <div className="text-sm">
                  <dt className="text-xs text-muted-foreground">License No.</dt>
                  <dd className="font-medium">
                    {ticket.violator.licenseNumber}
                  </dd>
                </div>
                <div className="text-sm">
                  <dt className="text-xs text-muted-foreground">Plate No.</dt>
                  <dd className="font-medium">
                    {ticket.violator.plateNumber || "—"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {copy.citizen.ticket.violationDetails}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <ViolationsTable violations={ticket.violations} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Accordion>
                <AccordionItem value="reminders">
                  <AccordionTrigger>
                    {copy.citizen.ticket.reminders}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    <ul className="list-disc space-y-2 pl-4">
                      <li>
                        If you wish to contest this violation, do not pay yet —
                        file a complaint within seven (7) days from the date of
                        apprehension.
                      </li>
                      <li>
                        Unpaid tickets accrue a 5% surcharge per month from the
                        date of apprehension.
                      </li>
                      <li>
                        Pay online here, or in person at the{" "}
                        {OFFICES.treasury.name} ({OFFICES.treasury.abbr}).
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Summary column */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="text-base">Order of Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="divide-y">
                <Meta
                  label="Order of Payment No."
                  value={ticket.orderOfPaymentNo}
                />
                <Meta
                  label="Apprehended"
                  value={formatDateTime(ticket.apprehendedAt)}
                />
                <Meta
                  label="Assessed"
                  value={formatDateTime(ticket.assessedAt)}
                />
                <Meta label="Due date" value={formatDate(ticket.dueDate)} />
                <Meta
                  label="Officer"
                  value={ticket.officer.name}
                />
              </div>

              <div className="rounded-lg border bg-muted/20 p-3">
                <AmountSummary ticket={ticket} />
              </div>

              {paid ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0" />
                  {copy.citizen.ticket.alreadyPaid}
                </div>
              ) : (
                <Link
                  href={`/citizen/ticket/${encodeURIComponent(no)}/pay${lnQuery}`}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-11 w-full gap-2 text-base",
                  )}
                >
                  <CreditCard className="size-5" />
                  {copy.citizen.ticket.payFine}
                </Link>
              )}

              <Link
                href={`/citizen/ticket/${encodeURIComponent(no)}/receipt${lnQuery}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-10 w-full gap-2",
                )}
              >
                <Printer className="size-4" />
                {copy.citizen.ticket.viewReceipt}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
