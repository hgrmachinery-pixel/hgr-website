import { isDeepStrictEqual } from "node:util";

type EchoHistory = {
  reviewHistory?: unknown;
  auditHistory?: unknown;
};

const STORAGE_MANAGED_FIELDS = new Set(["filename", "filesize", "width", "height", "sizes", "url"]);

/**
 * Payload's storage adapter may persist generated storage metadata in a follow-up
 * update. Only those known storage fields may differ; all photo, publication,
 * review, relationship and audit data must remain byte-for-byte equivalent.
 */
export function isUnchangedStorageMetadataEcho(
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown>,
  lockedHistory: EchoHistory,
): boolean {
  const fields = Object.keys(data);
  if (fields.length === 0) return false;

  if (fields.some((field) => {
    if (STORAGE_MANAGED_FIELDS.has(field)) return false;
    return !Object.hasOwn(originalDoc, field) || !isDeepStrictEqual(data[field], originalDoc[field]);
  })) return false;

  if (Object.hasOwn(data, "reviewHistory") && !isDeepStrictEqual(data.reviewHistory, lockedHistory.reviewHistory)) return false;
  if (Object.hasOwn(data, "auditHistory") && !isDeepStrictEqual(data.auditHistory, lockedHistory.auditHistory)) return false;
  return true;
}
