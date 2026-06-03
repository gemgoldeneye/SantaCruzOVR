import { ViolationsTable } from "@/components/shared/violations-table";
import { AmountSummary } from "@/components/shared/amount-summary";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formalName, formatDateTime } from "@/lib/format";
import type { Ticket } from "@/lib/types";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="truncate font-medium">{value || "—"}</dd>
    </div>
  );
}

/** A live, miniature Order of Payment — exactly what the citizen will later see. */
export function TicketPreview({ ticket }: { ticket: Ticket }) {
  const hasName = ticket.violator.firstName || ticket.violator.lastName;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
            Live ticket preview
          </CardTitle>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="font-heading text-lg font-semibold uppercase">
          {hasName ? formalName(ticket.violator) : "New violator"}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {ticket.violator.address || "—"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <Field label="OVR Ticket No." value={ticket.ovrTicketNo} />
          <Field label="License No." value={ticket.violator.licenseNumber} />
          <Field
            label="Apprehended"
            value={ticket.apprehendedAt ? formatDateTime(ticket.apprehendedAt) : "—"}
          />
          <Field label="Officer" value={ticket.officer.name} />
        </dl>

        {ticket.violations.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <ViolationsTable violations={ticket.violations} />
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            No violations selected yet.
          </p>
        )}

        <div className="rounded-lg border bg-muted/20 p-3">
          <AmountSummary ticket={ticket} />
        </div>
      </CardContent>
    </Card>
  );
}
