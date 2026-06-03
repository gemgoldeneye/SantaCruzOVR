import { store } from "@/lib/data";
import { IssuanceForm } from "@/components/admin/issuance-form";
import { copy } from "@/lib/i18n/en";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  const [catalog, officers] = await Promise.all([
    store.listViolationCatalog(),
    store.listOfficers(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {copy.admin.newTicketTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details — the ticket preview updates live, then confirm to
          issue it.
        </p>
      </div>
      <IssuanceForm catalog={catalog} officers={officers} />
    </div>
  );
}
