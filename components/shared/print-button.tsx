"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrintButton({
  className,
  label = "Print",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Button onClick={() => window.print()} className={cn("gap-2", className)}>
      <Printer className="size-4" />
      {label}
    </Button>
  );
}
