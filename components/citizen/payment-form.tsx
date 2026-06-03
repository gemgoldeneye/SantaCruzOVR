"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Loader2,
  Wallet,
  Smartphone,
  Landmark,
  Building2,
  Lock,
  Check,
  TriangleAlert,
} from "lucide-react";
import { payTicketAction } from "@/app/citizen/ticket/[ovrTicketNo]/pay/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Money } from "@/components/shared/money";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/config/iba";
import { copy } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  GCASH: <Wallet className="size-5" />,
  MAYA: <Smartphone className="size-5" />,
  LANDBANK: <Landmark className="size-5" />,
  OVER_THE_COUNTER: <Building2 className="size-5" />,
};

export function PaymentForm({
  ovrTicketNo,
  lastName,
  violatorName,
  basicFines,
  penalty,
  amount,
}: {
  ovrTicketNo: string;
  lastName: string;
  violatorName: string;
  basicFines: number;
  penalty: number;
  amount: number;
}) {
  const [method, setMethod] = React.useState<PaymentMethodId>("GCASH");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function pay() {
    setError(null);
    startTransition(async () => {
      const res = await payTicketAction({ ovrTicketNo, lastName, method });
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      }
      // success → action redirects to the receipt
    });
  }

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle className="text-xl">{copy.citizen.pay.title}</CardTitle>
        <CardDescription>
          {violatorName} · <span className="font-mono">{ovrTicketNo}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Amount breakdown */}
        <div className="space-y-2 rounded-lg border bg-muted/20 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Basic fines</span>
            <Money value={basicFines} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Penalty / surcharge</span>
            <Money
              value={penalty}
              className={cn(penalty === 0 && "text-muted-foreground")}
            />
          </div>
          <Separator />
          <div className="flex items-baseline justify-between">
            <span className="font-medium">Total to pay</span>
            <Money value={amount} className="text-xl font-bold" />
          </div>
        </div>

        {/* Method tiles */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{copy.citizen.pay.choose}</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "hover:bg-muted/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {ICONS[m.id]}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {m.label}
                    </span>
                  </span>
                  {active ? (
                    <Check className="ml-auto size-4 shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          onClick={pay}
          disabled={isPending}
          className="h-11 w-full gap-2 text-base"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {copy.citizen.pay.processing}
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {copy.citizen.pay.payNow} {/* amount shown next */}
              <Money value={amount} className="font-semibold" />
            </>
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="size-3" />
          {copy.citizen.pay.secure}
        </p>
      </CardContent>
    </Card>
  );
}
