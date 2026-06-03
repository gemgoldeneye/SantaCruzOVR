"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { copy } from "@/lib/i18n/en";

const ITEMS = [
  { href: "/citizen", label: "Home", exact: true },
  { href: "/citizen/search", label: copy.citizen.home.searchCta },
];

export function CitizenNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {ITEMS.map((it) => {
        const active = it.exact
          ? pathname === it.href
          : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
              active
                ? "bg-white/15 text-gov-foreground"
                : "text-gov-foreground/80 hover:bg-white/10 hover:text-gov-foreground",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
