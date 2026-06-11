import { Separator } from "@/components/ui/separator";
import { Money } from "@/components/shared/money";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RULES } from "@/lib/config/santa-cruz";
import type { Ticket } from "@/lib/types";

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <Money value={value} className={cn(muted && "text-muted-foreground")} />
    </div>
  );
}

export function AmountSummary({ ticket }: { ticket: Ticket }) {
  const paid = ticket.status === "PAID";
  return (
    <div className="space-y-2.5 text-sm">
      <Row label="Basic fines" value={ticket.basicFinesTotal} />
      <Row
        label="Penalty / surcharge"
        value={ticket.penaltyAmount}
        muted={ticket.penaltyAmount === 0}
      />
      <Separator />
      <div className="flex items-baseline justify-between">
        <span className="font-medium">
          {paid ? "Amount paid" : "Total amount due"}
        </span>
        <Money
          value={paid ? (ticket.payment?.amount ?? 0) : ticket.totalAmountDue}
          className="text-xl font-semibold"
        />
      </div>
      {!paid ? (
        <p className="text-xs text-muted-foreground">
          Pay on or before{" "}
          <span className="font-medium text-foreground">
            {formatDate(ticket.dueDate)}
          </span>{" "}
          to avoid a {RULES.surchargeRatePerMonth * 100}% monthly surcharge.
        </p>
      ) : null}
    </div>
  );
}
