import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Seal } from "@/components/shared/seal";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <Seal className="size-14" />
      <div>
        <p className="font-heading text-2xl font-semibold tracking-tight">
          Page not found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or has moved.
        </p>
      </div>
      <Link href="/" className={buttonVariants({})}>
        Go to home
      </Link>
    </div>
  );
}
