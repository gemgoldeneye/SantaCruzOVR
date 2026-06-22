/**
 * App wrapper — binds the Santa Cruz rules; the preview builder lives in
 * `@gelabs/ovr/core`. Kept so existing `@/lib/preview` imports resolve unchanged.
 */
import { RULES } from "@/lib/config/santa-cruz";
import { toPreviewTicket as toPreviewTicketCore, type IssuanceDraft } from "@gelabs/ovr/core";
import type { Ticket } from "@/lib/types";

export { PREVIEW_PLACEHOLDER } from "@gelabs/ovr/core";
export type { IssuanceDraft } from "@gelabs/ovr/core";

export function toPreviewTicket(draft: IssuanceDraft, now: Date): Ticket {
  return toPreviewTicketCore(draft, now, RULES);
}
