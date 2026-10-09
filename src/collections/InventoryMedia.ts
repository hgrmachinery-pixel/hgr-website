import type { CollectionConfig } from "payload";
import { denyAccess, staffAccess, isStaffUser } from "../lib/machines/access";
import { inventoryMediaCategories } from "../lib/inventory/media";

export const InventoryMedia: CollectionConfig = {
  slug: "inventory-media",
  labels: { singular: "Inventory Image", plural: "Inventory Images" },
  admin: { useAsTitle: "filename", description: "Product photos for spare parts and lubricants. Machine photos stay in the machine photo workflow." },
  access: {
    create: staffAccess,
    // Payload's generic REST/static routes never expose inventory media. The dedicated
    // public file route performs its own per-request owner, review and publication checks.
    read: ({ req }) => isStaffUser(req.user),
    update: staffAccess,
    delete: denyAccess,
  },
  hooks: {
    beforeOperation: [async ({ args, operation, req }) => {
      if (operation !== "create" || !req.file) return args;
      if (!isStaffUser(req.user)) throw new Error("Staff sign-in is required to upload inventory photos");
      const data = args.data as Record<string, unknown>;
      if (!data || !["spare-part", "lubricant"].includes(String(data.ownerType)) || typeof data.ownerId !== "string" && typeof data.ownerId !== "number") throw new Error("Choose a valid inventory item before uploading a photo");
      if (!inventoryMediaCategories.some((entry) => entry.value === data.category)) throw new Error("Choose a valid inventory photo category");
      await req.payload.findByID({ collection: data.ownerType === "spare-part" ? "spare-parts" : "lubricants", id: data.ownerId, depth: 0, overrideAccess: true, req });
      const workflow = (req.context as Record<string, unknown>).inventoryMediaWorkflow === true;
      if (!workflow && (data.assetKind === "derivative" || data.sourceMaster || data.reviewStatus === "approved")) throw new Error("Inventory derivatives and approvals can only be created through the media workflow");
      const sequence = crypto.randomUUID();
      if (!workflow) {
        data.assetKind = "master";
        data.reviewStatus = "needs-review";
        data.revision = 1;
        data.sourceMaster = null;
        data.uploadedBy = req.user.id;
        data.uploadedAt = new Date().toISOString();
      }
      req.file.name = `hgr-${String(data.ownerType)}-${String(data.ownerId)}-${sequence}.${workflow ? "webp" : "original"}`;
      args.data = data;
      return args;
    }],
    beforeChange: [async ({ data, operation, originalDoc, req }) => {
      const context = req.context as Record<string, unknown>;
      if (operation === "create") {
        if (!req.file?.data?.length) throw new Error("The private image file is missing");
        const { createHash } = await import("node:crypto");
        const digest = `sha256:${createHash("sha256").update(req.file.data).digest("hex")}`;
        if (context.inventoryMediaWorkflow === true) {
          if (data.assetKind !== "derivative" || data.contentDigest !== digest) throw new Error("Image derivatives must use server-generated content digests");
          data.assetKind = "derivative";
        } else {
          data.assetKind = "master";
          data.revision = 1;
          data.contentDigest = digest;
          data.reviewStatus = "needs-review";
          data.sourceMaster = null;
          data.uploadedBy = req.user?.id;
          data.uploadedAt = new Date().toISOString();
        }
        data.storageProvider = "r2";
        data.auditHistory = [{ event: context.inventoryMediaWorkflow === true ? "processed" : "uploaded", actor: req.user?.id, at: new Date().toISOString(), digest: data.contentDigest }];
        return data;
      }
      if (!originalDoc) throw new Error("Inventory photos can only change through the review workflow");
      const allowed = context.inventoryMediaWorkflow === true ? new Set(["assetKind", "ownerType", "ownerId", "category", "reviewStatus", "reviewHistory", "auditHistory", "sourceMaster", "sourceDigest", "processingStatus", "revision", "contentDigest", "storageProvider", "uploadedBy", "uploadedAt", "processedBy", "processedAt", "approvedBy", "approvedAt", "altText", "focalX", "focalY", "order"]) : new Set(["altText", "focalX", "focalY", "order"]);
      if (req.file || Object.keys(data).some((key) => !allowed.has(key))) throw new Error("Inventory photos can only change through metadata or review workflows");
      if (context.inventoryMediaWorkflow === true && data.reviewStatus !== undefined) {
        const previous = Array.isArray(originalDoc.reviewHistory) ? originalDoc.reviewHistory : [];
        const next = Array.isArray(data.reviewHistory) ? data.reviewHistory : [];
        const priorAudit = Array.isArray(originalDoc.auditHistory) ? originalDoc.auditHistory : [];
        const nextAudit = Array.isArray(data.auditHistory) ? data.auditHistory : [];
        const event = next.at(-1) as Record<string, unknown> | undefined;
        if (next.length !== previous.length + 1 || JSON.stringify(next.slice(0, previous.length)) !== JSON.stringify(previous) || nextAudit.length !== priorAudit.length + 1 || JSON.stringify(nextAudit.slice(0, priorAudit.length)) !== JSON.stringify(priorAudit) || !event || event.event !== data.reviewStatus || String(event.actor) !== String(req.user?.id) || event.digest !== originalDoc.contentDigest || Number(event.revision) !== Number(originalDoc.revision) || typeof event.at !== "string") throw new Error("Image review history must be server-authored and append-only");
        const checklist = event.checklist as Record<string, unknown> | undefined;
        if (data.reviewStatus === "approved" && (!checklist || Object.values(checklist).length !== 5 || Object.values(checklist).some((answer) => answer !== "clear") || String(data.approvedBy) !== String(req.user?.id) || data.approvedAt !== event.at)) throw new Error("Image approval requires a complete clear review checklist");
      }
      if (context.inventoryMediaWorkflow === true && (data.ownerId !== undefined && String(data.ownerId) !== String(originalDoc.ownerId) || data.ownerType !== undefined && data.ownerType !== originalDoc.ownerType || data.contentDigest !== undefined && data.contentDigest !== originalDoc.contentDigest || data.revision !== undefined && data.revision !== originalDoc.revision)) throw new Error("Inventory media identity and digest are immutable");
      if (data.altText === undefined && !originalDoc.altText) {
        const owner = await req.payload.findByID({ collection: originalDoc.ownerType === "spare-part" ? "spare-parts" : "lubricants", id: originalDoc.ownerId, depth: 0, overrideAccess: true, req });
        data.altText = `Photo for ${owner.name}`;
      }
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
    modifyResponseHeaders: ({ headers }) => { headers.set("Cache-Control", "private, no-store"); headers.set("Pragma", "no-cache"); return headers; },
  },
  fields: [
    { name: "ownerType", type: "select", required: true, options: [{ label: "Spare Part", value: "spare-part" }, { label: "Lubricant", value: "lubricant" }] },
    { name: "ownerId", type: "text", required: true, index: true, admin: { description: "Assigned through the inventory media workflow." } },
    { name: "category", type: "select", required: true, options: inventoryMediaCategories.map(({ label, value }) => ({ label, value })) },
    { name: "assetKind", type: "select", required: true, defaultValue: "master", options: [{ label: "Original", value: "master" }, { label: "Web Image", value: "derivative" }], admin: { readOnly: true } },
    { name: "reviewStatus", type: "select", required: true, defaultValue: "needs-review", options: [{ label: "Needs Review", value: "needs-review" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" }] },
    { name: "revision", type: "number", defaultValue: 1, admin: { hidden: true, readOnly: true } },
    { name: "contentDigest", type: "text", admin: { hidden: true, readOnly: true } },
    { name: "sourceDigest", type: "text", admin: { hidden: true, readOnly: true } },
    { name: "processingStatus", type: "select", options: ["master", "ready", "failed"].map((value) => ({ label: value, value })), admin: { hidden: true, readOnly: true } },
    { name: "storageProvider", type: "select", options: [{ label: "R2", value: "r2" }], admin: { hidden: true, readOnly: true } },
    { name: "uploadedBy", type: "text", admin: { hidden: true, readOnly: true } },
    { name: "uploadedAt", type: "date", admin: { hidden: true, readOnly: true } },
    { name: "processedBy", type: "text", admin: { hidden: true, readOnly: true } },
    { name: "processedAt", type: "date", admin: { hidden: true, readOnly: true } },
    { name: "approvedBy", type: "text", admin: { hidden: true, readOnly: true } },
    { name: "approvedAt", type: "date", admin: { hidden: true, readOnly: true } },
    { name: "reviewHistory", type: "json", defaultValue: [], access: { read: ({ req }) => isStaffUser(req.user) } },
    { name: "auditHistory", type: "json", defaultValue: [], access: { read: ({ req }) => isStaffUser(req.user) } },
    { name: "sourceMaster", type: "relationship", relationTo: "inventory-media", admin: { hidden: true, readOnly: true } },
    { name: "altText", label: "Alternative Text", type: "text", maxLength: 250 },
    { name: "focalX", type: "number", min: 0, max: 100, defaultValue: 50 },
    { name: "focalY", type: "number", min: 0, max: 100, defaultValue: 50 },
    { name: "order", type: "number", min: 0, defaultValue: 0 },
  ],
};
