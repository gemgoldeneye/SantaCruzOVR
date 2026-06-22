/**
 * Re-export barrel: the data-access contract now lives in the SDK package
 * `@gelabs/ovr/data`. Kept so existing `@/lib/data/store` imports resolve
 * unchanged. The concrete implementations (mock/Prisma) and the swap point still
 * live in this app until the data layer is extracted.
 */
export * from "@gelabs/ovr/data";
