import { commitTransaction, createLocalReq, initTransaction, killTransaction, type Payload, type PayloadRequest } from "payload";
import { sql } from "@payloadcms/db-postgres";

import { APPROVE_PUBLIC_DOCUMENTS, hasPermission } from "../auth/permissions.ts";
import { isStaffUser } from "./access.ts";

const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export type MachineDocumentKind = "original" | "redacted-copy";
export type MachineDocumentActor = { id: number; collection?: string };
export type MachineDocumentActionResult = {
  status: 200 | 400 | 401 | 403 | 404 | 409 | 413;
  error?: string;
  submitted?: true;
  idempotent?: true;
};

export const DOCUMENT_REVIEW_ITEMS = [
  "manufacturerSerials", "chassisVIN", "engineNumbers", "registrationNumbers", "qrCodes",
  "barcodes", "customerLabels", "deliveryInformation", "personalInformation", "otherSensitiveIdentifiers",
] as const;
const trustedPublicationRequests = new WeakSet<object>();
export const isTrustedDocumentPublicationRequest = (req: PayloadRequest) => trustedPublicationRequests.has(req);

export async function publishMachineDocument({
  payload, user, id, digest, checklist,
}: {
  payload: Payload;
  user: MachineDocumentActor | null | undefined;
  id: number;
  digest: string;
  checklist: unknown;
}): Promise<MachineDocumentActionResult> {
  if (!isStaffUser(user)) return { status: 401, error: "Staff sign-in is required." };
  if (!Number.isSafeInteger(id) || id < 1 || !/^sha256:[a-f0-9]{64}$/.test(digest)) {
    return { status: 400, error: "A valid document revision and digest are required." };
  }
  const answers = checklist && typeof checklist === "object" && !Array.isArray(checklist) ? checklist as Record<string, unknown> : {};
  if (Object.keys(answers).some((key) => !(DOCUMENT_REVIEW_ITEMS as readonly string[]).includes(key)) ||
    DOCUMENT_REVIEW_ITEMS.some((key) => !["clear", "redacted"].includes(String(answers[key])))) {
    return { status: 409, error: "Complete every review item as clear or redacted before publishing." };
  }

  const req = await createLocalReq({ user: user as never, context: { machineDocumentPublish: true } }, payload);
  trustedPublicationRequests.add(req);
  if (!await hasPermission(req, APPROVE_PUBLIC_DOCUMENTS)) return { status: 403, error: "Only a role with Approve Public Documents can publish." };
  let expectedSourceID: string | number | undefined;
  try {
    const preliminary = await payload.findByID({ collection: "machine-documents", id, depth: 0, overrideAccess: true, req });
    expectedSourceID = relationID(preliminary.sourceDocument);
  } catch {
    return { status: 404, error: "The document revision was not found." };
  }
  if (expectedSourceID === undefined) return { status: 409, error: "The private original is missing." };
  if (!await initTransaction(req)) return { status: 409, error: "A protected publication transaction could not be started." };
  try {
    const transactionID = await req.transactionID;
    const session = transactionID ? payload.db.sessions?.[String(transactionID)]?.db : undefined;
    if (!transactionID || !session) throw new Error("Publication transaction is unavailable.");
    const lock = await payload.db.execute({
      db: session as Parameters<typeof payload.db.execute>[0]["db"], drizzle: payload.db.drizzle,
      sql: sql`SELECT "id" FROM "machine_documents" WHERE "id" IN (${id}, ${expectedSourceID}) ORDER BY "id" FOR UPDATE`,
    });
    if (lock.rows.length < 2) { await killTransaction(req); return { status: 409, error: "The document or its private original changed during publication." }; }
    if (!await hasPermission(req, APPROVE_PUBLIC_DOCUMENTS)) { await killTransaction(req); return { status: 403, error: "The current role no longer has publication permission." }; }
    const revision = await payload.findByID({ collection: "machine-documents", id, depth: 0, overrideAccess: true, req });
    if (revision.documentKind !== "redacted-copy" || revision.contentDigest !== digest) {
      await killTransaction(req);
      return { status: 409, error: "Only the exact current redacted copy can be published." };
    }
    const sourceID = relationID(revision.sourceDocument);
    if (sourceID === undefined) { await killTransaction(req); return { status: 409, error: "The private original is missing." }; }
    const source = await payload.findByID({ collection: "machine-documents", id: String(sourceID), depth: 0, overrideAccess: true, req });
    if (source.documentKind !== "original" || !sameID(source.machine, revision.machine) || !sameID(source.latestRedactedRevision, revision.id)) {
      await killTransaction(req);
      return { status: 409, error: "Only the latest redacted revision linked to this machine can be published." };
    }
    if (revision.workflowStatus === "published") {
      const ownerChecklist = revision.ownerReview?.checklist as Record<string, unknown> | undefined;
      const alreadyReviewed = revision.ownerReview?.revisionID === revision.revisionID && revision.ownerReview?.digest === digest &&
        revision.ownerReview?.humanAttested === true && DOCUMENT_REVIEW_ITEMS.every((key) => ["clear", "redacted"].includes(String(ownerChecklist?.[key])));
      await killTransaction(req);
      return alreadyReviewed ? { status: 200, submitted: true, idempotent: true } : { status: 409, error: "Published revision does not match its Owner review." };
    }
    if (!["draft", "submitted"].includes(String(revision.workflowStatus))) {
      await killTransaction(req);
      return { status: 409, error: "Only a current draft or submitted redacted revision can be published." };
    }
    const now = new Date().toISOString();
    await payload.update({
      collection: "machine-documents", id,
      data: {
        workflowStatus: "published",
        ownerReview: { revisionID: revision.revisionID, digest, reviewer: String(user.id), reviewedAt: now, humanAttested: true, checklist: answers },
        approvedBy: user.id, approvedAt: now,
        publishedBy: user.id, publishedAt: now,
        lastModifiedBy: user.id, lastModifiedAt: now,
      },
      overrideAccess: true, req,
    });
    await commitTransaction(req);
    return { status: 200, submitted: true };
  } catch {
    await killTransaction(req);
    return { status: 409, error: "Publishing failed and the document remains private." };
  }
}

export function configuredDocumentMimeTypes(value = process.env.HGR_MACHINE_DOCUMENT_MIME_TYPES): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim().toLowerCase()))]
    .filter((item) => ALLOWED_DOCUMENT_MIME_TYPES.has(item));
}

function relationID(value: unknown): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (!value || typeof value !== "object") return undefined;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" || typeof id === "number" ? id : undefined;
}

function sameID(a: unknown, b: unknown): boolean {
  const left = relationID(a) ?? a;
  const right = relationID(b) ?? b;
  return left !== undefined && right !== undefined && String(left) === String(right);
}

/** Custom POST handlers must call this before reading their request body. */
export function isSameOriginDocumentPost(request: Request, serverURL: string | undefined): boolean {
  if (!serverURL || request.headers.get("sec-fetch-site") !== "same-origin") return false;
  try {
    return request.headers.get("origin") === new URL(serverURL).origin;
  } catch {
    return false;
  }
}

export async function submitMachineDocumentForReview({
  payload,
  user,
  id,
  digest,
}: {
  payload: Payload;
  user: MachineDocumentActor | null | undefined;
  id: number;
  digest: string;
}): Promise<MachineDocumentActionResult> {
  if (!isStaffUser(user)) return { status: 401, error: "Staff sign-in is required." };
  if (!Number.isSafeInteger(id) || id < 1) return { status: 400, error: "A valid document revision is required." };
  if (!/^sha256:[a-f0-9]{64}$/.test(digest)) {
    return { status: 400, error: "The current document revision and digest are required." };
  }

  let revision;
  try {
    revision = await payload.findByID({
      collection: "machine-documents",
      id,
      depth: 0,
      overrideAccess: false,
      user: user as never,
    });
  } catch {
    return { status: 404, error: "The document revision was not found." };
  }
  if (revision.documentKind !== "redacted-copy") {
    return { status: 403, error: "Only a separate redacted copy can be submitted for review." };
  }
  if (revision.contentDigest !== digest) {
    return { status: 409, error: "The document changed. Refresh and inspect its current revision." };
  }

  const sourceRelationID = relationID(revision.sourceDocument);
  const sourceID = typeof sourceRelationID === "number" ? sourceRelationID : Number(sourceRelationID);
  if (!Number.isSafeInteger(sourceID) || sourceID < 1) return { status: 409, error: "This redacted copy has no private original." };
  const source = await payload.findByID({
    collection: "machine-documents",
    id: sourceID,
    depth: 0,
    overrideAccess: true,
  });
  if (
    source.documentKind !== "original" ||
    !sameID(source.machine, revision.machine) ||
    !sameID(source.latestRedactedRevision, revision.id)
  ) {
    return { status: 409, error: "Only the latest redacted revision can be submitted." };
  }
  if (revision.workflowStatus === "submitted") {
    return { status: 200, submitted: true, idempotent: true };
  }
  if (revision.workflowStatus !== "draft") {
    return { status: 409, error: "This document is not a draft available for submission." };
  }

  const now = new Date().toISOString();
  try {
    await payload.update({
      collection: "machine-documents",
      id: Number(id),
      data: {
        workflowStatus: "submitted",
        submittedBy: user.id,
        submittedAt: now,
        lastModifiedBy: user.id,
        lastModifiedAt: now,
        auditHistory: [
          ...(Array.isArray(revision.auditHistory) ? revision.auditHistory : []),
          { event: "submitted-for-review", actor: user.id, at: now, digest },
        ],
      },
      overrideAccess: true,
      user: user as never,
      context: { machineDocumentSubmit: true },
    });
  } catch {
    // A failed workflow write leaves the revision private and in its prior state.
    return { status: 409, error: "The document could not be submitted; it remains private." };
  }
  return { status: 200, submitted: true };
}
