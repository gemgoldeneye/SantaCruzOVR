"use client";

/**
 * Notifications page (GE-023) — the full list behind the bell. Client-rendered
 * (offline-first, derived from local tickets), so the permission gate runs
 * client-side: requires `notifications:view`, else redirect to Tickets.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@gelabs/ovr/offline";
import { hasPermission } from "@gelabs/ovr/types";
import { NotificationsList } from "@/components/admin/notifications-list";

export default function NotificationsPage() {
  const identity = useIdentity();
  const router = useRouter();
  const denied =
    !!identity && !hasPermission(identity.permissions, "notifications:view");
  useEffect(() => {
    if (denied) router.replace("/admin/tickets");
  }, [denied, router]);
  if (denied) return null;

  return <NotificationsList />;
}
