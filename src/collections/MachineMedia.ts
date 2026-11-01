import type { CollectionConfig } from "payload";
import { isDeepStrictEqual } from "node:util";
import { sql } from "@payloadcms/db-postgres";

import { denyAccess, staffAccess } from "../lib/machines/access";
import { publicMachineMediaAccess, generatedMachinePhotoFilename, initialPhotoReview, historyIsAppendOnly, isPhotoReviewComplete, PHOTO_REVIEW_CHECKLIST } from "../lib/machines/media.ts";
import { photoContentDigest } from "../lib/machines/media-image.ts";
import { isStaffUser } from "../lib/machines/access";
import { appendAssetAuditEvent } from "../lib/audit/assets.ts";

const staffFieldRead = ({ req }: { req: { user?: unknown } }) => isStaffUser(req.user);

function relationshipID(value: unknown): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object") {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return undefined;
}

function validSerialPolicyRevision(value: unknown): number | undefined {
  if (typeof value !== "number" && typeof value !== "string") return undefined;
  if (typeof value === "string" && !value.trim()) return undefined;
  const revision = Number(value);
  return Number.isSafeInteger(revision) && revision > 0 ? revision : undefined;
}

export const MachineMedia: CollectionConfig = {
  slug: "machine-media",
  labels: { singular: "Machine Image", plural: "Machine Images" },
  admin: {
    useAsTitle: "filename",
    description: "Machine photographs only. Sensitive documents do not belong here.",
  },
  access: {
    create: staffAccess,
    read: async ({ req, id, isReadingStaticFile, data }) =>
      isReadingStaticFile
        ? publicMachineMediaAccess({ req, id, data: data as { filename?: unknown } })
        : id !== undefined
          ? publicMachineMediaAccess({ req, id })
        : staffAccess({ req }),
    update: staffAccess,
    delete: denyAccess,
  },
  hooks: {
    beforeOperation: [async ({ args, operation, req }) => {
      if (operation !== "create" || !req.file) return args;
      if (!isStaffUser(req.user)) throw new Error("Staff sign-in is required to upload machine photos");
      const input = args.data as Record<string, unknown> | undefined;
      const context = req.context as Record<string, unknown>;
      if (context.machinePhotoProcessing === true && input?.assetKind === "derivative") return args;
      if (!input || typeof input.machine !== "string" && typeof input.machine !== "number") {
        throw new Error("Choose a machine before uploading its photo");
      }
      if (typeof input.category !== "string") throw new Error("Choose a photo category before uploading");
      const machine = await req.payload.findByID({ collection: "machines", id: input.machine, depth: 0, overrideAccess: false, req });
      if (typeof machine.hgrId !== "string") throw new Error("The selected machine has no permanent HGR reference");
      const serialPolicyRevision = validSerialPolicyRevision(machine.serialVisibilityRevision ?? 1);
      if (serialPolicyRevision === undefined) throw new Error("The machine serial policy revision is invalid");
      const sequenceResult = await req.payload.db.execute({ drizzle: req.payload.db.drizzle, sql: sql`SELECT nextval('hgr_machine_photo_seq') AS value` });
      const sequence = Number(sequenceResult.rows[0]?.value);
      if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error("Could not allocate a permanent photo sequence");
      input.assetKind = "master";
      input.photoIdentity = crypto.randomUUID();
      input.photoSequence = sequence;
      input.revision = 0;
      input.processingStatus = "master";
      input.review = initialPhotoReview(1, serialPolicyRevision);
      input.machineReference = machine.hgrId;
      req.file.name = generatedMachinePhotoFilename(machine.hgrId, input.category as any, sequence, req.file.mimetype);
      args.data = input;
      return args;
    }],
    beforeChange: [async ({ data, operation, originalDoc, req }) => {
      const context = req.context as Record<string, unknown>;
      if (operation === "create") {
        if (data.assetKind === "derivative" && context.machinePhotoProcessing !== true) {
          throw new Error("Photo derivatives can only be created by the protected processing route");
        }
        if (data.assetKind === "master") {
          if (!isStaffUser(req.user)) throw new Error("Staff sign-in is required to upload machine photos");
          if (!req.file?.data?.length) throw new Error("The private master file is missing");
          data.contentDigest = photoContentDigest(req.file.data);
          data.uploadedBy = req.user?.id;
          data.uploadedAt = new Date().toISOString();
          const machineID = relationshipID(data.machine);
          if (machineID === undefined || machineID === "") throw new Error("Choose a machine before uploading its photo");
          let machine;
          try {
            machine = await req.payload.findByID({
              collection: "machines",
              id: machineID,
              depth: 0,
              overrideAccess: false,
              req,
            });
          } catch {
            throw new Error("The selected machine could not be verified for photo upload");
          }
          const serialPolicyRevision = validSerialPolicyRevision(machine?.serialVisibilityRevision);
          if (serialPolicyRevision === undefined) throw new Error("The machine serial policy revision is invalid");
          data.review = initialPhotoReview(1, serialPolicyRevision);
          data.auditHistory = [{ event: "uploaded", actor: req.user?.id, at: data.uploadedAt, digest: data.contentDigest }];
        }
        return data;
      }

      if (!originalDoc) throw new Error("Machine photo records are immutable outside the review workflow");
      const preservedCloudFile = context._payloadCloudStorage;
      if (context.skipCloudStorage === true) {
        const isCloudStorageFollowUp = isStaffUser(req.user)
          && !req.file
          && preservedCloudFile !== null
          && typeof preservedCloudFile === "object"
          && "file" in preservedCloudFile
          && Object.keys(data).every((key) =>
            ["filename", "mimeType", "filesize", "width", "height", "sizes", "url"].includes(key)
              || isDeepStrictEqual(data[key], (originalDoc as Record<string, unknown>)[key]),
          );
        if (!isCloudStorageFollowUp) throw new Error("Cloud storage metadata updates cannot change machine photo or review data");
        return data;
      }
      const transactionID = await req.transactionID;
      const session = transactionID ? req.payload.db.sessions?.[String(transactionID)]?.db : undefined;
      if (!transactionID || !session) throw new Error("Photo updates require an active Payload transaction");
      const machineValue = originalDoc.machine as unknown;
      const machineID = typeof machineValue === "number" || typeof machineValue === "string"
        ? machineValue
        : machineValue && typeof machineValue === "object" && (typeof (machineValue as { id?: unknown }).id === "number" || typeof (machineValue as { id?: unknown }).id === "string")
          ? (machineValue as { id: string | number }).id
          : undefined;
      if (machineID === undefined) throw new Error("The current machine photo has no machine identity");
      const machineResult = await req.payload.db.execute({
        db: session as Parameters<typeof req.payload.db.execute>[0]["db"],
        drizzle: req.payload.db.drizzle,
        sql: sql`SELECT "serial_visibility_revision" AS "serialVisibilityRevision" FROM "machines" WHERE "id" = ${machineID} FOR UPDATE`,
      });
      const machine = machineResult.rows[0] as { serialVisibilityRevision?: number } | undefined;
      if (!machine) throw new Error("The current machine policy could not be locked");
      const latestResult = await req.payload.db.execute({
        db: session as Parameters<typeof req.payload.db.execute>[0]["db"],
        drizzle: req.payload.db.drizzle,
        sql: sql`SELECT "review_history" AS "reviewHistory", "audit_history" AS "auditHistory" FROM "machine_media" WHERE "id" = ${originalDoc.id} FOR UPDATE`,
      });
      const latest = latestResult.rows[0] as { reviewHistory?: unknown; auditHistory?: unknown } | undefined;
      if (!latest) throw new Error("The current machine photo revision could not be locked");
      if (context.machinePhotoReview !== true && context.machinePhotoPublication !== true) {
        const keys = Object.keys(data);
        const allowedMetadata = new Set(["altText", "focalX", "focalY", "order"]);
        if (req.file || keys.some((key) => !allowedMetadata.has(key))) {
          throw new Error("Only factual alternative text, focal point and gallery order may be edited directly");
        }
        if (typeof data.altText === "string" && data.altText.length > 250) throw new Error("Alternative text must be 250 characters or fewer");
        const now = new Date().toISOString();
        const history = Array.isArray(latest.auditHistory) ? latest.auditHistory : [];
        if (!historyIsAppendOnly(history, originalDoc.auditHistory ?? history, 0)) throw new Error("Photo audit history changed; reload the photo and retry");
        data.auditHistory = [...history, { event: "metadata-updated", actor: req.user?.id, at: now, fields: keys }];
        data.lastModifiedBy = req.user?.id;
        data.lastModifiedAt = now;
        return data;
      }
      const transition = context.machinePhotoReview === true || context.machinePhotoPublication === true;
      if (!transition) throw new Error("Machine photo records can only change through metadata or review workflows");
      const allowed = context.machinePhotoReview === true
        ? new Set(["review", "reviewHistory", "auditHistory", "approvedBy", "approvedAt", "lastModifiedBy", "lastModifiedAt"])
        : new Set(["auditHistory", "publishedBy", "publishedAt", "lastModifiedBy", "lastModifiedAt"]);
      if (Object.keys(data).some((key) => !allowed.has(key))) throw new Error("Photo review transitions contain unsupported fields");
      const previousHistory = Array.isArray(latest.reviewHistory) ? latest.reviewHistory : [];
      const nextHistory = Array.isArray(data.reviewHistory) ? data.reviewHistory : previousHistory;
      if (context.machinePhotoReview === true && !historyIsAppendOnly(previousHistory, nextHistory)) throw new Error("Photo review history is append-only");
      const combined = { ...originalDoc, ...data };
      if (combined.contentDigest !== originalDoc.contentDigest || combined.photoIdentity !== originalDoc.photoIdentity || combined.revision !== originalDoc.revision) {
        throw new Error("Photo identity, revision and content digest cannot be changed");
      }
      const priorAudit = Array.isArray(latest.auditHistory) ? latest.auditHistory : [];
      const nextAudit = Array.isArray(data.auditHistory) ? data.auditHistory : priorAudit;
      if (!historyIsAppendOnly(priorAudit, nextAudit)) throw new Error("Photo audit history is append-only");
      const event = nextAudit[nextAudit.length - 1] as Record<string, unknown> | undefined;
      const allowedEvents = context.machinePhotoReview === true
        ? new Set(["approved", "sensitive-information-found", "owner-escalation", "review-invalidated"])
        : new Set(["published", "unpublished"]);
      if (!event || !allowedEvents.has(String(event.event)) || String(event.actor) !== String(req.user?.id) || typeof event.at !== "string") {
        throw new Error("Photo transitions require a server-authored audit event");
      }
      if (context.machinePhotoReview === true && data.review && Number((data.review as Record<string, unknown>).serialPolicyRevision) !== Number(machine.serialVisibilityRevision ?? 1)) {
        throw new Error("The machine serial policy changed during review; inspect the photo again");
      }
      if (context.machinePhotoReview === true) {
        const latestReview = nextHistory[nextHistory.length - 1] as Record<string, unknown> | undefined;
        if (!latestReview || latestReview.event !== event.event || String(latestReview.actor ?? latestReview.reviewer) !== String(req.user?.id)) {
          throw new Error("Photo review history must match its server-authored audit event");
        }
        if (event.event === "review-invalidated") {
          if ((data.review as Record<string, unknown>)?.status !== "needs-review" || latestReview.reason !== "serial-visibility-policy-changed") {
            throw new Error("Policy invalidation can only return a photo to Needs Review");
          }
        } else {
          const checklist = (data.review as Record<string, unknown>)?.checklist as Record<string, unknown> | undefined;
          const complete = Boolean(checklist && PHOTO_REVIEW_CHECKLIST.every((key) => ["clear", "found", "uncertain"].includes(String(checklist[key]))));
          if (!complete || String(event.digest) !== String(originalDoc.contentDigest) || Number(event.revision) !== Number(originalDoc.revision)) {
            throw new Error("Photo review must record every checklist answer for the current revision and digest");
          }
          const uncertain = PHOTO_REVIEW_CHECKLIST.some((key) => checklist?.[key] === "uncertain");
          const found = PHOTO_REVIEW_CHECKLIST.some((key) => checklist?.[key] === "found");
          const status = (data.review as Record<string, unknown>)?.status;
          if (event.event === "approved" && (uncertain || found || status !== "approved" || String(data.approvedBy) !== String(req.user?.id) || data.approvedAt !== event.at)) {
            throw new Error("Only a complete clear human review can approve a photo");
          }
          if (event.event === "owner-escalation" && (!uncertain || status !== "needs-review" || data.approvedBy !== undefined || data.approvedAt !== undefined)) {
            throw new Error("Uncertain photos must remain unapproved for Owner escalation");
          }
          if (event.event === "sensitive-information-found" && (!found || uncertain || status !== "needs-review" || data.approvedBy !== undefined || data.approvedAt !== undefined)) {
            throw new Error("Photos with sensitive information must remain unapproved for redaction");
          }
        }
      }
      return data;
    }],
    beforeDelete: [() => { throw new Error("Machine photo records are retained; deletion is disabled."); }],
    afterChange: [async ({ doc, operation, req }) => {
      if (!isStaffUser(req.user) || typeof doc.contentDigest !== "string") return doc;
      const history = Array.isArray(doc.auditHistory) ? doc.auditHistory : [];
      const revisionID = `${doc.photoIdentity ?? doc.id}:${doc.revision ?? 0}`;
      if (operation === "create") {
        const uploadedAt = String(doc.uploadedAt ?? new Date().toISOString());
        const uploadedBy = String(doc.uploadedBy ?? req.user.id);
        await appendAssetAuditEvent({
          req, entityType: "photo", entityID: doc.id, revisionID, digest: doc.contentDigest,
          eventType: "uploaded", eventKey: `photo:${doc.id}:uploaded:${revisionID}`,
          audit: { uploaded_by: uploadedBy, uploaded_at: uploadedAt },
        });
        if (doc.redactedBy && doc.redactedAt) {
          await appendAssetAuditEvent({
            req, entityType: "photo", entityID: doc.id, revisionID, digest: doc.contentDigest,
            eventType: "redacted", eventKey: `photo:${doc.id}:redacted:${revisionID}`,
            audit: { redacted_by: String(doc.redactedBy), redacted_at: String(doc.redactedAt) },
          });
        }
        return doc;
      }
      const latest = history.at(-1) as Record<string, unknown> | undefined;
      const eventName = String(latest?.event ?? "");
      const eventType = eventName === "approved" ? "approved"
        : eventName === "published" ? "published"
          : ["metadata-updated", "sensitive-information-found", "owner-escalation", "review-invalidated"].includes(eventName) ? "modified" : undefined;
      if (!eventType) return doc;
      const occurred = String(latest?.at ?? doc.lastModifiedAt ?? new Date().toISOString());
      const actor = String(latest?.actor ?? latest?.reviewer ?? req.user.id);
      await appendAssetAuditEvent({
        req, entityType: "photo", entityID: doc.id, revisionID, digest: doc.contentDigest,
        eventType, eventKey: `photo:${doc.id}:${eventType}:${revisionID}:${occurred}`,
        audit: eventType === "approved"
          ? { approved_by: String(doc.approvedBy ?? actor), approved_at: String(doc.approvedAt ?? occurred) }
          : eventType === "published"
            ? { published_by: String(doc.publishedBy ?? actor), published_at: String(doc.publishedAt ?? occurred) }
            : { last_modified_by: actor, last_modified_at: occurred },
      });
      return doc;
    }],
  },
  upload: {
    disableLocalStorage: true,
    filesRequiredOnCreate: true,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    pasteURL: false,
    imageSizes: [
      { name: "thumbnail", width: 320, height: 240, fit: "inside" },
      { name: "card", width: 640, height: 480, fit: "inside" },
      { name: "large", width: 1280, height: 960, fit: "inside" },
    ],
    modifyResponseHeaders: ({ headers }) => {
      headers.set("Cache-Control", "private, no-store");
      headers.set("Pragma", "no-cache");
      return headers;
    },
  },
  fields: [
    {
      name: "machine",
      type: "relationship",
      relationTo: "machines",
      index: true,
      required: true,
    },
    { name: "assetKind", type: "select", required: true, options: ["master", "derivative"].map((value) => ({ label: value, value })), defaultValue: "master", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "machineReference", type: "text", admin: { hidden: true, readOnly: true }, access: { read: staffFieldRead } },
    { name: "photoIdentity", type: "text", required: true, index: true, admin: { hidden: true, readOnly: true }, access: { read: staffFieldRead } },
    { name: "photoSequence", type: "number", required: true, admin: { hidden: true, readOnly: true }, access: { read: staffFieldRead } },
    {
      name: "category", type: "select", required: true, options: [
        ["general-exterior", "General / Exterior"], ["side-view-1", "Side View 1"], ["side-view-2", "Side View 2"],
        ["front-view", "Front View"], ["rear-view", "Rear View"], ["cabin-interior", "Cabin / Interior"],
        ["hour-meter", "Hour Meter"], ["chassis-serial-number", "Chassis / Serial Number"], ["engine", "Engine"],
        ["undercarriage-tracks", "Undercarriage / Tracks"], ["boom-arm-bucket", "Boom / Arm / Bucket"], ["other-details", "Other / Details"],
      ].map(([value, label]) => ({ value, label })),
    },
    { name: "revision", type: "number", required: true, admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "sourceMaster", type: "relationship", relationTo: "machine-media", admin: { hidden: true, readOnly: true }, access: { read: staffFieldRead } },
    { name: "processingStatus", type: "select", required: true, defaultValue: "master", options: ["master", "processing", "ready", "failed"].map((value) => ({ value, label: value })), admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "contentDigest", type: "text", required: true, index: true, admin: { hidden: true, readOnly: true }, access: { read: staffFieldRead } },
    { name: "sourceDigest", type: "text", admin: { hidden: true, readOnly: true }, access: { read: staffFieldRead } },
    { name: "redactionDigest", type: "text", admin: { hidden: true, readOnly: true }, access: { read: staffFieldRead } },
    {
      name: "review", type: "group", access: { read: staffFieldRead }, fields: [
        { name: "status", type: "select", required: true, defaultValue: "needs-review", options: [{ label: "Needs Review", value: "needs-review" }, { label: "Approved", value: "approved" }] },
        { name: "revision", type: "number", required: true }, { name: "digest", type: "text" },
        { name: "serialPolicyRevision", type: "number", required: true, defaultValue: 1 },
        { name: "reviewedBy", type: "relationship", relationTo: "users" }, { name: "reviewedAt", type: "date" },
        { name: "checklist", type: "json" },
      ],
    },
    { name: "reviewHistory", type: "json", defaultValue: [], access: { read: staffFieldRead } },
    { name: "auditHistory", type: "json", defaultValue: [], access: { read: staffFieldRead } },
    { name: "uploadedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "uploadedAt", type: "date", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "redactedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "redactedAt", type: "date", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "approvedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "approvedAt", type: "date", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "publishedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "publishedAt", type: "date", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "lastModifiedBy", type: "relationship", relationTo: "users", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "lastModifiedAt", type: "date", admin: { readOnly: true }, access: { read: staffFieldRead } },
    { name: "altText", label: "Alternative Text", type: "text", maxLength: 250 },
    { name: "focalX", type: "number", min: 0, max: 100, defaultValue: 50 },
    { name: "focalY", type: "number", min: 0, max: 100, defaultValue: 50 },
    { name: "order", type: "number", min: 0, defaultValue: 0 },
  ],
};
