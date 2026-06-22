"use client";

import Link from "next/link";
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
import { buttonVariants } from "@/components/ui/button";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useStats, useTickets } from "@gelabs/ovr/offline";

export default function AdminDashboard() {
  // Local-first: stats + recent tickets read from the on-device store, which the
  // sync loop (in the admin layout) keeps fresh when online. Works offline.
  const stats = useStats();
  const recent = (useTickets() ?? []).slice(0, 6);

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Issued today"
          value={stats ? stats.issuedToday : "—"}
          icon={<FilePlus2 className="size-5" />}
          accent="bg-brand/12 text-brand"
        />
        <StatCard
          label="Outstanding"
          value={stats ? stats.outstanding : "—"}
          icon={<Clock className="size-5" />}
          accent="bg-amber-500/12 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Overdue"
          value={stats ? stats.overdue : "—"}
          icon={<AlertTriangle className="size-5" />}
          accent="bg-red-500/12 text-red-600 dark:text-red-400"
        />
        <StatCard
          label="Collected"
          value={stats ? formatPeso(stats.collected) : "—"}
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
