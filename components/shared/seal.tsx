import { cn } from "@/lib/utils";

/**
 * Placeholder municipal emblem for Santa Cruz, Zambales — a coastal "sun over waves"
 * mark in the brand palette. Swap for the official seal by dropping a raster at
 * /public/santa-cruz-seal.png and rendering it where this component is used.
 */
export function Seal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Municipality of Santa Cruz seal"
      className={cn("size-10", className)}
    >
      <circle
        cx="32"
        cy="32"
        r="30"
        className="fill-card stroke-primary"
        strokeWidth="2.5"
      />
      <circle
        cx="32"
        cy="32"
        r="24"
        className="fill-none stroke-primary/25"
        strokeWidth="1"
      />
      {/* sun */}
      <circle cx="32" cy="25" r="6" className="fill-warning" />
      {[...Array(7)].map((_, i) => {
        const a = (Math.PI / 8) * (i - 3);
        const x1 = 32 + Math.sin(a) * 9;
        const y1 = 25 - Math.cos(a) * 9;
        const x2 = 32 + Math.sin(a) * 12;
        const y2 = 25 - Math.cos(a) * 12;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="stroke-warning"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        );
      })}
      {/* waves (sea) */}
      <path
        d="M14 40 q4.5 -4 9 0 t9 0 t9 0 t9 0"
        className="fill-none stroke-brand"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M14 46 q4.5 -4 9 0 t9 0 t9 0 t9 0"
        className="fill-none stroke-brand/70"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
