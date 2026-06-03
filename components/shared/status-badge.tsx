import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/lib/types";

const STATUS: Record<TicketStatus, { label: string; className: string }> = {
  OUTSTANDING: {
    label: "Outstanding",
    className:
      "border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
  },
  OVERDUE: {
    label: "Overdue",
    className:
      "border border-red-300 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300",
  },
  PAID: {
    label: "Paid",
    className:
      "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
  },
  CONTESTED: {
    label: "Contested",
    className:
      "border border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: TicketStatus;
  className?: string;
}) {
  const s = STATUS[status];
  return <Badge className={cn(s.className, className)}>{s.label}</Badge>;
}
