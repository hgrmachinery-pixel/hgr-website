import { isStaffUser } from "./access.ts";

export const MACHINE_PHOTO_CATEGORIES = [
  "general-exterior",
  "side-view-1",
  "side-view-2",
  "front-view",
  "rear-view",
  "cabin-interior",
  "hour-meter",
  "chassis-serial-number",
  "engine",
  "undercarriage-tracks",
  "boom-arm-bucket",
  "other-details",
] as const;

export const MACHINE_PHOTO_CATEGORY_LABELS: Record<MachinePhotoCategory, string> = {
  "general-exterior": "General / Exterior",
  "side-view-1": "Side View 1",
  "side-view-2": "Side View 2",
  "front-view": "Front View",
  "rear-view": "Rear View",
  "cabin-interior": "Cabin / Interior",
  "hour-meter": "Hour Meter",
  "chassis-serial-number": "Chassis / Serial Number",
  engine: "Engine",
  "undercarriage-tracks": "Undercarriage / Tracks",
  "boom-arm-bucket": "Boom / Arm / Bucket",
  "other-details": "Other / Details",
};

export type MachinePhotoCategory = (typeof MACHINE_PHOTO_CATEGORIES)[number];
export const PHOTO_REVIEW_CHECKLIST = [
  "manufacturerSerialNumbers",
  "chassisVinNumbers",
  "engineNumbers",
  "registrationNumbers",
  "qrCodes",
  "barcodes",
  "customerLabels",
  "deliveryInformation",
  "personalInformation",
  "otherSensitiveIdentifiers",
] as const;

export type PhotoReviewChecklist = Record<(typeof PHOTO_REVIEW_CHECKLIST)[number], "clear" | "found" | "uncertain">;

const extensionByMimeType: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function generatedMachineImageName(mimeType: string, identity = crypto.randomUUID()): string {
  const extension = extensionByMimeType[mimeType];
  if (!extension) throw new Error("Unsupported machine image format");
  return `machine-image-${identity}.${extension}`;
}

export function generatedMachinePhotoFilename(
  machineReference: string,
  category: MachinePhotoCategory,
  sequence: number,
  mimeType: string,
): string {
  const extension = extensionByMimeType[mimeType];
  if (!extension) throw new Error("Unsupported machine image format");
  if (!MACHINE_PHOTO_CATEGORIES.includes(category)) throw new Error("Invalid machine photo category");
  if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error("A positive photo sequence is required");
  if (!/^HGR-[0-9]{6,}$/i.test(machineReference)) throw new Error("A valid HGR machine reference is required");
  return `${machineReference.toLowerCase()}-${category}-${String(sequence).padStart(6, "0")}.${extension}`;
}

export function initialPhotoReview(revision = 1, serialPolicyRevision = 1) {
  return { status: "needs-review" as const, revision, serialPolicyRevision };
}

export function serialVisibilityPolicyChanged(
  previousMachine: { showSerialPublicly?: unknown },
  currentMachine: { showSerialPublicly?: unknown },
): boolean {
  return previousMachine.showSerialPublicly !== currentMachine.showSerialPublicly;
}

function stableJSON(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJSON).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJSON(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export function historyIsAppendOnly(previous: unknown, next: unknown, appended = 1): boolean {
  if (!Array.isArray(previous) || !Array.isArray(next) || !Number.isSafeInteger(appended) || appended < 0 || next.length !== previous.length + appended) return false;
  return previous.every((entry, index) => stableJSON(entry) === stableJSON(next[index]));
}

export function isPhotoReviewComplete(checklist: unknown): checklist is PhotoReviewChecklist {
  if (!checklist || typeof checklist !== "object") return false;
  const answers = checklist as Record<string, unknown>;
  return PHOTO_REVIEW_CHECKLIST.every((key) => answers[key] === "clear");
}

export function isPublicMediaDeliveryVerified(value = process.env.HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED): boolean {
  return value === "true";
}

function relationshipId(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value || typeof value !== "object") return undefined;
  const relation = value as { id?: unknown; value?: unknown };
  const id = relation.id ?? relation.value;
  return typeof id === "string" || typeof id === "number" ? String(id) : undefined;
}

function relationshipIncludes(value: unknown, wantedId: string): boolean {
  if (Array.isArray(value)) return value.some((item) => relationshipId(item) === wantedId);
  return relationshipId(value) === wantedId;
}

export function isPublicMachineDerivative(derivative: Record<string, any>, machine: Record<string, any>): boolean {
  const derivativeId = relationshipId(derivative.id);
  const revision = Number(derivative.revision);
  const review = derivative.review && typeof derivative.review === "object" ? derivative.review : {};
  return Boolean(
    derivativeId &&
      derivative.assetKind === "derivative" &&
      relationshipId(derivative.machine) === relationshipId(machine.id) &&
      machine._status === "published" &&
      machine.archived !== true &&
      derivative.processingStatus === "ready" &&
      Number(machine.currentPhotoRevisions?.[String(derivative.photoIdentity)]) === revision &&
      Number.isSafeInteger(revision) &&
      revision > 0 &&
      review.status === "approved" &&
      Number(review.revision) === revision &&
      Number(review.serialPolicyRevision) === Number(machine.serialVisibilityRevision ?? 1) &&
      typeof derivative.contentDigest === "string" &&
      derivative.contentDigest.length > 0 &&
      review.digest === derivative.contentDigest &&
      Boolean(review.reviewedBy) &&
      typeof review.reviewedAt === "string" &&
      Number.isFinite(Date.parse(review.reviewedAt)) &&
      isPhotoReviewComplete(review.checklist) &&
      (relationshipId(machine.featuredImage) === derivativeId || relationshipIncludes(machine.gallery, derivativeId)),
  );
}

/** Resolve static-file access to exactly one current derivative. Fail closed on ambiguity. */
export async function publicMachineMediaAccess({ data, id, req }: {
  data?: { filename?: unknown } | null;
  id?: string | number;
  req: { user?: unknown; payload: any };
}): Promise<true | { id: { equals: string | number } } | false> {
  if (isStaffUser(req.user)) return true;
  if (!isPublicMediaDeliveryVerified()) return false;
  if (id !== undefined) {
    const derivative = await req.payload.findByID({ collection: "machine-media", id, depth: 0, overrideAccess: true });
    if (!derivative || derivative.assetKind !== "derivative") return false;
    const machineId = relationshipId(derivative.machine);
    if (!machineId) return false;
    const machine = await req.payload.findByID({ collection: "machines", id: machineId, depth: 0, overrideAccess: true });
    return isPublicMachineDerivative(derivative, machine) ? { id: { equals: derivative.id } } : false;
  }
  const filename = data && typeof data.filename === "string" ? data.filename : "";
  if (!filename || filename.includes("/") || filename.includes("\\")) return false;
  const matches = await req.payload.find({
    collection: "machine-media",
    where: { filename: { equals: filename }, assetKind: { equals: "derivative" } },
    depth: 0,
    limit: 2,
    overrideAccess: true,
    req,
  });
  if (!Array.isArray(matches.docs) || matches.docs.length !== 1) return false;
  const derivative = matches.docs[0];
  if (!derivative || typeof derivative.machine !== "number" && typeof derivative.machine !== "string") return false;
  const machine = await req.payload.findByID({
    collection: "machines",
    id: derivative.machine,
    depth: 0,
    overrideAccess: true,
    req,
  });
  return isPublicMachineDerivative(derivative, machine)
    ? { id: { equals: derivative.id } }
    : false;
}

export function configuredImageLimits(environment: Record<string, string | undefined> = process.env) {
  const parseLimit = (key: string) => {
    const value = environment[key]?.trim() ?? "";
    if (!value) return null;
    if (!/^[1-9][0-9]*$/.test(value)) throw new Error(`${key} must be a positive whole number of bytes`);
    const number = Number(value);
    if (!Number.isSafeInteger(number)) throw new Error(`${key} is outside the supported range`);
    return number;
  };
  return {
    perFileBytes: parseLimit("HGR_MACHINE_PHOTO_MAX_FILE_BYTES"),
    batchBytes: parseLimit("HGR_MACHINE_PHOTO_MAX_BATCH_BYTES"),
  };
}

export function validateImageUpload(size: number, currentBatchBytes = 0, environment: Record<string, string | undefined> = process.env) {
  const limits = configuredImageLimits(environment);
  if (!Number.isSafeInteger(size) || size < 1 || !Number.isSafeInteger(currentBatchBytes) || currentBatchBytes < 0) {
    return "Invalid image size";
  }
  if (limits.perFileBytes === null || limits.batchBytes === null) return "Photo upload limits are not configured";
  if (size > limits.perFileBytes) return "This image exceeds the per-file upload limit";
  if (size + currentBatchBytes > limits.batchBytes) return "This batch exceeds the total upload limit";
  return undefined;
}

export function planImageBatch<T extends { size: number }>(files: T[], maxConcurrency: number, environment: Record<string, string | undefined> = process.env) {
  const limits = configuredImageLimits(environment);
  if (!Number.isSafeInteger(maxConcurrency) || maxConcurrency < 1 || limits.perFileBytes === null || limits.batchBytes === null) {
    throw new Error("Valid concurrency and configured photo upload limits are required");
  }
  let bytes = 0;
  for (const file of files) {
    const error = validateImageUpload(file.size, bytes, environment);
    if (error) throw new Error(error);
    bytes += file.size;
  }
  return { files, maxConcurrency, totalBytes: bytes };
}

export function measuredUploadProgress(loaded: number, total: number, lengthComputable: boolean): number | undefined {
  if (!lengthComputable || !Number.isFinite(loaded) || !Number.isFinite(total) || total <= 0) return undefined;
  return Math.max(0, Math.min(99, Math.floor(loaded / total * 100)));
}

/** Show bounded Payload validation messages to staff, but never surface 5xx internals. */
export function machinePhotoUploadFailure(status: number, responseText: string): string {
  const fallback = `Master photo upload failed (HTTP ${status}).`;
  if (status >= 500) return `${fallback} Check sanitized server logs before retrying.`;
  if (status < 400 || status >= 500) return fallback;

  try {
    const body = JSON.parse(responseText) as { errors?: unknown; message?: unknown };
    const nested = Array.isArray(body.errors)
      ? body.errors.map((entry) => entry && typeof entry === "object" ? (entry as { message?: unknown }).message : undefined)
      : [];
    const candidate = [...nested, body.message].find((value): value is string => typeof value === "string" && value.trim().length > 0);
    if (candidate) return `${fallback} ${candidate.trim().slice(0, 240)}`;
  } catch {
    // A proxy or framework may return a non-JSON error page; do not surface its body.
  }
  return fallback;
}

/** Map Sharp's container/codec metadata to the browser MIME type we accepted. */
export function machinePhotoMimeType(metadata: { format?: string; compression?: string }): string | undefined {
  if (metadata.format === "heif") return metadata.compression === "av1" ? "image/avif" : undefined;
  if (metadata.format === "jpeg") return "image/jpeg";
  if (metadata.format === "png" || metadata.format === "webp") return `image/${metadata.format}`;
  return undefined;
}

export async function runBounded<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>): Promise<void> {
  if (!Number.isSafeInteger(concurrency) || concurrency < 1) throw new Error("Concurrency must be a positive whole number");
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) await worker(items[index++]);
  }));
}

export type NormalizedRedaction = { left: number; top: number; width: number; height: number };

export type ImageDimensions = {
  width: number;
  height: number;
  autoOrient?: { width: number; height: number };
};

/** Convert displayed-image coordinates using EXIF-oriented dimensions when available. */
export function redactionPixelBounds(box: NormalizedRedaction, dimensions: ImageDimensions) {
  const width = dimensions.autoOrient?.width ?? dimensions.width;
  const height = dimensions.autoOrient?.height ?? dimensions.height;
  if (!Number.isSafeInteger(width) || width < 1 || !Number.isSafeInteger(height) || height < 1) {
    throw new Error("Image dimensions are invalid");
  }
  const left = Math.floor(box.left * width);
  const top = Math.floor(box.top * height);
  const regionWidth = Math.max(1, Math.min(width - left, Math.ceil(box.width * width)));
  const regionHeight = Math.max(1, Math.min(height - top, Math.ceil(box.height * height)));
  return { left, top, width: regionWidth, height: regionHeight };
}

export function validateRedactions(value: unknown): NormalizedRedaction[] | undefined {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) return undefined;
  const result: NormalizedRedaction[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return undefined;
    const box = item as Record<string, unknown>;
    const { left, top, width, height } = box;
    if (![left, top, width, height].every((part) => typeof part === "number" && Number.isFinite(part))) return undefined;
    if ((left as number) < 0 || (top as number) < 0 || (width as number) <= 0 || (height as number) <= 0 ||
      (left as number) + (width as number) > 1 || (top as number) + (height as number) > 1) return undefined;
    result.push({ left: left as number, top: top as number, width: width as number, height: height as number });
  }
  return result;
}

