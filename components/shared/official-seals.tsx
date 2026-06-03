import { ShieldCheck, FileSearch, Star } from "lucide-react";
import { AssetBadge } from "@/components/shared/asset-badge";
import { OFFICIAL_SEALS } from "@/lib/config/iba";

const FALLBACK_ICON: Record<string, React.ReactNode> = {
  foi: <FileSearch className="size-4" />,
  transparency: <ShieldCheck className="size-4" />,
  "bagong-pilipinas": <Star className="size-4" />,
};

export function OfficialSeals({ className }: { className?: string }) {
  return (
    <div className={className}>
      {OFFICIAL_SEALS.map((s) => (
        <AssetBadge
          key={s.id}
          src={s.src}
          label={s.label}
          className="bg-white/10 text-white/85 ring-1 ring-white/20"
          fallback={FALLBACK_ICON[s.id]}
        />
      ))}
    </div>
  );
}
