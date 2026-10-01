import type { CollectionConfig } from "payload";
import { sql } from "@payloadcms/db-postgres";

import { denyAccess, staffAccess } from "../lib/machines/access";
import { publicMachineMediaAccess, generatedMachinePhotoFilename, initialPhotoReview } from "../lib/machines/media.ts";
import { photoContentDigest } from "../lib/machines/media-image.ts";
import { isStaffUser } from "../lib/machines/access";

const staffFieldRead = ({ req }: { req: { user?: unknown } }) => isStaffUser(req.user);

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
      const input = args.data as Record<string, unknown> | undefined;
      const context = req.context as Record<string, unknown>;
      if (context.machinePhotoProcessing === true && input?.assetKind === "derivative") return args;
      if (!input || typeof input.machine !== "string" && typeof input.machine !== "number") {
        throw new Error("Choose a machine before uploading its photo");
      }
      if (typeof input.category !== "string") throw new Error("Choose a photo category before uploading");
      const machine = await req.payload.findByID({ collection: "machines", id: input.machine, depth: 0, overrideAccess: true, req });
      if (typeof machine.hgrId !== "string") throw new Error("The selected machine has no permanent HGR reference");
      const sequenceResult = await req.payload.db.execute({ drizzle: req.payload.db.drizzle, sql: sql`SELECT nextval('hgr_machine_photo_seq') AS value` });
      const sequence = Number(sequenceResult.rows[0]?.value);
      if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error("Could not allocate a permanent photo sequence");
      input.assetKind = "master";
      input.photoIdentity = crypto.randomUUID();
      input.photoSequence = sequence;
      input.revision = 0;
      input.processingStatus = "master";
      input.review = initialPhotoReview();
      input.machineReference = machine.hgrId;
      req.file.name = generatedMachinePhotoFilename(machine.hgrId, input.category as any, sequence, req.file.mimetype);
      args.data = input;
      return args;
    }],
    beforeChange: [({ data, operation, originalDoc, req }) => {
      const context = req.context as Record<string, unknown>;
      if (operation === "create") {
        if (data.assetKind === "derivative" && context.machinePhotoProcessing !== true) {
          throw new Error("Photo derivatives can only be created by the protected processing route");
        }
        if (data.assetKind === "master") {
          if (!req.file?.data?.length) throw new Error("The private master file is missing");
          data.contentDigest = photoContentDigest(req.file.data);
          data.uploadedBy = req.user?.id;
          data.uploadedAt = new Date().toISOString();
          data.review = initialPhotoReview();
          data.auditHistory = [{ event: "uploaded", actor: req.user?.id, at: data.uploadedAt, digest: data.contentDigest }];
        }
        return data;
      }

      if (!originalDoc) throw new Error("Machine photo records are immutable outside the review workflow");
      if (context.machinePhotoReview !== true && context.machinePhotoPublication !== true) {
        const keys = Object.keys(data);
        const allowedMetadata = new Set(["altText", "focalX", "focalY", "order"]);
        if (req.file || keys.some((key) => !allowedMetadata.has(key))) {
          throw new Error("Only factual alternative text, focal point and gallery order may be edited directly");
        }
        if (typeof data.altText === "string" && data.altText.length > 250) throw new Error("Alternative text must be 250 characters or fewer");
        const now = new Date().toISOString();
        const history = Array.isArray(originalDoc.auditHistory) ? originalDoc.auditHistory : [];
        data.auditHistory = [...history, { event: "metadata-updated", actor: req.user?.id, at: now, fields: keys }];
        data.lastModifiedBy = req.user?.id;
        data.lastModifiedAt = now;
        return data;
      }
      const previousHistory = Array.isArray(originalDoc.reviewHistory) ? originalDoc.reviewHistory : [];
      const nextHistory = Array.isArray(data.reviewHistory) ? data.reviewHistory : previousHistory;
      if (context.machinePhotoReview === true && nextHistory.length !== previousHistory.length + 1) throw new Error("Photo review history is append-only");
      const combined = { ...originalDoc, ...data };
      if (combined.contentDigest !== originalDoc.contentDigest || combined.photoIdentity !== originalDoc.photoIdentity || combined.revision !== originalDoc.revision) {
        throw new Error("Photo identity, revision and content digest cannot be changed");
      }
      const priorAudit = Array.isArray(originalDoc.auditHistory) ? originalDoc.auditHistory : [];
      const nextAudit = Array.isArray(data.auditHistory) ? data.auditHistory : priorAudit;
      if (nextAudit.length !== priorAudit.length + 1) throw new Error("Photo audit history is append-only");
      return data;
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
