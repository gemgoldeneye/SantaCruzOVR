import { MunicipalSeal } from "@/components/shared/municipal-seal";
import { PstClock } from "@/components/shared/pst-clock";
import { OfficialSeals } from "@/components/shared/official-seals";
import { MUNICIPALITY } from "@/lib/config/iba";

/**
 * The official government masthead (navy #03045a band), styled after the real
 * Municipality of Iba site: seal + Republic / Municipality / Province titles on
 * the left; live PST clock + official program seals on the right; a thin brand
 * accent rule below. Hidden when printing (the receipt has its own header).
 */
export function GovMasthead() {
  return (
    <div className="no-print">
      <div className="bg-gov text-gov-foreground">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <MunicipalSeal className="size-12 shrink-0 sm:size-14" />
            <div className="leading-tight">
              <p className="text-[0.7rem] font-medium opacity-80 sm:text-xs">
                {MUNICIPALITY.country}
              </p>
              <p className="font-heading text-base font-bold tracking-wide sm:text-xl">
                {MUNICIPALITY.name.toUpperCase()}
              </p>
              <p className="text-[0.7rem] opacity-80 sm:text-xs">
                Province of {MUNICIPALITY.province}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-5 md:flex">
            <PstClock className="text-right text-xs" />
            <OfficialSeals className="flex items-center gap-2" />
          </div>
        </div>
      </div>
      <div className="h-1 bg-brand" />
    </div>
  );
}
