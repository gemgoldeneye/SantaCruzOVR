"use client";

import * as React from "react";
import { RULES } from "@/lib/config/iba";

const fmt = new Intl.DateTimeFormat("en-PH", {
  timeZone: RULES.timeZone,
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

/** Live Philippine Standard Time. Renders "—" until mounted to avoid hydration mismatch. */
export function PstClock({ className }: { className?: string }) {
  const [now, setNow] = React.useState<string | null>(null);

  React.useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={className}>
      <p className="text-[0.7rem] uppercase tracking-wide opacity-75">
        Philippine Standard Time
      </p>
      <p className="font-medium tabular-nums" suppressHydrationWarning>
        {now ?? "—"}
      </p>
    </div>
  );
}
