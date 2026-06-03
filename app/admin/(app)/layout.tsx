import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      <AdminSidebar />
      <div className="flex min-h-dvh flex-col md:pl-60">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
