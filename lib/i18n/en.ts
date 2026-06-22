/**
 * Santa Cruz copy barrel. The base dictionary now lives in `@gelabs/ovr/core/i18n`; this
 * merges Santa Cruz's (empty) overrides and resolves the `{municipality}` token against
 * the Santa Cruz config, so existing `import { copy } from "@/lib/i18n/en"` call sites
 * resolve unchanged. Migrated components read copy via `useCopy()`/`getCopy()`;
 * app routes still import here.
 */
import { mergeCopy, type CopyOverrides, type Dictionary } from "@gelabs/ovr/core/i18n";
import type { MunicipalityConfig } from "@gelabs/ovr/config";
import { MUNICIPALITY } from "@/lib/config/santa-cruz";

/** Santa Cruz uses the base dictionary verbatim. */
export const copyOverrides: CopyOverrides = {};
export const copy: Dictionary = mergeCopy(
  copyOverrides,
  MUNICIPALITY as MunicipalityConfig,
);
export type Copy = Dictionary;
