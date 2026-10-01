import { commitTransaction, createLocalReq, initTransaction, killTransaction, type Payload } from "payload";
import { sql } from "@payloadcms/db-postgres";

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
  const initialDerivative = await payload.findByID({ collection: "machine-media", id, depth: 0, overrideAccess: false, user: auth.user });
  const machineId = typeof initialDerivative.machine === "number" ? initialDerivative.machine : initialDerivative.machine?.id;
  if (machineId === undefined) return { status: 404, error: "The photo has no machine" };
  const answers = checklist && typeof checklist === "object" ? checklist as Record<string, unknown> : {};
  const completeAnswers = PHOTO_REVIEW_CHECKLIST.every((key) => ["clear", "found", "uncertain"].includes(String(answers[key])));
  if (!completeAnswers) return { status: 400, error: "Select an answer for every review item" };
  const reviewedChecklist = checklist as Record<string, unknown>;
  const uncertain = PHOTO_REVIEW_CHECKLIST.some((key) => answers[key] === "uncertain");
  const found = PHOTO_REVIEW_CHECKLIST.some((key) => answers[key] === "found");
  const event = uncertain ? "owner-escalation" : found ? "sensitive-information-found" : "approved";
  const req = await createLocalReq({ user: auth.user, context: { machinePhotoReview: true } }, payload);
  if (!await initTransaction(req)) return { status: 409, error: "A protected review transaction could not be started" };
  try {
    const transactionID = await req.transactionID;
    const session = transactionID ? payload.db.sessions?.[String(transactionID)]?.db : undefined;
    if (!transactionID || !session) throw new Error("Photo review transaction could not be established");
    const lockedMachine = await payload.db.execute({
      db: session as Parameters<typeof payload.db.execute>[0]["db"],
      drizzle: payload.db.drizzle,
      sql: sql`SELECT "id" FROM "machines" WHERE "id" = ${machineId} FOR UPDATE`,
    });
    if (!lockedMachine.rows[0]) { await killTransaction(req); return { status: 404, error: "The photo has no machine" }; }
    const derivative = await payload.findByID({ collection: "machine-media", id, depth: 0, overrideAccess: true, req });
    const machine = await payload.findByID({ collection: "machines", id: machineId, depth: 0, overrideAccess: true, req });
    const revisions = machine.currentPhotoRevisions && typeof machine.currentPhotoRevisions === "object" ? machine.currentPhotoRevisions as Record<string, number> : {};
    if (derivative.assetKind !== "derivative" || derivative.processingStatus !== "ready") { await killTransaction(req); return { status: 404, error: "A ready derivative was not found" }; }
    if (derivative.contentDigest !== digest) { await killTransaction(req); return { status: 409, error: "The image changed after review began; inspect the current revision again" }; }
    if (Number(revisions[derivative.photoIdentity]) !== derivative.revision) { await killTransaction(req); return { status: 409, error: "This is not the current photo revision" }; }
    const serialPolicyRevision = Number(machine.serialVisibilityRevision ?? 1);
    if (derivative.review?.status === "approved" && derivative.review?.digest === digest && Number(derivative.review?.serialPolicyRevision) === serialPolicyRevision) {
      await killTransaction(req);
      return { status: 200, id, approved: true, idempotent: true };
    }
    const now = new Date().toISOString();
    const priorHistory = Array.isArray(derivative.reviewHistory) ? derivative.reviewHistory : [];
    const priorAudit = Array.isArray(derivative.auditHistory) ? derivative.auditHistory : [];
    const reviewHistory = [...priorHistory, { event, revision: derivative.revision, digest, serialPolicyRevision, reviewer: auth.user.id, reviewedAt: now, checklist }];
    const auditHistory = [...priorAudit, { event, actor: auth.user.id, at: now, digest, revision: derivative.revision, serialPolicyRevision, checklist }];
    const data = {
      review: { status: uncertain || found ? "needs-review" as const : "approved" as const, revision: derivative.revision, digest, serialPolicyRevision, reviewedBy: auth.user.id, reviewedAt: now, checklist: reviewedChecklist },
      ...(!uncertain && !found ? { approvedBy: auth.user.id, approvedAt: now } : {}),
      lastModifiedBy: auth.user.id, lastModifiedAt: now, reviewHistory, auditHistory,
    };
    await payload.update({ collection: "machine-media", id, data, overrideAccess: true, req });
    await commitTransaction(req);
    if (uncertain || found) return { status: 400, error: uncertain ? "Uncertainty was recorded. Escalate this photo to the Owner; it remains private." : "Sensitive information was recorded. Blur or crop it and review the new revision." };
    return { status: 200, id, approved: true };
  } catch (error) {
    await killTransaction(req);
    throw error;
  }
}
