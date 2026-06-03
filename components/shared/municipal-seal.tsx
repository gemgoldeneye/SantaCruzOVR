"use client";

import * as React from "react";
import { Seal } from "@/components/shared/seal";
import { MUNICIPALITY } from "@/lib/config/iba";
import { cn } from "@/lib/utils";

/**
 * Renders the official municipal seal from `/public/iba-seal.png` when present,
 * falling back to the placeholder SVG emblem if the image is missing.
 */
export function MunicipalSeal({ className }: { className?: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) return <Seal className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MUNICIPALITY.sealSrc}
      alt={`${MUNICIPALITY.name} seal`}
      className={cn("object-contain", className)}
      onError={() => setFailed(true)}
    />
  );
}
