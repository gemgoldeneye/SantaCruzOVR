import { Suspense } from "react";
import { TicketsBrowser } from "@gelabs/ovr/ui/components/admin/tickets-browser";

// The tickets view (status tabs + name/ticket-no./plate search + table) lives in
// the SDK, so it updates with `@gelabs/ovr` on `npm install`. The Suspense
// boundary is required for the browser's useSearchParams() so static generation
// doesn't de-opt the whole route to client-side rendering.
export default function TicketsPage() {
  return (
    <Suspense>
      <TicketsBrowser />
    </Suspense>
  );
}
