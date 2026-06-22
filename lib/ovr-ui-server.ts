import "server-only";
import { setServerContext } from "@gelabs/ovr/ui/server";
import type { OvrConfig } from "@gelabs/ovr/config";
import { santaCruzConfig } from "@/lib/config/santa-cruz";
import { copyOverrides } from "@/lib/i18n/en";

// Initialize the OVR server context at module load — BEFORE any route render or
// child generateMetadata reads getConfig()/getCopy()/getFormatters(). Importing
// this module for its side effect (in the root layout) is the single init point.
setServerContext({ config: santaCruzConfig as OvrConfig, copyOverrides });
