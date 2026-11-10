import { isDeepStrictEqual } from "node:util";

type EchoHistory = {
  reviewHistory?: unknown;
  auditHistory?: unknown;
};

/**
 * Payload's Cloud Storage plugin persists adapter results with a nested update.
 * The S3 and GCS adapters return the submitted document unchanged, so accept
 * that update only when it is an exact echo of the current document.
 */
export function isUnchangedStorageMetadataEcho(
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown>,
  lockedHistory: EchoHistory,
): boolean {
  const fields = Object.keys(data);
  if (fields.length === 0) return false;

  if (fields.some((field) =>
    !Object.hasOwn(originalDoc, field) || !isDeepStrictEqual(data[field], originalDoc[field])
  )) return false;

  if (Object.hasOwn(data, "reviewHistory") && !isDeepStrictEqual(data.reviewHistory, lockedHistory.reviewHistory)) return false;
  if (Object.hasOwn(data, "auditHistory") && !isDeepStrictEqual(data.auditHistory, lockedHistory.auditHistory)) return false;

  return true;
}
