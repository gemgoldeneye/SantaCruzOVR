import Link from "next/link";
import { MunicipalSeal } from "@/components/shared/municipal-seal";
import { ThemeToggle } from "@/components/theme-toggle";
import { MUNICIPALITY } from "@/lib/config/iba";
import { copy } from "@/lib/i18n/en";

/**
 * The single, official navy (#03045a) header used across the app: municipal seal
 * + Municipality identity + e-OVR name/meaning on the left; a context nav slot
 * (`children`) + theme toggle on the right. One bar — no stacked headers.
 */
export function SiteHeader({
  homeHref = "/",
  children,
}: {
  homeHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-gov text-gov-foreground">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href={homeHref} className="flex items-center gap-3">
          <MunicipalSeal className="size-10 shrink-0 sm:size-11" />
          <span className="leading-tight">
            <span className="block text-[0.7rem] opacity-80">
              {MUNICIPALITY.name}
            </span>
            <span className="block text-sm font-bold tracking-tight sm:text-base">
              {copy.app.name}
              <span className="hidden font-normal opacity-80 sm:inline">
                {" "}
                — {copy.app.tagline}
              </span>
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {children}
          <ThemeToggle className="text-gov-foreground hover:bg-white/10 hover:text-gov-foreground" />
        </div>
      </div>
    </header>
  );
}
