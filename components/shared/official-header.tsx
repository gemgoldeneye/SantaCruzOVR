import { MunicipalSeal } from "@/components/shared/municipal-seal";
import { MUNICIPALITY, OFFICES } from "@/lib/config/santa-cruz";

export function OfficialHeader() {
  return (
    <div className="flex items-center justify-center gap-4 text-center">
      <MunicipalSeal className="size-16 shrink-0" />
      <div className="space-y-0.5">
        <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          {MUNICIPALITY.country}
        </p>
        <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          Province of {MUNICIPALITY.province}
        </p>
        <p className="font-heading text-lg font-semibold leading-tight">
          {MUNICIPALITY.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {OFFICES.enforcement.name} ({OFFICES.enforcement.abbr})
        </p>
      </div>
    </div>
  );
}
