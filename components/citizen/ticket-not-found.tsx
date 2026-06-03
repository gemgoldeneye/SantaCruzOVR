import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { copy } from "@/lib/i18n/en";

export function TicketNotFound() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileQuestion className="size-6" />
          </div>
          <h1 className="font-heading text-lg font-semibold">
            {copy.citizen.notFoundTitle}
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {copy.citizen.notFoundBody}
          </p>
          <Link href="/citizen/search" className={buttonVariants({})}>
            {copy.citizen.ticket.backToSearch}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
