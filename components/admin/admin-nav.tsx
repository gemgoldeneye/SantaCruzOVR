"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, FilePlus2, LogOut } from "lucide-react";
import { signOutAction } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";
import { copy } from "@/lib/i18n/en";

const NAV = [
  { href: "/admin", label: copy.admin.dashboard, icon: LayoutDashboard },
  { href: "/admin/tickets", label: copy.admin.tickets, icon: ListChecks },
  { href: "/admin/tickets/new", label: copy.admin.issueTicket, icon: FilePlus2 },
];

function isActive(p: string, href: string) {
  if (href === "/admin") return p === "/admin";
  if (href === "/admin/tickets") {
    return (
      p === "/admin/tickets" ||
      (p.startsWith("/admin/tickets/") && p !== "/admin/tickets/new")
    );
  }
  return p === href;
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-0.5 sm:gap-1">
      {NAV.map((it) => {
        const active = isActive(pathname, it.href);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-white/15 text-gov-foreground"
                : "text-gov-foreground/80 hover:bg-white/10 hover:text-gov-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="hidden md:inline">{it.label}</span>
          </Link>
        );
      })}
      <form action={signOutAction}>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gov-foreground/80 transition-colors hover:bg-white/10 hover:text-gov-foreground"
        >
          <LogOut className="size-4 shrink-0" />
          <span className="hidden md:inline">Sign out</span>
        </button>
      </form>
    </nav>
  );
}
