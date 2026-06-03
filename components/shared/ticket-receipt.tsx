import { OfficialHeader } from "@/components/shared/official-header";
import { ViolationsTable } from "@/components/shared/violations-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { Separator } from "@/components/ui/separator";
import { formalName, formatDate, formatDateTime } from "@/lib/format";
import { MUNICIPALITY, OFFICES } from "@/lib/config/iba";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/lib/types";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium tabular-nums">{value || "—"}</dd>
    </div>
  );
}

/**
 * The canonical OVR "Order of Payment" document — rendered identically for the
 * citizen receipt and the admin print view. Print-friendly (white paper look).
 */
export function TicketReceipt({ ticket }: { ticket: Ticket }) {
  const paid = ticket.status === "PAID";
  return (
    <div className="mx-auto max-w-3xl rounded-xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8 print:rounded-none print:border-0 print:shadow-none">
      <OfficialHeader />

      <div className="mt-6 flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          OVR Order of Payment
        </h2>
        <StatusBadge status={ticket.status} />
      </div>
      <Separator className="my-4" />

      {/* Violator */}
      <div className="mb-5">
        <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          Name of Violator
        </p>
        <p className="font-heading text-lg font-semibold uppercase">
          {formalName(ticket.violator)}
        </p>
        <p className="text-sm text-muted-foreground">{ticket.violator.address}</p>
      </div>

      {/* Meta grid */}
      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <Field label="OVR Ticket No." value={ticket.ovrTicketNo} />
        <Field label="Order of Payment No." value={ticket.orderOfPaymentNo} />
        <Field label="Bill No." value={ticket.billNo} />
        <Field
          label="Date of Apprehension"
          value={formatDateTime(ticket.apprehendedAt)}
        />
        <Field
          label="Date of Assessment"
          value={formatDateTime(ticket.assessedAt)}
        />
        <Field label="Payment Due Date" value={formatDate(ticket.dueDate)} />
        <Field label="License No." value={ticket.violator.licenseNumber} />
        <Field label="Plate No." value={ticket.violator.plateNumber} />
        <Field label="Place of Violation" value={ticket.placeOfViolation} />
        <Field
          label="Apprehending Officer"
          value={`${ticket.officer.name}${
            ticket.officer.badgeNo ? ` (${ticket.officer.badgeNo})` : ""
          }`}
        />
      </dl>

      {/* Violations */}
      <div className="mt-6">
        <p className="mb-2 text-sm font-medium">Violations</p>
        <div className="rounded-lg border">
          <ViolationsTable violations={ticket.violations} />
        </div>
      </div>

      {/* Totals */}
      <div className="mt-5 flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Basic fines</span>
            <Money value={ticket.basicFinesTotal} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Penalty / surcharge</span>
            <Money
              value={ticket.penaltyAmount}
              className={cn(ticket.penaltyAmount === 0 && "text-muted-foreground")}
            />
          </div>
          <Separator />
          <div
            className={cn(
              "flex items-baseline justify-between rounded-lg px-3 py-2",
              paid ? "bg-emerald-50 dark:bg-emerald-400/10" : "bg-primary/5",
            )}
          >
            <span className="font-medium">
              {paid ? "Amount paid" : "Total amount due"}
            </span>
            <Money
              value={paid ? (ticket.payment?.amount ?? 0) : ticket.totalAmountDue}
              className="text-lg font-bold"
            />
          </div>
        </div>
      </div>

      {/* Payment line (if paid) */}
      {paid && ticket.payment ? (
        <p className="mt-3 text-right text-xs text-muted-foreground">
          Paid via {ticket.payment.method.replace("_", " ")} · Ref{" "}
          <span className="font-mono">{ticket.payment.referenceNo}</span> ·{" "}
          {formatDateTime(ticket.payment.paidAt)}
        </p>
      ) : null}

      {/* Signatures */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-xs">
        <Signature label="Approved for Payment" />
        <Signature label="O.R. No." />
        <Signature label="Signature of Violator / Authorized Representative" />
        <Signature label="Released By" />
      </div>

      <Separator className="my-5" />

      {/* Reminders */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Reminders</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            If you wish to contest this violation, do not pay yet — file a
            complaint within seven (7) days from the date of apprehension.
          </li>
          <li>
            Failure to settle on or before the due date incurs a{" "}
            5% surcharge per month from the date of apprehension.
          </li>
          <li>
            Present this Order of Payment and the original OVR ticket when
            claiming any confiscated item.
          </li>
        </ul>
        <p className="pt-2">
          <span className="font-medium text-foreground">
            {OFFICES.treasury.redemptionCenter}
          </span>
          {" — "}
          {OFFICES.treasury.address}. {OFFICES.treasury.hours}.
        </p>
        <p className="pt-1">
          {MUNICIPALITY.fullName} · This is a system-generated document.
        </p>
      </div>
    </div>
  );
}

function Signature({ label }: { label: string }) {
  return (
    <div className="pt-5">
      <div className="border-t border-foreground/40" />
      <p className="mt-1 text-muted-foreground">{label}</p>
    </div>
  );
}
