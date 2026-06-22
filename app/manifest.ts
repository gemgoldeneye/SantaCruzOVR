import type { MetadataRoute } from "next";
import { MUNICIPALITY } from "@/lib/config/santa-cruz";

/** PWA manifest — installable on an enforcer's device. Config-driven per LGU. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${MUNICIPALITY.shortName} e-OVR`,
    short_name: "e-OVR",
    description: MUNICIPALITY.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d9488",
    icons: [{ src: MUNICIPALITY.sealSrc, sizes: "any", type: "image/png" }],
  };
}
