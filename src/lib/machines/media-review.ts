import { createLocalReq, type Payload } from "payload";

import { isStaffUser } from "./access.ts";
import { isPhotoReviewComplete, PHOTO_REVIEW_CHECKLIST } from "./media.ts";

export type PhotoReviewResult = { status: 200; id: string | number; approved: true; idempotent?: true } | { status: 400 | 401 | 403 | 404 | 409 | 413; error: string };

export async function reviewMachinePhoto({ request, payload }: { request: Request; payload: Payload }): Promise<PhotoReviewResult> {
  const origin = process.env.SERVER_URL;
  let sameOrigin = false;
  try { sameOrigin = Boolean(origin && request.headers.get("origin") === new URL(origin).origin); } catch { sameOrigin = false; }
  if (!sameOrigin || request.headers.get("sec-fetch-site") !== "same-origin") return { status: 403, error: "Same-origin photo review is required" };
  const auth = await payload.auth({ headers: request.headers });
  if (!isStaffUser(auth.user)) return { status: 401, error: "Staff sign-in is required" };
  const length = Number(request.headers.get("content-length"));
  if (!Number.isSafeInteger(length) || length < 1 || length > 8192) return { status: 413, error: "Review request is too large" };

  let body: unknown;
  try { body = await request.json(); } catch { return { status: 400, error: "Review details could not be read" }; }
  if (!body || typeof body !== "object") return { status: 400, error: "Review details are required" };
  const data = body as Record<string, unknown>;
  const id = typeof data.id === "string" || typeof data.id === "number" ? data.id : undefined;
  const digest = typeof data.digest === "string" ? data.digest : "";
  const checklist = data.checklist;
  if (id === undefined || !/^sha256:[a-f0-9]{64}$/.test(digest)) return { status: 400, error: "Photo revision and digest are required" };
  const derivative = await payload.findByID({ collection: "machine-media", id, depth: 0, overrideAccess: false, user: auth.user });
  if (derivative.assetKind !== "derivative" || derivative.processingStatus !== "ready") return { status: 404, error: "A ready derivative was not found" };
  if (derivative.contentDigest !== digest) return { status: 409, error: "The image changed after review began; inspect the current revision again" };
  const machineId = typeof derivative.machine === "number" ? derivative.machine : derivative.machine?.id;
  if (machineId === undefined) return { status: 404, error: "The photo has no machine" };
  const machine = await payload.findByID({ collection: "machines", id: machineId, depth: 0, overrideAccess: true });
  const revisions = machine.currentPhotoRevisions && typeof machine.currentPhotoRevisions === "object" ? machine.currentPhotoRevisions as Record<string, number> : {};
  if (Number(revisions[derivative.photoIdentity]) !== derivative.revision) return { status: 409, error: "This is not the current photo revision" };
  if (derivative.review?.status === "approved" && derivative.review?.digest === digest) return { status: 200, id, approved: true, idempotent: true };

  const now = new Date().toISOString();
  const priorHistory = Array.isArray(derivative.reviewHistory) ? derivative.reviewHistory : [];
  const priorAudit = Array.isArray(derivative.auditHistory) ? derivative.auditHistory : [];
  const answers = checklist && typeof checklist === "object" ? checklist as Record<string, unknown> : {};
  const completeAnswers = PHOTO_REVIEW_CHECKLIST.every((key) => ["clear", "found", "uncertain"].includes(String(answers[key])));
  if (!completeAnswers) return { status: 400, error: "Select an answer for every review item" };
  const reviewedChecklist = checklist as Record<string, unknown>;
  const uncertain = PHOTO_REVIEW_CHECKLIST.some((key) => answers[key] === "uncertain");
  const found = PHOTO_REVIEW_CHECKLIST.some((key) => answers[key] === "found");
  const event = uncertain ? "owner-escalation" : found ? "sensitive-information-found" : "approved";
  const reviewHistory = [...priorHistory, {
    event,
    revision: derivative.revision,
    digest,
    reviewer: auth.user.id,
    reviewedAt: now,
    checklist,
  }];
  const auditHistory = [...priorAudit, { event, actor: auth.user.id, at: now, digest, revision: derivative.revision, checklist }];
  if (uncertain || found) {
    const req = await createLocalReq({ user: auth.user, context: { machinePhotoReview: true } }, payload);
    await payload.update({ collection: "machine-media", id, data: {
      review: { status: "needs-review", revision: derivative.revision, digest, reviewedBy: auth.user.id, reviewedAt: now, checklist: reviewedChecklist },
      lastModifiedBy: auth.user.id, lastModifiedAt: now, reviewHistory, auditHistory,
    }, overrideAccess: true, req });
    return { status: 400, error: uncertain ? "Uncertainty was recorded. Escalate this photo to the Owner; it remains private." : "Sensitive information was recorded. Blur or crop it and review the new revision." };
  }
  const req = await createLocalReq({ user: auth.user, context: { machinePhotoReview: true } }, payload);
  await payload.update({
    collection: "machine-media",
    id,
    data: {
      review: { status: "approved", revision: derivative.revision, digest, reviewedBy: auth.user.id, reviewedAt: now, checklist: reviewedChecklist },
      approvedBy: auth.user.id,
      approvedAt: now,
      lastModifiedBy: auth.user.id,
      lastModifiedAt: now,
      reviewHistory,
      auditHistory,
    },
    overrideAccess: true,
    req,
  });
  return { status: 200, id, approved: true };
}
