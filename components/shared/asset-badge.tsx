"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A circular logo slot that shows an image when the asset exists and otherwise a
 * subtle fallback. Used for official program seals on the masthead; drop the real
 * PNGs at the configured paths to replace the placeholders.
 */
export function AssetBadge({
  src,
  label,
  fallback,
  className,
}: {
  src: string;
  label: string;
  fallback: React.ReactNode;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex size-9 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
    >
      {failed ? (
        fallback
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          className="size-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
