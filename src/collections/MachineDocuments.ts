import { createHash } from "node:crypto";
import type { CollectionConfig } from "payload";
import { createLocalReq } from "payload";
import { appendAssetAuditEvent } from "../lib/audit/assets.ts";
import { hasPermission, APPROVE_PUBLIC_DOCUMENTS } from "../lib/auth/permissions.ts";

import { isStaffUser } from "../lib/machines/access.ts";
import { configuredDocumentMimeTypes, isTrustedDocumentPublicationRequest, type MachineDocumentKind } from "../lib/machines/documents.ts";

function relationID(value: unknown): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (!value || typeof value !== "object") return undefined;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" || typeof id === "number" ? id : undefined;
}

function sameID(left: unknown, right: unknown): boolean {
  const leftID = relationID(left) ?? left;
  const rightID = relationID(right) ?? right;
  return leftID !== undefined && rightID !== undefined && String(leftID) === String(rightID);
}

function appendedHistory(previous: unknown, next: unknown): boolean {
  if (!Array.isArray(previous) || !Array.isArray(next) || next.length !== previous.length + 1) return false;
  return previous.every((entry, index) => JSON.stringify(entry) === JSON.stringify(next[index]));
}

const staffFieldRead = ({ req }: { req: { user?: unknown } }) => isStaffUser(req.user);

export const MachineDocuments: CollectionConfig = {
  slug: "machine-documents",
  labels: { singular: "Machine Document", plural: "Machine Documents" },
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["machine", "documentKind", "workflowStatus", "uploadedAt"],
    description: "Private originals and separate redacted document revisions.",
    components: { edit: { beforeDocumentControls: ["@/components/payload/MachineDocumentActions#MachineDocumentActions"] } },
  },
  access: {
    create: ({ req }) => isStaffUser(req.user),
    read: ({ req }) => isStaffUser(req.user),
    update: ({ req }) => isStaffUser(req.user),
    delete: () => false,
  },
  hooks: {
    beforeOperation: [async ({ args, operation, req }) => {
      if (operation !== "create" || !req.file) return args;
      if (!isStaffUser(req.user)) throw new Error("Staff sign-in is required to upload documents.");
      const input = args.data as Record<string, unknown> | undefined;
      if (!input || typeof input.machine !== "string" && typeof input.machine !== "number") {
        throw new Error("Choose a machine before uploading the document.");
      }
      const kind = input.documentKind;
      if (kind !== "original" && kind !== "redacted-copy") throw new Error("Choose original or redacted copy.");
      const machine = await req.payload.findByID({ collection: "machines", id: input.machine, depth: 0, overrideAccess: true, req });
      if (typeof machine.hgrId !== "string" || !/^HGR-[0-9]{6,}$/i.test(machine.hgrId)) {
        throw new Error("The selected machine has no permanent HGR reference.");
      }

      if (kind === "original") {
        if (input.sourceDocument !== undefined && input.sourceDocument !== null) {
          throw new Error("A private original cannot be based on another document.");
        }
      } else {
        const sourceID = relationID(input.sourceDocument);
        if (sourceID === undefined) throw new Error("Select the matching private original.");
        const source = await req.payload.findByID({ collection: "machine-documents", id: sourceID, depth: 0, overrideAccess: true, req });
        if (source.documentKind !== "original" || !sameID(source.machine, input.machine)) {
          throw new Error("A redacted copy must be linked to the original for the same machine.");
        }
      }

      const mimeType = req.file.mimetype.toLowerCase();
      if (!configuredDocumentMimeTypes().includes(mimeType)) {
        throw new Error("This document format is not enabled. Confirm the accepted format before uploading.");
      }
      const extension = mimeType === "application/pdf" ? "pdf" : mimeType === "image/jpeg" ? "jpg" : "png";
      const revisionID = crypto.randomUUID();
      input.revisionID = revisionID;
      input.workflowStatus = "draft";
      input.contentDigest = undefined;
      input.auditHistory = undefined;
      input.uploadedBy = undefined;
      input.uploadedAt = undefined;
      input.redactedBy = undefined;
      input.redactedAt = undefined;
      input.approvedBy = undefined;
      input.approvedAt = undefined;
      input.publishedBy = undefined;
      input.publishedAt = undefined;
      input.lastModifiedBy = undefined;
      input.lastModifiedAt = undefined;
      input.latestRedactedRevision = undefined;
      req.file.name = `${machine.hgrId.toLowerCase()}-document-${revisionID}.${extension}`;
      args.data = input;
      return args;
    }],
    beforeChange: [async ({ data, operation, originalDoc, req }) => {
      const context = req.context as Record<string, unknown>;
      if (!isStaffUser(req.user)) throw new Error("Staff sign-in is required to change machine documents.");

      if (operation === "create") {
        const kind = data.documentKind as MachineDocumentKind;
        if (kind !== "original" && kind !== "redacted-copy") throw new Error("Choose original or redacted copy.");
        if (!req.file?.data?.length) throw new Error("The private document file is missing.");
        const now = new Date().toISOString();
        const digest = `sha256:${createHash("sha256").update(req.file.data).digest("hex")}`;
        data.workflowStatus = "draft";
        data.contentDigest = digest;
        data.uploadedBy = req.user.id;
        data.uploadedAt = now;
        data.lastModifiedBy = req.user.id;
        data.lastModifiedAt = now;
        data.approvedBy = undefined;
        data.approvedAt = undefined;
        data.publishedBy = undefined;
        data.publishedAt = undefined;
        const uploaded = { event: "uploaded", actor: req.user.id, at: now, digest };
        if (kind === "redacted-copy") {
          data.redactedBy = req.user.id;
          data.redactedAt = now;
          data.auditHistory = [uploaded, { event: "redacted", actor: req.user.id, at: now, digest }];
        } else {
          data.auditHistory = [uploaded];
        }
        return data;
      }

      if (!originalDoc) throw new Error("Machine documents cannot be updated without an existing revision.");
      if (req.file) throw new Error("A document revision is immutable; upload a new redacted copy instead.");
      const keys = Object.keys(data);
      if (context.machineDocumentRevisionLink === true) {
        const allowed = new Set(["latestRedactedRevision", "redactedBy", "redactedAt", "lastModifiedBy", "lastModifiedAt", "auditHistory"]);
        if (originalDoc.documentKind !== "original" || keys.some((key) => !allowed.has(key))) {
          throw new Error("Only the server may link a new redacted revision to its original.");
        }
        if (!appendedHistory(originalDoc.auditHistory, data.auditHistory)) {
          throw new Error("Document audit history is append-only.");
        }
        return data;
      }

      if (context.machineDocumentSubmit === true) {
        const allowed = new Set(["workflowStatus", "submittedBy", "submittedAt", "lastModifiedBy", "lastModifiedAt", "auditHistory"]);
        if (
          originalDoc.documentKind !== "redacted-copy" ||
          originalDoc.workflowStatus !== "draft" ||
          data.workflowStatus !== "submitted" ||
          keys.some((key) => !allowed.has(key)) ||
          !appendedHistory(originalDoc.auditHistory, data.auditHistory)
        ) {
          throw new Error("Only a current draft redacted revision can be submitted for review.");
        }
        const sourceID = relationID(originalDoc.sourceDocument);
        if (sourceID === undefined) throw new Error("This revision has no private original.");
        const source = await req.payload.findByID({ collection: "machine-documents", id: sourceID, depth: 0, overrideAccess: true, req });
        if (!sameID(source.latestRedactedRevision, originalDoc.id) || source.documentKind !== "original") {
          throw new Error("Only the latest redacted revision can be submitted.");
        }
        return data;
      }

      if (context.machineDocumentPublish === true) {
        if (!isTrustedDocumentPublicationRequest(req)) throw new Error("Document publication must use the trusted Publish action.");
        if (!await hasPermission(req, APPROVE_PUBLIC_DOCUMENTS)) throw new Error("The current account does not have Approve Public Documents.");
        const allowed = new Set(["workflowStatus", "ownerReview", "approvedBy", "approvedAt", "publishedBy", "publishedAt", "lastModifiedBy", "lastModifiedAt"]);
        const review = data.ownerReview as Record<string, unknown> | undefined;
        const checklist = review?.checklist as Record<string, unknown> | undefined;
        const reviewItems = ["manufacturerSerials", "chassisVIN", "engineNumbers", "registrationNumbers", "qrCodes", "barcodes", "customerLabels", "deliveryInformation", "personalInformation", "otherSensitiveIdentifiers"];
        if (
          originalDoc.documentKind !== "redacted-copy" || !["draft", "submitted"].includes(String(originalDoc.workflowStatus)) || data.workflowStatus !== "published" ||
          keys.some((key) => !allowed.has(key)) || review?.revisionID !== originalDoc.revisionID || review?.digest !== originalDoc.contentDigest ||
          review?.humanAttested !== true || String(review?.reviewer) !== String(req.user?.id) || typeof review?.reviewedAt !== "string" ||
          String(data.approvedBy) !== String(req.user?.id) || String(data.publishedBy) !== String(req.user?.id) ||
          data.approvedAt !== review.reviewedAt || data.publishedAt !== review.reviewedAt ||
          !checklist || reviewItems.some((key) => !["clear", "redacted"].includes(String(checklist[key])))
        ) throw new Error("Publish requires a complete Owner attestation for this exact redacted revision.");
        return data;
      }

      throw new Error("Document review, approval, publication and audit fields are server-managed.");
    }],
    afterChange: [async ({ doc, operation, req }) => {
      if (operation === "create") {
        const timestamp = String(doc.uploadedAt ?? new Date().toISOString());
        const digest = String(doc.contentDigest);
        const revisionID = String(doc.revisionID);
        await appendAssetAuditEvent({
          req, entityType: "document", entityID: doc.id, revisionID, digest,
          eventType: "uploaded", eventKey: `document:${doc.id}:uploaded:${revisionID}`,
          audit: { uploaded_by: String(req.user?.id), uploaded_at: timestamp, last_modified_by: String(req.user?.id), last_modified_at: timestamp },
        });
        if (doc.documentKind === "redacted-copy") {
          await appendAssetAuditEvent({
            req, entityType: "document", entityID: doc.id, revisionID, digest,
            eventType: "redacted", eventKey: `document:${doc.id}:redacted:${revisionID}`,
            audit: { redacted_by: String(doc.redactedBy ?? req.user?.id), redacted_at: String(doc.redactedAt ?? timestamp) },
          });
          const sourceID = relationID(doc.sourceDocument);
          if (sourceID === undefined) throw new Error("A redacted copy must remain linked to its private original.");
          const now = new Date().toISOString();
          const source = await req.payload.findByID({ collection: "machine-documents", id: sourceID, depth: 0, overrideAccess: true, req });
          const history = Array.isArray(source.auditHistory) ? source.auditHistory : [];
          const localReq = await createLocalReq({ req, user: req.user ?? undefined, context: { ...req.context, machineDocumentRevisionLink: true } }, req.payload);
          await req.payload.update({
            collection: "machine-documents", id: sourceID,
            data: {
              latestRedactedRevision: doc.id, redactedBy: req.user?.id, redactedAt: now,
              lastModifiedBy: req.user?.id, lastModifiedAt: now,
              auditHistory: [...history, { event: "redacted", actor: req.user?.id, at: now, revision: doc.id, digest: doc.contentDigest }],
            },
            overrideAccess: true, req: localReq,
          });
        }
      }
      const context = req.context as Record<string, unknown>;
      if (operation === "update" && context.machineDocumentSubmit === true) {
        const now = String(doc.submittedAt ?? new Date().toISOString());
        await appendAssetAuditEvent({
          req, entityType: "document", entityID: doc.id, revisionID: String(doc.revisionID), digest: String(doc.contentDigest),
          eventType: "submitted", eventKey: `document:${doc.id}:submitted:${doc.revisionID}`,
          audit: { last_modified_by: String(doc.lastModifiedBy ?? req.user?.id), last_modified_at: String(doc.lastModifiedAt ?? now) },
        });
      }
      if (operation === "update" && context.machineDocumentPublish === true) {
        const actor = String(doc.publishedBy ?? req.user?.id);
        const at = String(doc.publishedAt ?? new Date().toISOString());
        for (const eventType of ["approved", "published"] as const) {
          await appendAssetAuditEvent({
            req, entityType: "document", entityID: doc.id, revisionID: String(doc.revisionID), digest: String(doc.contentDigest),
            eventType, eventKey: `document:${doc.id}:${eventType}:${doc.revisionID}`,
            audit: eventType === "approved"
              ? { approved_by: String(doc.approvedBy ?? actor), approved_at: String(doc.approvedAt ?? at) }
              : { published_by: actor, published_at: at, last_modified_by: String(doc.lastModifiedBy ?? actor), last_modified_at: String(doc.lastModifiedAt ?? at) },
          });
        }
      }
      return doc;
    }],
    beforeDelete: [() => { throw new Error("Machine documents are retained; deletion is disabled."); }],
  },
  upload: {
    disableLocalStorage: true,
    filesRequiredOnCreate: true,
    mimeTypes: configuredDocumentMimeTypes(),
    pasteURL: false,
    modifyResponseHeaders: ({ headers }) => {
      headers.set("Cache-Control", "private, no-store");
      headers.set("Pragma", "no-cache");
      return headers;
    },
  },
  fields: [
    { name: "machine", type: "relationship", relationTo: "machines", required: true, index: true, access: { update: () => false } },
    { name: "documentKind", label: "Document Type", type: "select", required: true, options: [
      { label: "Private original", value: "original" },
      { label: "Redacted copy", value: "redacted-copy" },
    ], access: { update: () => false } },
    { name: "sourceDocument", label: "Private original", type: "relationship", relationTo: "machine-documents", admin: { condition: (_, siblingData) => siblingData?.documentKind === "redacted-copy" }, access: { update: () => false } },
    { name: "latestRedactedRevision", type: "relationship", relationTo: "machine-documents", admin: { hidden: true, readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "revisionID", type: "text", required: true, unique: true, admin: { hidden: true, readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "contentDigest", type: "text", required: true, index: true, admin: { hidden: true, readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "workflowStatus", label: "Review status", type: "select", required: true, defaultValue: "draft", options: [
      { label: "Draft", value: "draft" },
      { label: "Submitted for Owner review", value: "submitted" },
      { label: "Published", value: "published" },
    ], admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "ownerReview", type: "group", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead }, fields: [
      { name: "revisionID", type: "text" }, { name: "digest", type: "text" },
      { name: "reviewer", type: "text" }, { name: "reviewedAt", type: "date" },
      { name: "humanAttested", type: "checkbox" }, { name: "checklist", type: "json" },
    ] },
    { name: "submittedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "submittedAt", type: "date", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "uploadedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "uploadedAt", type: "date", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "redactedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "redactedAt", type: "date", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "approvedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "approvedAt", type: "date", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "publishedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "publishedAt", type: "date", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "lastModifiedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "lastModifiedAt", type: "date", admin: { readOnly: true }, access: { update: () => false, read: staffFieldRead } },
    { name: "auditHistory", type: "json", defaultValue: [], admin: { hidden: true }, access: { update: () => false, read: staffFieldRead } },
  ],
};
