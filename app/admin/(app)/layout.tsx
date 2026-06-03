import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { SiteHeader } from "@/components/shared/site-header";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30 print:bg-transparent">
      <SiteHeader homeHref="/admin">
        <AdminNav />
      </SiteHeader>
      <main className="flex-1">{children}</main>
    </div>
  );
}
