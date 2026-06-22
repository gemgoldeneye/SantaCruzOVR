/**
 * App wrapper — binds the Santa Cruz locale / currency / timeZone; the formatters and
 * config-free helpers live in `@gelabs/ovr/core`. Kept so existing `@/lib/format`
 * imports resolve unchanged.
 */
import { RULES } from "@/lib/config/santa-cruz";
import { createFormatters } from "@gelabs/ovr/core";

export {
  fullName,
  formalName,
  formatAddress,
  addDays,
  localToManilaISO,
} from "@gelabs/ovr/core";

const formatters = createFormatters(RULES);

export const formatPeso = formatters.formatPeso;
export const formatDate = formatters.formatDate;
export const formatDateTime = formatters.formatDateTime;
export const nowManilaLocalInput = formatters.nowManilaLocalInput;
