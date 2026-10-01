import { createHash } from "node:crypto";
import { createLocalReq, type Payload } from "payload";

import { isStaffUser } from "./access.ts";
import { generatedMachinePhotoFilename, isPhotoReviewComplete, validateRedactions } from "./media.ts";
import { blurSensitiveAreas, applyWatermark, createResponsiveMachineImage, DEFAULT_WATERMARK_OPTIONS, photoContentDigest } from "./media-image.ts";

const allowedFormats = new Set(["jpeg", "png", "webp", "avif"]);
const processingLocks = new Set<string>();

function relationId(value: unknown): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object") {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return undefined;
}

export type MachinePhotoProcessResult =
  | { status: 200; derivativeId: string | number; filename: string; digest: string; idempotent: boolean }
  | { status: 400 | 401 | 403 | 404 | 409 | 413 | 415 | 422; error: string };

export async function processMachinePhoto({
  request,
  payload,
}: {
  request: Request;
  payload: Payload;
}): Promise<MachinePhotoProcessResult> {
  const serverURL = process.env.SERVER_URL;
  if (!serverURL) return { status: 403, error: "Photo processing is unavailable" };
  let expectedOrigin: string;
  try {
    expectedOrigin = new URL(serverURL).origin;
  } catch {
    return { status: 403, error: "Photo processing is unavailable" };
  }
  if (request.headers.get("origin") !== expectedOrigin || request.headers.get("sec-fetch-site") !== "same-origin") {
    return { status: 403, error: "Same-origin photo processing is required" };
  }
  const auth = await payload.auth({ headers: request.headers });
  if (!isStaffUser(auth.user)) return { status: 401, error: "Staff sign-in is required" };

  const masterIdValue = request.headers.get("x-hgr-machine-photo-master");
  if (!masterIdValue || !/^[0-9]{1,16}$/.test(masterIdValue) || !Number.isSafeInteger(Number(masterIdValue))) return { status: 400, error: "A valid master photo ID is required" };
  const masterId = Number(masterIdValue);
  const size = Number(request.headers.get("content-length"));
  const maxFileBytes = process.env.HGR_MACHINE_PHOTO_MAX_FILE_BYTES?.trim();
  if (!/^[1-9][0-9]*$/.test(maxFileBytes ?? "") || !Number.isSafeInteger(Number(maxFileBytes))) {
    return { status: 413, error: "Photo upload limits are not configured" };
  }
  if (!Number.isSafeInteger(size) || size < 1 || size > Number(maxFileBytes)) {
    return { status: 413, error: "Photo exceeds the configured processing limit" };
  }
  const mimeType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (!mimeType || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(mimeType)) {
    return { status: 415, error: "Only JPEG, PNG, WebP and AVIF photos are supported" };
  }

  const lockKey = `${auth.user.id}:${masterId}`;
  if (processingLocks.has(lockKey)) return { status: 409, error: "This photo is already being processed" };
  processingLocks.add(lockKey);
  try {
    const master = await payload.findByID({ collection: "machine-media", id: masterId, depth: 0, overrideAccess: false, user: auth.user });
    if (master.assetKind !== "master") return { status: 404, error: "The private photo master was not found" };
    const bytes = Buffer.from(await request.arrayBuffer());
    if (bytes.length !== size) return { status: 400, error: "Photo byte count did not match the request" };
    if (master.assetKind !== "master" || typeof master.contentDigest !== "string" || photoContentDigest(bytes) !== master.contentDigest) {
      return { status: 422, error: "The uploaded bytes do not match this private master" };
    }
    const category = master.category;
    if (typeof category !== "string" || typeof master.photoIdentity !== "string" || !Number.isSafeInteger(master.photoSequence)) {
      return { status: 422, error: "The master photo is missing its stable identity" };
    }
    const metadata = await import("sharp").then(({ default: sharp }) => sharp(bytes, { failOn: "error", limitInputPixels: 100_000_000 }).metadata());
    if (!metadata.format || !allowedFormats.has(metadata.format) || `image/${metadata.format === "jpeg" ? "jpeg" : metadata.format}` !== mimeType) {
      return { status: 415, error: "Photo contents do not match the supported image format" };
    }
    const redactionsHeader = request.headers.get("x-hgr-redactions");
    let redactions: NonNullable<ReturnType<typeof validateRedactions>> = [];
    if (redactionsHeader) {
      if (redactionsHeader.length > 4096) return { status: 400, error: "Redaction instructions are too large" };
      let parsed: ReturnType<typeof validateRedactions>;
      try { parsed = validateRedactions(JSON.parse(redactionsHeader)); } catch { parsed = undefined; }
      if (!parsed) return { status: 400, error: "One or more blur regions are invalid" };
      redactions = parsed;
    }
    const existing = await payload.find({
      collection: "machine-media",
      where: { sourceMaster: { equals: masterId } },
      depth: 0,
      limit: 100,
      overrideAccess: true,
      sort: "-revision",
    });
    const latest = existing.docs[0];
    const redactionDigest = redactions.length ? photoContentDigest(Buffer.from(JSON.stringify(redactions))) : undefined;
    if (latest && (!redactions.length || latest.redactionDigest === redactionDigest)) {
      if (latest.sourceDigest !== photoContentDigest(bytes)) return { status: 409, error: "A different derivative already exists for this photo revision" };
      const existingMachineId = relationId(master.machine);
      if (existingMachineId === undefined) return { status: 422, error: "The master photo has no machine relationship" };
      const machine = await payload.findByID({ collection: "machines", id: Number(existingMachineId), depth: 0, overrideAccess: true });
      const current = machine.currentPhotoRevisions && typeof machine.currentPhotoRevisions === "object" ? machine.currentPhotoRevisions as Record<string, number> : {};
      if (Number(current[master.photoIdentity]) !== latest.revision) {
        const machineReq = await createLocalReq({ user: auth.user, context: { machinePhotoProcessing: true } }, payload);
        await payload.update({ collection: "machines", id: machine.id, data: { currentPhotoRevisions: { ...current, [master.photoIdentity]: latest.revision } }, overrideAccess: true, req: machineReq });
      }
      return { status: 200, derivativeId: latest.id, filename: latest.filename ?? "", digest: latest.contentDigest, idempotent: true };
    }

    const revision = Number(latest?.revision ?? 0) + 1;
    const transformed = redactions.length ? await blurSensitiveAreas(bytes, redactions) : await createResponsiveMachineImage(bytes);
    const processed = await applyWatermark(transformed, DEFAULT_WATERMARK_OPTIONS);
    const derivativeDigest = createHash("sha256").update(processed).digest("hex");
    if (!master.machineReference || !Number.isSafeInteger(master.photoSequence)) return { status: 422, error: "The master photo has no stable naming identity" };
    const baseName = generatedMachinePhotoFilename(master.machineReference, category, master.photoSequence, "image/webp");
    const derivativeFile = {
      data: processed,
      mimetype: "image/webp",
      name: baseName.replace(/\.webp$/i, `-public-r${revision}.webp`),
      size: processed.length,
    };
    const machineId = relationId(master.machine);
    if (machineId === undefined) return { status: 422, error: "The master photo has no machine relationship" };
    const machine = await payload.findByID({ collection: "machines", id: Number(machineId), depth: 0, overrideAccess: true });
    const localReq = await createLocalReq({ user: auth.user, context: { machinePhotoProcessing: true } }, payload);
    const derivative = await payload.create({
      collection: "machine-media",
      data: {
        assetKind: "derivative",
        machine: relationId(master.machine) as number,
        category,
        photoIdentity: master.photoIdentity,
        photoSequence: master.photoSequence,
        revision,
        sourceMaster: masterId,
        processingStatus: "ready",
        review: { status: "needs-review", revision, digest: `sha256:${derivativeDigest}`, serialPolicyRevision: machine.serialVisibilityRevision ?? 1 },
        contentDigest: `sha256:${derivativeDigest}`,
        sourceDigest: master.contentDigest,
        redactionDigest,
        altText: master.altText ?? "",
        focalX: master.focalX ?? 50,
        focalY: master.focalY ?? 50,
        uploadedBy: auth.user.id,
        uploadedAt: new Date().toISOString(),
        ...(redactions.length ? { redactedBy: auth.user.id, redactedAt: new Date().toISOString() } : {}),
        auditHistory: [{ event: "uploaded", actor: auth.user.id, at: new Date().toISOString(), digest: `sha256:${derivativeDigest}` }, ...(redactions.length ? [{ event: "redacted", actor: auth.user.id, at: new Date().toISOString(), sourceDigest: master.contentDigest, redactionDigest }] : [])],
      },
      file: derivativeFile,
      overrideAccess: true,
      req: localReq,
    });
    const currentPhotoRevisions = machine.currentPhotoRevisions && typeof machine.currentPhotoRevisions === "object"
      ? machine.currentPhotoRevisions as Record<string, number>
      : {};
    const machineReq = await createLocalReq({ user: auth.user, context: { machinePhotoProcessing: true } }, payload);
    await payload.update({
      collection: "machines",
      id: machine.id,
      data: { currentPhotoRevisions: { ...currentPhotoRevisions, [master.photoIdentity]: revision } },
      overrideAccess: true,
      req: machineReq,
    });
    return { status: 200, derivativeId: derivative.id, filename: derivative.filename ?? "", digest: derivative.contentDigest, idempotent: false };
  } catch (error) {
    payload.logger.error({ err: error, msg: "Machine photo processing failed; master remains available for retry" });
    return { status: 422, error: "Photo processing failed. The private master was retained and can be retried." };
  } finally {
    processingLocks.delete(lockKey);
  }
}

export function isHumanPhotoReview(checklist: unknown): boolean {
  return isPhotoReviewComplete(checklist);
}
