"use client";

import * as React from "react";
import { useActionState } from "react";
import { Search, Loader2, TriangleAlert } from "lucide-react";
import { searchTicketAction, type SearchState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { copy } from "@/lib/i18n/en";

export default function SearchPage() {
  const [state, formAction, isPending] = useActionState<SearchState, FormData>(
    searchTicketAction,
    {},
  );
  const [accepted, setAccepted] = React.useState(false);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{copy.citizen.searchTitle}</CardTitle>
          <CardDescription>{copy.citizen.searchHelp}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ticketNo">{copy.citizen.ticketNoLabel}</Label>
              <Input
                id="ticketNo"
                name="ticketNo"
                placeholder="IBA-2026-000001"
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">{copy.citizen.lastNameLabel}</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Guiwo"
                autoComplete="off"
                required
              />
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3">
              <Checkbox
                id="eua"
                name="eua"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
                className="mt-0.5"
              />
              <div className="text-sm">
                <Label htmlFor="eua" className="font-medium">
                  {copy.citizen.euaLabel}
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Access only OVRs that belong to you or that you are authorized
                  to view.{" "}
                  <Dialog>
                    <DialogTrigger
                      render={
                        <button
                          type="button"
                          className="text-brand underline underline-offset-2"
                        />
                      }
                    >
                      Read the agreement
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>End-User Agreement</DialogTitle>
                        <DialogDescription>
                          By using the OVR inquiry system, you acknowledge that
                          you are expected to seek access only to those OVRs that
                          belong to you, or which the owner has granted you
                          explicit authority to access. Attempting to access OVRs
                          that you neither own nor have authority over is a misuse
                          of this system and will be handled accordingly.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter showCloseButton />
                    </DialogContent>
                  </Dialog>
                </p>
              </div>
            </div>

            {state.error ? (
              <Alert variant="destructive">
                <TriangleAlert />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="submit"
              disabled={!accepted || isPending}
              className="h-10 w-full gap-2"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {copy.citizen.searchCta}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Demo tickets — <span className="font-mono">IBA-2026-000001</span> (Guiwo),{" "}
        <span className="font-mono">IBA-2026-000002</span> (Kamaro),{" "}
        <span className="font-mono">IBA-2026-000003</span> (Delos Reyes).
      </p>
    </div>
  );
}
