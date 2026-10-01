import { sql } from "@payloadcms/db-postgres";
import type { CollectionConfig, PayloadRequest } from "payload";
import { createLocalReq } from "payload";

import {
  appendHistoricalSlug,
  createMachineSlug,
  formatMachineId,
  hasMachineIdSuffix,
  machinePublicationErrors,
  validateMachinePrice,
} from "../lib/machines/identity";
import {
  denyAccess as deny,
  publishedMachineRead,
  publicPriceRead,
  publicSerialRead,
  staffAccess as isStaff,
} from "../lib/machines/access";
import { machinePreviewURL } from "../lib/machines/preview";
import { isPublicMachineDerivative, serialVisibilityPolicyChanged } from "../lib/machines/media.ts";

type MachineIdentity = {
  hgrId?: string;
  slug?: string;
  previousSlugs?: string[];
  showSerialPublicly?: boolean | null;
  serialVisibilityRevision?: number | null;
};

function relationIds(value: unknown): Array<string | number> {
  const entries = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
  return entries.map((entry) => {
    if (typeof entry === "string" || typeof entry === "number") return entry;
    if (entry && typeof entry === "object") {
      const item = entry as { id?: unknown; value?: unknown };
      const id = item.id ?? item.value;
      if (typeof id === "string" || typeof id === "number") return id;
    }
    return undefined;
  }).filter((id): id is string | number => id !== undefined);
}

async function readLatestIdentity(
  req: PayloadRequest,
  id: number | string,
): Promise<MachineIdentity | undefined> {
  const transactionID = await req.transactionID;
  const session = transactionID
    ? req.payload.db.sessions?.[String(transactionID)]?.db
    : undefined;
  const transaction = session as Parameters<typeof req.payload.db.execute>[0]["db"];
  // Keep the route-history merge inside Payload's transaction and serialize
  // concurrent corrections and version restores for this machine.
  const result = await req.payload.db.execute({
    db: transaction,
    drizzle: req.payload.db.drizzle,
    sql: sql`SELECT "hgr_id" AS "hgrId", "slug", "previous_slugs" AS "previousSlugs", "show_serial_publicly" AS "showSerialPublicly", "serial_visibility_revision" AS "serialVisibilityRevision" FROM "machines" WHERE "id" = ${id} FOR UPDATE`,
  });
  const row = result.rows[0] as MachineIdentity | undefined;
  return row;
}

async function allocateMachineId(req: PayloadRequest) {
  // PostgreSQL sequences are atomic and do not roll back, so failed saves can
  // leave harmless gaps without ever allowing an HGR reference to be reused.
  const result = await req.payload.db.execute({
    drizzle: req.payload.db.drizzle,
    sql: sql`SELECT nextval('hgr_machine_id_seq') AS value`,
  });
  const sequence = result.rows[0]?.value;

  if (sequence === undefined || sequence === null) {
    throw new Error("Could not allocate a permanent machine reference");
  }

  return formatMachineId(BigInt(sequence as number | string | bigint));
}

export const Machines: CollectionConfig = {
  slug: "machines",
  labels: {
    singular: "Machine",
    plural: "Machines",
  },
  admin: {
    useAsTitle: "hgrId",
    defaultColumns: ["hgrId", "brand", "model", "stockStatus", "updatedAt"],
    description: "Manage one record for each physical machine.",
    listSearchableFields: ["hgrId", "brand", "model"],
    enableRichTextRelationship: false,
    components: { edit: { beforeDocumentControls: ["@/components/payload/MachinePhotoUploader#MachinePhotoUploader"] } },
    preview: (doc) => {
      const baseURL = process.env.SERVER_URL;
      const secret = process.env.PREVIEW_SECRET;
      if (!baseURL || !secret || secret.length < 32) return null;
      return machinePreviewURL(doc, baseURL, secret);
    },
  },
  disableDuplicate: true,
  access: {
    create: isStaff,
    read: publishedMachineRead,
    update: isStaff,
    delete: deny,
    readVersions: isStaff,
  },
  versions: {
    drafts: true,
    maxPerDoc: 100,
  },
  hooks: {
    beforeValidate: [async ({ data, operation, originalDoc, req }) => {
      if (!data) return data;

      if (operation === "create") {
        data.hgrId = await allocateMachineId(req);
        data.slug = createMachineSlug(
          {
            brand: typeof data.brand === "string" ? data.brand : null,
            model: typeof data.model === "string" ? data.model : null,
            year: typeof data.year === "number" ? data.year : null,
          },
          data.hgrId,
        );
        data.previousSlugs = [];
        data.serialVisibilityRevision = 1;
      } else if (originalDoc) {
        const persisted = await readLatestIdentity(req, originalDoc.id);
        const identity = { ...(originalDoc as MachineIdentity), ...persisted };
        const currentSerialVisibility = identity.showSerialPublicly === true;
        const nextSerialVisibility = data.showSerialPublicly === undefined
          ? currentSerialVisibility
          : data.showSerialPublicly === true;
        data.serialVisibilityRevision = Number(identity.serialVisibilityRevision ?? 1) + (currentSerialVisibility === nextSerialVisibility ? 0 : 1);
        data.hgrId = identity.hgrId;

        const requestedSlug =
          typeof data.slug === "string" && data.slug.trim()
            ? data.slug.trim().toLowerCase()
            : identity.slug;
        if (
          requestedSlug &&
          (!identity.hgrId ||
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedSlug) ||
            !hasMachineIdSuffix(requestedSlug, identity.hgrId))
        ) {
          throw new Error("A machine route must retain its permanent HGR reference");
        }

        data.slug = requestedSlug;
        const history = Array.isArray(identity.previousSlugs)
          ? identity.previousSlugs.filter((slug): slug is string => typeof slug === "string")
          : [];
        data.previousSlugs = appendHistoricalSlug(history, identity.slug, requestedSlug);
      }

      return data;
    }],
    beforeChange: [async ({ data, operation, originalDoc, req }) => {
      const context = req.context as Record<string, unknown>;
      if (operation === "update" && originalDoc) {
        const identity = originalDoc as MachineIdentity;
        if (data.hgrId !== identity.hgrId) {
          throw new Error("A machine reference cannot be changed");
        }
        if (data.currentPhotoRevisions !== undefined && context.machinePhotoProcessing !== true) {
          throw new Error("Current photo revisions can only be updated by the protected photo processor");
        }
      }

      if (data._status === "published") {
        const publishingData = { ...(originalDoc ?? {}), ...data };
        const errors = machinePublicationErrors(publishingData);
        const ids = (value: unknown): Array<string | number> => {
          const entries = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
          return entries.map((entry) => {
            if (typeof entry === "string" || typeof entry === "number") return entry;
            if (entry && typeof entry === "object") {
              const candidate = entry as { id?: unknown; value?: unknown };
              const id = candidate.id ?? candidate.value;
              if (typeof id === "string" || typeof id === "number") return id;
            }
            return undefined;
          }).filter((id): id is string | number => id !== undefined);
        };
        const selected = [...new Set([...ids(publishingData.gallery), ...ids(publishingData.featuredImage)])];
        const photos = await Promise.all(selected.map((id) => req.payload.findByID({ collection: "machine-media", id, depth: 0, overrideAccess: true, req })));
        const photoById = new Map(photos.map((photo) => [String(photo.id), photo]));
        const invalid = selected.some((id) => {
          const photo = photoById.get(String(id));
          return !photo || !isPublicMachineDerivative(photo as unknown as Record<string, any>, { ...publishingData, id: originalDoc?.id ?? photo.machine });
        });
        const featuredId = ids(publishingData.featuredImage)[0];
        const featured = featuredId === undefined ? undefined : photoById.get(String(featuredId));
        if (invalid) errors.push("Every public gallery image must be the current approved derivative");
        if (!featured || (featured as unknown as { category?: string }).category !== "general-exterior") errors.push("Featured Image must be an approved General / Exterior derivative");
        if (errors.length > 0) {
          throw new Error(
            `Complete these fields before publishing: ${errors.join(", ")}.`,
          );
        }
      }

      return data;
    }],
    afterChange: [async ({ doc, previousDoc, req }) => {
      const nowPublic = doc._status === "published" && doc.archived !== true;
      const wasPublic = previousDoc?._status === "published" && previousDoc.archived !== true;
      const currentPhotoIds = new Set([...relationIds(doc.gallery), ...relationIds(doc.featuredImage)].map(String));
      const previousPhotoIds = new Set([...relationIds(previousDoc?.gallery), ...relationIds(previousDoc?.featuredImage)].map(String));
      const publicationIds = nowPublic
        ? [...currentPhotoIds].filter((id) => !wasPublic || !previousPhotoIds.has(id))
        : [];
      const unpublicationIds = wasPublic
        ? [...previousPhotoIds].filter((id) => !nowPublic || !currentPhotoIds.has(id))
        : [];
      for (const [photoId, targetEvent] of [
        ...publicationIds.map((id) => [id, "published"] as const),
        ...unpublicationIds.map((id) => [id, "unpublished"] as const),
      ]) {
        const photo = await req.payload.findByID({ collection: "machine-media", id: photoId, depth: 0, overrideAccess: true, req });
        if (photo.assetKind !== "derivative") continue;
        const history = Array.isArray(photo.auditHistory) ? photo.auditHistory : [];
        const priorPublicationEvent = [...history].reverse().find((event) => event.event === "published" || event.event === "unpublished")?.event;
        if (priorPublicationEvent === targetEvent) continue;
        const at = new Date().toISOString();
        const auditHistory = [...history, { event: targetEvent, actor: req.user?.id, at, machine: doc.id }];
        const localReq = await createLocalReq({ user: req.user ?? undefined, context: { machinePhotoPublication: true } }, req.payload);
        await req.payload.update({
          collection: "machine-media",
          id: photo.id,
          data: {
            auditHistory,
            ...(targetEvent === "published" ? { publishedBy: req.user?.id, publishedAt: at } : {}),
            lastModifiedBy: req.user?.id,
            lastModifiedAt: at,
          },
          overrideAccess: true,
          req: localReq,
        });
      }

      if (previousDoc && serialVisibilityPolicyChanged(previousDoc, doc)) {
        let page = 1;
        let hasNextPage = true;
        while (hasNextPage) {
          const derivatives = await req.payload.find({
            collection: "machine-media",
            where: { and: [{ machine: { equals: doc.id } }, { assetKind: { equals: "derivative" } }] },
            depth: 0,
            limit: 100,
            page,
            overrideAccess: true,
            req,
          });
          for (const derivative of derivatives.docs) {
            const at = new Date().toISOString();
            const historyEntry = {
              event: "review-invalidated",
              actor: req.user?.id,
              at,
              digest: derivative.contentDigest,
              revision: derivative.revision,
              reason: "serial-visibility-policy-changed",
            };
            const priorReviews = Array.isArray(derivative.reviewHistory) ? derivative.reviewHistory : [];
            const priorAudit = Array.isArray(derivative.auditHistory) ? derivative.auditHistory : [];
            const localReq = await createLocalReq({
              req,
              user: req.user ?? undefined,
              context: { ...req.context, machinePhotoReview: true },
            }, req.payload);
            await req.payload.update({
              collection: "machine-media",
              id: derivative.id,
              data: {
                review: { status: "needs-review", revision: derivative.revision, digest: derivative.contentDigest, serialPolicyRevision: doc.serialVisibilityRevision ?? 1 },
                reviewHistory: [...priorReviews, historyEntry],
                auditHistory: [...priorAudit, historyEntry],
                lastModifiedBy: req.user?.id,
                lastModifiedAt: at,
              },
              overrideAccess: true,
              req: localReq,
            });
          }
          hasNextPage = derivatives.hasNextPage;
          page += 1;
        }
      }
      return doc;
    }],
  },
  fields: [
    {
      name: "hgrId",
      label: "HGR Reference",
      type: "text",
      required: true,
      unique: true,
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "previousSlugs",
      type: "json",
      admin: { readOnly: true, hidden: true },
      access: { read: ({ req }) => Boolean(req.user) },
    },
    {
      name: "category",
      type: "select",
      required: false,
      options: [{ label: "Excavator", value: "excavator" }],
      admin: { position: "sidebar" },
    },
    { name: "brand", type: "text", index: true, required: false },
    { name: "model", type: "text", index: true, required: false },
    { name: "year", label: "Year of Manufacture", type: "number", min: 1900 },
    { name: "hours", type: "number", min: 0 },
    { name: "engine", type: "text" },
    { name: "operatingWeight", label: "Operating Weight", type: "text" },
    {
      name: "condition",
      type: "select",
      options: ["Excellent", "Very Good", "Good", "Fair"].map((value) => ({
        label: value,
        value: value.toLowerCase().replaceAll(" ", "-"),
      })),
    },
    { name: "countryOfOrigin", label: "Country of Origin", type: "text" },
    {
      name: "machineOriginStatus",
      label: "Machine Origin / Registration Status",
      type: "text",
    },
    {
      name: "registrationDate",
      label: "Registration Date",
      type: "date",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    { name: "description", type: "textarea", maxLength: 5000 },
    {
      name: "stockStatus",
      label: "Stock Status",
      type: "select",
      required: false,
      options: ["Available", "Reserved", "Sold"].map((value) => ({
        label: value,
        value: value.toLowerCase(),
      })),
      admin: { position: "sidebar" },
    },
    {
      name: "priceMode",
      label: "Price Display",
      type: "select",
      defaultValue: "unset",
      options: [
        { label: "Not entered", value: "unset" },
        { label: "Contact for Price", value: "contact" },
        { label: "Show Price", value: "public" },
      ],
    },
    {
      name: "price",
      type: "number",
      min: 0,
      admin: { condition: (_, siblingData) => siblingData?.priceMode === "public" },
      access: {
        read: publicPriceRead,
      },
      validate: (value: unknown, { siblingData }: { siblingData?: { priceMode?: string } }) =>
        validateMachinePrice(value, siblingData?.priceMode),
    },
    {
      name: "serialNumber",
      label: "Machine Serial Number",
      type: "text",
      access: {
        read: publicSerialRead,
      },
    },
    {
      name: "showSerialPublicly",
      label: "Show serial number publicly",
      type: "checkbox",
      defaultValue: false,
      access: { read: ({ req }) => Boolean(req.user) },
    },
    { name: "serialVisibilityRevision", type: "number", defaultValue: 1, admin: { hidden: true, readOnly: true }, access: { read: ({ req }) => Boolean(req.user), update: () => false } },
    {
      name: "featuredImage",
      label: "Featured Image",
      type: "relationship",
      relationTo: "machine-media",
    },
    {
      name: "gallery",
      label: "Gallery Images",
      type: "relationship",
      relationTo: "machine-media",
      hasMany: true,
    },
    {
      name: "currentPhotoRevisions",
      type: "json",
      defaultValue: {},
      admin: { hidden: true, readOnly: true },
      access: { read: ({ req }) => Boolean(req.user), update: () => false },
    },
    {
      name: "archived",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
  ],
};
