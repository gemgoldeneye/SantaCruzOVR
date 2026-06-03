import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Peso amount with tabular figures so columns align. */
export function Money({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>{formatPeso(value)}</span>
  );
}
