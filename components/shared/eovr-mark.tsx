import { ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";

/** The e-OVR product mark — a receipt glyph, distinct from the municipal seal. */
export function EovrMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg bg-brand/15 text-brand",
        className,
      )}
    >
      <ReceiptText className="size-5" />
    </span>
  );
}
