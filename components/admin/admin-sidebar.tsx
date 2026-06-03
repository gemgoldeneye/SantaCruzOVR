"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  FilePlus2,
  LogOut,
} from "lucide-react";
import { Seal } from "@/components/shared/seal";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";
import { MUNICIPALITY } from "@/lib/config/iba";
import { copy } from "@/lib/i18n/en";

const NAV = [
  { href: "/admin", label: copy.admin.dashboard, icon: LayoutDashboard },
  { href: "/admin/tickets", label: copy.admin.tickets, icon: ListChecks },
  {
    href: "/admin/tickets/new",
    label: copy.admin.issueTicket,
    icon: FilePlus2,
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/tickets") {
    return (
      pathname === "/admin/tickets" ||
      (pathname.startsWith("/admin/tickets/") &&
        pathname !== "/admin/tickets/new")
    );
  }
  return pathname === href;
}

function NavLinks({ orientation }: { orientation: "v" | "h" }) {
  const pathname = usePathname();
  return (
    <nav
      className={cn(
        orientation === "v" ? "flex flex-col gap-1" : "flex items-center gap-1",
      )}
    >
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              orientation === "h" && "px-2.5",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className={cn(orientation === "h" && "hidden sm:inline")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function SignOut({ compact }: { compact?: boolean }) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      >
        <LogOut className="size-4 shrink-0" />
        <span className={cn(compact && "hidden sm:inline")}>Sign out</span>
      </button>
    </form>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <Seal className="size-8 shrink-0" />
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-sidebar-foreground">
          {MUNICIPALITY.shortName} {copy.app.name}
        </span>
        <span className="block text-[0.7rem] text-sidebar-foreground/60">
          {copy.admin.portal}
        </span>
      </span>
    </Link>
  );
}

export function AdminSidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar p-3 md:flex">
        <div className="px-2 py-2">
          <Brand />
        </div>
        <div className="mt-4 flex-1">
          <NavLinks orientation="v" />
        </div>
        <div className="space-y-1 border-t border-sidebar-border/60 pt-3">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs text-sidebar-foreground/60">Theme</span>
            <span className="text-sidebar-foreground">
              <ThemeToggle />
            </span>
          </div>
          <SignOut />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-sidebar-border bg-sidebar px-3 py-2 text-sidebar-foreground md:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <NavLinks orientation="h" />
          <ThemeToggle />
          <SignOut compact />
        </div>
      </header>
    </>
  );
}
