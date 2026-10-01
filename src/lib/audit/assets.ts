import type { CollectionConfig, PayloadRequest } from "payload";
import { createLocalReq } from "payload";
import { isStaffUser } from "../machines/access.ts";

const trustedAuditRequests = new WeakSet<object>();
export const isTrustedAssetAuditRequest = (req: PayloadRequest) => trustedAuditRequests.has(req);

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

export async function appendAssetAuditEvent({
  req, entityType, entityID, revisionID, digest, eventType, eventKey, audit,
}: {
  req: PayloadRequest;
  entityType: "photo" | "document";
  entityID: string | number;
  revisionID: string;
  digest: string;
  eventType: "uploaded" | "redacted" | "modified" | "submitted" | "approved" | "published" | "unpublished";
  eventKey: string;
  audit?: Partial<Record<"uploaded_by" | "uploaded_at" | "redacted_by" | "redacted_at" | "approved_by" | "approved_at" | "published_by" | "published_at" | "last_modified_by" | "last_modified_at", string>>;
}) {
  if (!isStaffUser(req.user)) throw new Error("A signed-in staff actor is required for asset audit history.");
  if (!revisionID || !/^sha256:[a-f0-9]{64}$/.test(digest) || !eventKey) throw new Error("Asset audit events require an exact revision and content digest.");
  const localReq = await createLocalReq({ req, user: req.user }, req.payload);
  trustedAuditRequests.add(localReq);
  return req.payload.create({
    collection: "asset-audit-events",
    data: { eventKey, entityType, entityID: String(entityID), revisionID, digest, eventType, ...audit },
    overrideAccess: true,
    req: localReq,
  });
}
