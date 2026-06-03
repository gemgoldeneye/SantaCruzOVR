import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { formalName, formatDate } from "@/lib/format";
import type { Ticket } from "@/lib/types";

export function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">
        No tickets match this view.
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticket No.</TableHead>
          <TableHead>Violator</TableHead>
          <TableHead className="hidden sm:table-cell">Apprehended</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((t) => {
          const href = `/admin/tickets/${encodeURIComponent(t.ovrTicketNo)}`;
          const amount =
            t.status === "PAID" ? (t.payment?.amount ?? 0) : t.totalAmountDue;
          return (
            <TableRow key={t.ovrTicketNo}>
              <TableCell className="font-mono text-xs">
                <Link href={href} className="hover:underline">
                  {t.ovrTicketNo}
                </Link>
              </TableCell>
              <TableCell className="font-medium">
                {formalName(t.violator)}
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {formatDate(t.apprehendedAt)}
              </TableCell>
              <TableCell>
                <StatusBadge status={t.status} />
              </TableCell>
              <TableCell className="text-right">
                <Money value={amount} />
              </TableCell>
              <TableCell>
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Open ${t.ovrTicketNo}`}
                >
                  <ChevronRight className="size-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
