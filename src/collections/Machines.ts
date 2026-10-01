import { sql } from "@payloadcms/db-postgres";
import type { CollectionConfig, PayloadRequest } from "payload";

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

type MachineIdentity = {
  hgrId?: string;
  slug?: string;
  previousSlugs?: string[];
};

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
    sql: sql`SELECT "hgr_id" AS "hgrId", "slug", "previous_slugs" AS "previousSlugs" FROM "machines" WHERE "id" = ${id} FOR UPDATE`,
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
      } else if (originalDoc) {
        const persisted = await readLatestIdentity(req, originalDoc.id);
        const identity = { ...(originalDoc as MachineIdentity), ...persisted };
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
    beforeChange: [async ({ data, operation, originalDoc }) => {
      if (operation === "update" && originalDoc) {
        const identity = originalDoc as MachineIdentity;
        if (data.hgrId !== identity.hgrId) {
          throw new Error("A machine reference cannot be changed");
        }
      }

      if (data._status === "published") {
        const publishingData = { ...(originalDoc ?? {}), ...data };
        const errors = machinePublicationErrors(publishingData);
        if (errors.length > 0) {
          throw new Error(
            `Complete these fields before publishing: ${errors.join(", ")}.`,
          );
        }
      }

      return data;
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
      name: "archived",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
  ],
};
