import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { AdminSidebar, AdminTopBar } from "@/components/admin/admin-sidebar";
import { GovMasthead } from "@/components/shared/gov-masthead";

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
      <GovMasthead />
      <AdminTopBar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
