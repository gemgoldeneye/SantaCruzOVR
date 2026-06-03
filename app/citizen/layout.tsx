import { CitizenHeader } from "@/components/citizen/citizen-header";
import { MUNICIPALITY } from "@/lib/config/iba";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <CitizenHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto w-full max-w-5xl px-4 text-xs text-muted-foreground sm:px-6">
          <p className="font-medium text-foreground">{MUNICIPALITY.fullName}</p>
          <p className="mt-0.5">
            Demonstration system; online payments are simulated.
          </p>
        </div>
      </footer>
    </div>
  );
}
