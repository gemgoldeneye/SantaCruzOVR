"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, LogIn, TriangleAlert, ArrowLeft } from "lucide-react";
import { signInAction, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Seal } from "@/components/shared/seal";
import { ThemeToggle } from "@/components/theme-toggle";
import { MUNICIPALITY, DEMO_ADMIN } from "@/lib/config/santa-cruz";
import { copy } from "@/lib/i18n/en";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    signInAction,
    {},
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Seal className="size-8" />
          <span className="text-sm font-semibold">
            {MUNICIPALITY.shortName} {copy.app.name}
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{copy.admin.portal}</CardTitle>
              <CardDescription>
                Sign in to issue and manage violation tickets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
                    defaultValue={DEMO_ADMIN.username}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    defaultValue={DEMO_ADMIN.password}
                    required
                  />
                </div>

                {state.error ? (
                  <Alert variant="destructive">
                    <TriangleAlert />
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-10 w-full gap-2"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  Sign in
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-4 rounded-lg border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            {DEMO_ADMIN.hint}
          </p>
          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
