import Link from "next/link";
import { Search, FileSearch, ReceiptText, CreditCard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { copy } from "@/lib/i18n/en";

export default function CitizenHome() {
  const steps = [
    {
      icon: <FileSearch className="size-5" />,
      title: copy.citizen.home.step1Title,
      body: copy.citizen.home.step1Body,
    },
    {
      icon: <ReceiptText className="size-5" />,
      title: copy.citizen.home.step2Title,
      body: copy.citizen.home.step2Body,
    },
    {
      icon: <CreditCard className="size-5" />,
      title: copy.citizen.home.step3Title,
      body: copy.citizen.home.step3Body,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {copy.citizen.home.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          {copy.citizen.home.subtitle}
        </p>
        <Link
          href="/citizen/search"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-7 h-11 gap-2 px-6 text-base",
          )}
        >
          <Search className="size-5" />
          {copy.citizen.home.searchCta}
        </Link>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <Card key={i} className="h-full">
            <CardContent className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand/12 text-brand">
                {s.icon}
              </div>
              <p className="flex items-center gap-2 font-medium">
                <span className="text-xs text-muted-foreground">
                  Step {i + 1}
                </span>
              </p>
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
