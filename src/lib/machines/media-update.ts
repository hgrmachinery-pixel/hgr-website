import { isDeepStrictEqual } from "node:util";

const payloadManagedFields = new Set(["id", "createdAt", "updatedAt"]);

/** Payload merges saved fields into hook data. Return only values that actually changed. */
export function changedMachineMediaFields(data: Record<string, unknown>, originalDoc: Record<string, unknown>): string[] {
  return Object.keys(data).filter((key) =>
    !payloadManagedFields.has(key) && !isDeepStrictEqual(data[key], originalDoc[key]),
  );
}
