import Link from "next/link";
import { EovrMark } from "@/components/shared/eovr-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { copy } from "@/lib/i18n/en";

export function CitizenHeader() {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/citizen" className="flex items-center gap-2.5">
          <EovrMark className="shrink-0" />
          <span className="leading-tight">
            <span className="block text-sm font-bold">{copy.app.name}</span>
            <span className="block text-[0.7rem] text-muted-foreground">
              {copy.app.tagline}
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/citizen"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Home
          </Link>
          <Link
            href="/citizen/search"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            {copy.citizen.home.searchCta}
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
