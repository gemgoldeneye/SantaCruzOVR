"use client";

/**
 * Admin app shell — client-rendered so it works offline. Auth is checked
 * client-side against the cached identity (`useAdminAuth`); the API still
 * enforces every data call server-side. `useSync` keeps the local store fresh
 * while in the admin section. Same markup as the former SSR layout — only the
 * gate + data source changed.
 */
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminAuth, useSync } from "@gelabs/ovr/offline";
import { signOutAction, changePasswordAction } from "@/app/admin/login/actions";
import { SiteHeader } from "@/components/shared/site-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { SyncStatus } from "./sync-status";

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAdminAuth();
  const syncState = useSync();

  useEffect(() => {
    if (auth.status === "unauthed") router.replace("/admin/login");
  }, [auth.status, router]);

  if (auth.status !== "authed") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30 print:bg-transparent">
      <SiteHeader homeHref="/admin">
        <SyncStatus state={syncState} />
        <AdminNav
          signOutAction={signOutAction}
          changePasswordAction={changePasswordAction}
        />
      </SiteHeader>
      <main className="flex-1">{children}</main>
    </div>
  );
}
