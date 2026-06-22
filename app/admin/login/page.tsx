"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, LogIn, TriangleAlert, ArrowLeft } from "lucide-react";
import { signInAction } from "./actions";
import { cacheCredential, verifyOffline, clearIdentity } from "@gelabs/ovr/offline";
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
import { MUNICIPALITY } from "@/lib/config/santa-cruz";
import { copy } from "@/lib/i18n/en";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Reaching the login screen means "not signed in" — drop any stale cached
  // identity so a signed-out device can't pass the offline gate. The offline
  // credential is kept, so offline login still works.
  useEffect(() => {
    void clearIdentity();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    try {
      const res = await signInAction(username, password);
      if (res.error) {
        setError(res.error);
        setIsPending(false);
        return;
      }
      // Cache a verifier so this account can sign in OFFLINE next time.
      if (res.identity) await cacheCredential(username, password, res.identity);
      // Full reload (not router.push) so SSR sees the new session cookie and the
      // client Router Cache starts fresh.
      window.location.assign("/admin");
    } catch {
      // No connection → try an OFFLINE login against the cached verifier.
      const identity = await verifyOffline(username, password);
      if (identity) {
        window.location.assign("/admin");
        return;
      }
      setError(
        "No internet connection — and this account hasn't signed in offline on this device yet.",
      );
      setIsPending(false);
    }
  }

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
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
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
                    required
                  />
                </div>

                {error ? (
                  <Alert variant="destructive">
                    <TriangleAlert />
                    <AlertDescription>{error}</AlertDescription>
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
