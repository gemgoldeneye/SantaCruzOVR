"use client";

import { use } from "react";
import Link from "next/link";
import { FilePlus2, Search } from "lucide-react";
import { TicketsTable } from "@/components/admin/tickets-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fullName } from "@/lib/format";
import type { TicketStatus } from "@/lib/types";
import { useTickets } from "@gelabs/ovr/offline";

const TABS: { label: string; value: TicketStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Outstanding", value: "OUTSTANDING" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Paid", value: "PAID" },
];

const norm = (s: string) => s.trim().toLowerCase();

export default function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; query?: string }>;
}) {
  const sp = use(searchParams);
  const status = (sp.status as TicketStatus | "ALL") ?? "ALL";
  const query = sp.query ?? "";

  // Same filter as the server's listTickets(): status on the live-derived status,
  // query over name / ticket no. / plate — done in memory over the local store.
  let tickets = useTickets() ?? [];
  if (status !== "ALL") tickets = tickets.filter((t) => t.status === status);
  if (query) {
    const q = norm(query);
    tickets = tickets.filter(
      (t) =>
        norm(fullName(t.violator)).includes(q) ||
        norm(t.ovrTicketNo).includes(q) ||
        norm(t.violator.plateNumber ?? "").includes(q),
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Tickets
          </h1>
          <p className="text-sm text-muted-foreground">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
            {status !== "ALL" ? ` · ${status.toLowerCase()}` : ""}
            {query ? ` · matching “${query}”` : ""}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
          {TABS.map((tab) => {
            const active = status === tab.value;
            const href = `/admin/tickets?status=${tab.value}${
              query ? `&query=${encodeURIComponent(query)}` : ""
            }`;
            return (
              <Link
                key={tab.value}
                href={href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <form action="/admin/tickets" method="get" className="flex gap-2">
          <input type="hidden" name="status" value={status} />
          <Input
            name="query"
            defaultValue={query}
            placeholder="Search name, ticket no., plate"
            className="h-9 w-56"
          />
          <Button type="submit" variant="outline" className="h-9 gap-1.5">
            <Search className="size-4" />
            Search
          </Button>
        </form>
      </div>

      <Card>
        <CardContent className="px-0">
          <TicketsTable tickets={tickets} />
        </CardContent>
      </Card>
    </div>
  );
}
