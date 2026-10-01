import type { Payload } from "payload";

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
