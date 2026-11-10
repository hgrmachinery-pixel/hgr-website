import { createHash } from "node:crypto";
import { commitTransaction, createLocalReq, initTransaction, killTransaction, type Payload } from "payload";
import { sql } from "@payloadcms/db-postgres";

import { isStaffUser } from "./access.ts";
import { generatedMachinePhotoFilename, isPhotoReviewComplete, machinePhotoMimeType, machinePhotoRequiresHumanReview, validateRedactions } from "./media.ts";
import { blurSensitiveAreas, applyWatermark, createResponsiveMachineImage, DEFAULT_WATERMARK_OPTIONS, inspectMachinePhoto, MachinePhotoPixelLimitError, photoContentDigest } from "./media-image.ts";

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
  let transactionReq: Awaited<ReturnType<typeof createLocalReq>> | undefined;
  let transactionOpen = false;
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
    let metadata: Awaited<ReturnType<typeof inspectMachinePhoto>>;
    try {
      metadata = await inspectMachinePhoto(bytes);
    } catch (error) {
      if (error instanceof MachinePhotoPixelLimitError) return { status: 413, error: error.message };
      return { status: 415, error: "Photo could not be decoded as a supported image" };
    }
    if (machinePhotoMimeType(metadata) !== mimeType) {
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
    const redactionDigest = redactions.length ? photoContentDigest(Buffer.from(JSON.stringify(redactions))) : undefined;
    const transformed = redactions.length ? await blurSensitiveAreas(bytes, redactions) : await createResponsiveMachineImage(bytes);
    const processed = await applyWatermark(transformed, DEFAULT_WATERMARK_OPTIONS);
    const derivativeDigest = createHash("sha256").update(processed).digest("hex");
    if (!master.machineReference || !Number.isSafeInteger(master.photoSequence)) return { status: 422, error: "The master photo has no stable naming identity" };
    const machineId = relationId(master.machine);
    if (machineId === undefined) return { status: 422, error: "The master photo has no machine relationship" };
    transactionReq = await createLocalReq({ user: auth.user, context: { machinePhotoProcessing: true } }, payload);
    if (!await initTransaction(transactionReq)) return { status: 409, error: "A protected photo-processing transaction could not be started" };
    transactionOpen = true;
    const transactionID = await transactionReq.transactionID;
    const session = transactionID ? payload.db.sessions?.[String(transactionID)]?.db : undefined;
    if (!transactionID || !session) throw new Error("Photo processing transaction could not be established");
    const lockedMachine = await payload.db.execute({
      db: session as Parameters<typeof payload.db.execute>[0]["db"],
      drizzle: payload.db.drizzle,
      sql: sql`SELECT "id" FROM "machines" WHERE "id" = ${machineId} FOR UPDATE`,
    });
    if (!lockedMachine.rows[0]) throw new Error("The machine could not be locked for photo processing");
    const machine = await payload.findByID({ collection: "machines", id: Number(machineId), depth: 0, overrideAccess: true, req: transactionReq });
    const existing = await payload.find({
      collection: "machine-media",
      where: { sourceMaster: { equals: masterId } },
      depth: 0,
      limit: 100,
      overrideAccess: true,
      sort: "-revision",
      req: transactionReq,
    });
    const latest = existing.docs[0];
    if (latest && (!redactions.length || latest.redactionDigest === redactionDigest)) {
      if (latest.sourceDigest !== photoContentDigest(bytes)) throw new Error("A different derivative already exists for this photo revision");
      const current = machine.currentPhotoRevisions && typeof machine.currentPhotoRevisions === "object" ? machine.currentPhotoRevisions as Record<string, number> : {};
      if (Number(current[master.photoIdentity]) !== latest.revision) {
        await payload.update({ collection: "machines", id: machine.id, data: { currentPhotoRevisions: { ...current, [master.photoIdentity]: latest.revision } }, overrideAccess: true, req: transactionReq });
      }
      await commitTransaction(transactionReq);
      transactionOpen = false;
      return { status: 200, derivativeId: latest.id, filename: latest.filename ?? "", digest: latest.contentDigest, idempotent: true };
    }

    const revision = Number(latest?.revision ?? 0) + 1;
    const baseName = generatedMachinePhotoFilename(master.machineReference, category, master.photoSequence, "image/webp");
    const derivativeFile = {
      data: processed,
      mimetype: "image/webp",
      name: baseName.replace(/\.webp$/i, `-public-r${revision}.webp`),
      size: processed.length,
    };
    const carriedReviewHold = latest && machinePhotoRequiresHumanReview(latest)
      ? [{ event: "review-required-carried-forward", revision, digest: `sha256:${derivativeDigest}`, sourceRevision: latest.revision, at: new Date().toISOString() }]
      : [];
    const createdAt = new Date().toISOString();
    const auditHistory = [
      { event: "uploaded", actor: auth.user.id, at: createdAt, digest: `sha256:${derivativeDigest}` },
      ...(redactions.length ? [{ event: "redacted", actor: auth.user.id, at: createdAt, sourceDigest: master.contentDigest, redactionDigest }] : []),
      ...(carriedReviewHold.length ? [{ ...carriedReviewHold[0], actor: auth.user.id }] : []),
    ];
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
        reviewHistory: carriedReviewHold,
        contentDigest: `sha256:${derivativeDigest}`,
        sourceDigest: master.contentDigest,
        redactionDigest,
        altText: master.altText ?? "",
        focalX: master.focalX ?? 50,
        focalY: master.focalY ?? 50,
        uploadedBy: auth.user.id,
        uploadedAt: createdAt,
        ...(redactions.length ? { redactedBy: auth.user.id, redactedAt: createdAt } : {}),
        auditHistory,
      },
      file: derivativeFile,
      overrideAccess: true,
      req: transactionReq,
    });
    const currentPhotoRevisions = machine.currentPhotoRevisions && typeof machine.currentPhotoRevisions === "object"
      ? machine.currentPhotoRevisions as Record<string, number>
      : {};
    await payload.update({
      collection: "machines",
      id: machine.id,
      data: { currentPhotoRevisions: { ...currentPhotoRevisions, [master.photoIdentity]: revision } },
      overrideAccess: true,
      req: transactionReq,
    });
    await commitTransaction(transactionReq);
    transactionOpen = false;
    return { status: 200, derivativeId: derivative.id, filename: derivative.filename ?? "", digest: derivative.contentDigest, idempotent: false };
  } catch (error) {
    if (transactionOpen && transactionReq) await killTransaction(transactionReq);
    payload.logger.error({ err: error, msg: "Machine photo processing failed; master remains available for retry" });
    return { status: 422, error: "Photo processing failed. The private master was retained and can be retried." };
  } finally {
    processingLocks.delete(lockKey);
  }
}

export function isHumanPhotoReview(checklist: unknown): boolean {
  return isPhotoReviewComplete(checklist);
}
