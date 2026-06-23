"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FilePlus2, Clock, AlertTriangle, Coins } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { TicketsTable } from "@/components/admin/tickets-table";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RULES } from "@/lib/config/santa-cruz";
import { useTickets, useIdentity } from "@gelabs/ovr/offline";
import { hasPermission } from "@gelabs/ovr/types";
import {
  dashboardDateRange,
  customDateRange,
  computeDashboardStats,
  DASHBOARD_PRESETS,
  type DashboardRangePreset,
} from "@gelabs/ovr/core";

export default function AdminDashboard() {
  // Local-first: all tickets read from the on-device store, kept fresh by the
  // sync loop (admin layout). `undefined` while loading → cards show "—".
  const tickets = useTickets();

  // GE-010: quick time-range presets + a custom from/to range. Stats + recent are
  // recomputed locally from the on-device tickets, scoped by ISSUE date — instant
  // + works offline.
  const [preset, setPreset] = useState<DashboardRangePreset>("mtd");
  const [custom, setCustom] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function enableCustom() {
    if (!from || !to) {
      // default the custom range to month-to-date in the LGU timezone
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: RULES.timeZone,
      }).format(new Date());
      setFrom(`${today.slice(0, 7)}-01`);
      setTo(today);
    }
    setCustom(true);
  }

  const { stats, recent } = useMemo(() => {
    const list = tickets ?? [];
    const now = new Date();
    const range = custom
      ? customDateRange(from, to, now, RULES.timeZone)
      : dashboardDateRange(preset, now, RULES.timeZone);
    const lo = range.fromISO ? Date.parse(range.fromISO) : -Infinity;
    const hi = Date.parse(range.toISO);
    const inRange = list.filter((t) => {
      const c = Date.parse(t.createdAt);
      return c >= lo && c <= hi;
    });
    return {
      stats: computeDashboardStats(list, range),
      recent: inRange.slice(0, 6),
    };
  }, [tickets, preset, custom, from, to]);

  // RBAC guard (GE-013): needs dashboard:view; the nav hides it for roles without
  // it (e.g. enforcers) — this also blocks direct navigation.
  const identity = useIdentity();
  const router = useRouter();
  const denied = !!identity && !hasPermission(identity.permissions, "dashboard:view");
  useEffect(() => {
    if (denied) router.replace("/admin/tickets");
  }, [denied, router]);
  if (denied) return null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of issued violation tickets.
          </p>
        </div>
        <Link
          href="/admin/tickets/new"
          className={cn(buttonVariants(), "h-10 gap-2 px-4")}
        >
          <FilePlus2 className="size-4" />
          Issue ticket
        </Link>
      </div>

      {/* GE-010: time-range presets + custom range */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {DASHBOARD_PRESETS.map((p) => (
            <Button
              key={p.key}
              type="button"
              size="sm"
              variant={!custom && preset === p.key ? "default" : "outline"}
              onClick={() => {
                setCustom(false);
                setPreset(p.key);
              }}
            >
              {p.label}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={custom ? "default" : "outline"}
            onClick={enableCustom}
          >
            Custom…
          </Button>
        </div>
        {custom ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <label className="flex items-center gap-1.5">
              From
              <Input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8 w-auto"
              />
            </label>
            <label className="flex items-center gap-1.5">
              To
              <Input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="h-8 w-auto"
              />
            </label>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Issued"
          value={tickets ? stats.issued : "—"}
          icon={<FilePlus2 className="size-5" />}
          accent="bg-brand/12 text-brand"
        />
        <StatCard
          label="Outstanding"
          value={tickets ? stats.outstanding : "—"}
          icon={<Clock className="size-5" />}
          accent="bg-amber-500/12 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Overdue"
          value={tickets ? stats.overdue : "—"}
          icon={<AlertTriangle className="size-5" />}
          accent="bg-red-500/12 text-red-600 dark:text-red-400"
        />
        <StatCard
          label="Collected"
          value={tickets ? formatPeso(stats.collected) : "—"}
          icon={<Coins className="size-5" />}
          accent="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent tickets</CardTitle>
          <CardAction>
            <Link
              href="/admin/tickets"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              View all
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <TicketsTable tickets={recent} />
        </CardContent>
      </Card>
    </div>
  );
}
