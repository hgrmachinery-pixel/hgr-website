import { isDeepStrictEqual } from "node:util";

const payloadManagedFields = new Set(["id", "createdAt", "updatedAt"]);
const imageSizes = ["thumbnail", "card", "large"] as const;
const safeFilename = /^[A-Za-z0-9._-]+$/;

/**
 * Payload's REST update path may compare the raw stored file URL with its
 * afterRead form (same-origin absolute URL plus the collection prefix query).
 * Treat only those two representations of the exact same stored file as equal.
 */
function comparableMachineMediaURL(value: unknown, filename: unknown, serverURL: string | undefined, allowStoredCollectionPrefix: boolean): string | undefined {
  if (typeof value !== "string" || typeof filename !== "string" || !safeFilename.test(filename)) return undefined;
  let parsed: URL;
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)) {
    if (!serverURL) return undefined;
    try {
      const origin = new URL(serverURL);
      if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) return undefined;
      parsed = new URL(value);
      if (parsed.origin !== origin.origin || parsed.username || parsed.password) return undefined;
    } catch {
      return undefined;
    }
  } else {
    try {
      parsed = new URL(value, "https://relative-machine-media.invalid");
      if (parsed.origin !== "https://relative-machine-media.invalid") return undefined;
    } catch {
      return undefined;
    }
  }

  if (parsed.pathname !== `/api/machine-media/file/${filename}` || parsed.hash) return undefined;
  const parameters = [...parsed.searchParams.entries()];
  if (parameters.length > 0 && (!allowStoredCollectionPrefix || parameters.length !== 1 || parameters[0][0] !== "prefix" || parameters[0][1] !== "machine-media")) return undefined;
  return parsed.pathname;
}

function normalizePayloadFileURLRepresentations(
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown>,
  serverURL?: string,
): [Record<string, unknown>, Record<string, unknown>] {
  const next = { ...data };
  const previous = { ...originalDoc };
  const allowStoredCollectionPrefix = next.prefix === "machine-media" && previous.prefix === "machine-media";
  const normalizePair = (nextRecord: Record<string, unknown>, previousRecord: Record<string, unknown>) => {
    if (nextRecord.filename !== previousRecord.filename) return;
    const nextURL = comparableMachineMediaURL(nextRecord.url, nextRecord.filename, serverURL, allowStoredCollectionPrefix);
    const previousURL = comparableMachineMediaURL(previousRecord.url, previousRecord.filename, serverURL, allowStoredCollectionPrefix);
    if (nextURL && previousURL) {
      nextRecord.url = nextURL;
      previousRecord.url = previousURL;
    }
  };

  normalizePair(next, previous);
  const nextSizes = next.sizes && typeof next.sizes === "object" && !Array.isArray(next.sizes) ? { ...next.sizes as Record<string, unknown> } : undefined;
  const previousSizes = previous.sizes && typeof previous.sizes === "object" && !Array.isArray(previous.sizes) ? { ...previous.sizes as Record<string, unknown> } : undefined;
  if (nextSizes && previousSizes) {
    for (const size of imageSizes) {
      const nextFile = nextSizes[size];
      const previousFile = previousSizes[size];
      if (!nextFile || typeof nextFile !== "object" || Array.isArray(nextFile) || !previousFile || typeof previousFile !== "object" || Array.isArray(previousFile)) continue;
      const nextFileRecord = { ...nextFile as Record<string, unknown> };
      const previousFileRecord = { ...previousFile as Record<string, unknown> };
      normalizePair(nextFileRecord, previousFileRecord);
      nextSizes[size] = nextFileRecord;
      previousSizes[size] = previousFileRecord;
    }
    next.sizes = nextSizes;
    previous.sizes = previousSizes;
  }
  return [next, previous];
}

/** Payload merges saved fields into hook data. Return only values that actually changed. */
export function changedMachineMediaFields(data: Record<string, unknown>, originalDoc: Record<string, unknown>, serverURL = process.env.SERVER_URL): string[] {
  const [comparableData, comparableOriginal] = normalizePayloadFileURLRepresentations(data, originalDoc, serverURL);
  return Object.keys(comparableData).filter((key) =>
    !payloadManagedFields.has(key) && !isDeepStrictEqual(comparableData[key], comparableOriginal[key]),
  );
}
