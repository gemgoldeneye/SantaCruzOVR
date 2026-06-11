import Link from "next/link";
import {
  Search,
  ShieldCheck,
  ArrowRight,
  Receipt,
  CreditCard,
  FileCheck2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/shared/site-header";
import { cn } from "@/lib/utils";
import { MUNICIPALITY } from "@/lib/config/santa-cruz";
import { copy } from "@/lib/i18n/en";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      {/* Hero */}
      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 h-[28rem] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklch,var(--brand)_14%,transparent),transparent_70%)]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {MUNICIPALITY.country} · {copy.app.tagline}
            </p>
            <h1 className="text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              {copy.landing.heroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              {copy.landing.heroSubtitle}
            </p>
          </div>

          {/* Portal cards */}
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <PortalCard
              href="/citizen/search"
              icon={<Search className="size-6" />}
              accent="brand"
              title={copy.landing.citizenCardTitle}
              body={copy.landing.citizenCardBody}
              cta={copy.landing.citizenCardCta}
            />
            <PortalCard
              href="/admin"
              icon={<ShieldCheck className="size-6" />}
              accent="primary"
              title={copy.landing.adminCardTitle}
              body={copy.landing.adminCardBody}
              cta={copy.landing.adminCardCta}
            />
          </div>

          {/* Trust strip */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            <Feature
              icon={<Receipt className="size-5" />}
              title="Official receipt"
              body="Every ticket produces a printable Order of Payment."
            />
            <Feature
              icon={<CreditCard className="size-5" />}
              title="Pay online"
              body="GCash, Maya, or Landbank — settle fines in minutes."
            />
            <Feature
              icon={<FileCheck2 className="size-5" />}
              title="Backtrack anytime"
              body="Look up and review any issued violation record."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <p className="font-medium text-foreground">{MUNICIPALITY.fullName}</p>
          <p className="mt-1">
            {copy.app.name} — {copy.app.tagline}. Demonstration system; online
            payments are simulated.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PortalCard({
  href,
  icon,
  title,
  body,
  cta,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  accent: "brand" | "primary";
}) {
  const accentRing =
    accent === "brand"
      ? "hover:ring-brand/40 focus-visible:ring-brand/50"
      : "hover:ring-primary/40 focus-visible:ring-primary/50";
  const iconWrap =
    accent === "brand" ? "bg-brand/12 text-brand" : "bg-primary/12 text-primary";
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-xl outline-none transition-all hover:-translate-y-0.5 focus-visible:ring-3",
        accentRing,
      )}
    >
      <Card className="h-full transition-shadow group-hover:shadow-lg">
        <CardHeader>
          <div
            className={cn(
              "mb-2 flex size-12 items-center justify-center rounded-xl",
              iconWrap,
            )}
          >
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-pretty">{body}</CardDescription>
        </CardHeader>
        <CardContent>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium",
              accent === "brand" ? "text-brand" : "text-primary",
            )}
          >
            {cta}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
