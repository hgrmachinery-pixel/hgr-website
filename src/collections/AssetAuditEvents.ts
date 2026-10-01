import type { CollectionConfig } from "payload";
import { isTrustedAssetAuditRequest } from "../lib/audit/assets.ts";
import { isStaffUser } from "../lib/machines/access.ts";

export const AssetAuditEvents: CollectionConfig = {
  slug: "asset-audit-events",
  admin: { useAsTitle: "eventKey", defaultColumns: ["entityType", "entityID", "eventType", "actorID", "occurredAt"] },
  access: {
    create: () => false,
    read: ({ req }) => isStaffUser(req.user),
    update: () => false,
    delete: () => false,
  },
  hooks: {
    beforeChange: [({ data, operation, req }) => {
      if (operation !== "create" || !isTrustedAssetAuditRequest(req) || !isStaffUser(req.user)) {
        throw new Error("Asset history can only be appended by a trusted server workflow.");
      }
      data.actorID = String(req.user.id);
      data.occurredAt = new Date().toISOString();
      return data;
    }],
    beforeDelete: [() => { throw new Error("Asset audit history is permanently retained."); }],
  },
  fields: [
    { name: "eventKey", type: "text", required: true, unique: true, index: true },
    { name: "entityType", type: "select", required: true, options: ["photo", "document"].map((value) => ({ label: value, value })) },
    { name: "entityID", type: "text", required: true, index: true },
    { name: "revisionID", type: "text", required: true, index: true },
    { name: "digest", type: "text", required: true },
    { name: "eventType", type: "select", required: true, options: ["uploaded", "redacted", "modified", "submitted", "approved", "published", "unpublished"].map((value) => ({ label: value, value })) },
    { name: "actorID", type: "text", required: true },
    { name: "occurredAt", type: "date", required: true },
    { name: "uploaded_by", type: "text" }, { name: "uploaded_at", type: "date" },
    { name: "redacted_by", type: "text" }, { name: "redacted_at", type: "date" },
    { name: "approved_by", type: "text" }, { name: "approved_at", type: "date" },
    { name: "published_by", type: "text" }, { name: "published_at", type: "date" },
    { name: "last_modified_by", type: "text" }, { name: "last_modified_at", type: "date" },
  ],
};
