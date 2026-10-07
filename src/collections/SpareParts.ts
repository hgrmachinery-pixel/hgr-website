import type { CollectionConfig } from "payload";
import { staffAccess, denyAccess, isStaffUser } from "../lib/machines/access";
import { allocateInventoryIdentity, inventoryAvailabilityPriceFields, inventoryDescriptionFields, inventoryIdentityFields, inventoryMediaFields, inventoryPublicationHook, inventorySEOFields } from "../lib/inventory/fields";
import { validateInventoryPublicationMedia } from "../lib/inventory/media-server";

const publicRead = ({ req }: { req: { user?: unknown } }) => isStaffUser(req.user) ? true : { _status: { equals: "published" }, archived: { not_equals: true } };

export const SpareParts: CollectionConfig = {
  slug: "spare-parts",
  labels: { singular: "Spare Part", plural: "Spare Parts" },
  admin: { useAsTitle: "name", defaultColumns: ["referenceNumber", "name", "brand", "availability", "updatedAt"], components: { edit: { beforeDocumentControls: ["@/components/payload/InventoryMediaUploader#InventoryMediaUploader"] } } },
  disableDuplicate: true,
  access: { create: staffAccess, read: publicRead, update: staffAccess, delete: denyAccess, readVersions: staffAccess },
  versions: { drafts: true, maxPerDoc: 100 },
  hooks: {
    beforeValidate: [async ({ data, operation, req }) => {
      if (!data) return data;
      if (operation === "create") {
        Object.assign(data, await allocateInventoryIdentity(req, "hgr_spare_part_id_seq", "PART", data.name));
      }
      return data;
    }],
    beforeChange: [inventoryPublicationHook("this spare part"), validateInventoryPublicationMedia],
  },
  fields: [
    ...inventoryIdentityFields({ referencePrefix: "PART" }),
    { name: "category", label: "Part Category", type: "text", maxLength: 100 },
    { name: "manufacturerPartNumber", label: "Manufacturer Part Number", type: "text", maxLength: 120 },
    { name: "compatibleMachineBrand", label: "Compatible Machine Brand", type: "text", maxLength: 100 },
    { name: "compatibleMachineModel", label: "Compatible Machine Model", type: "text", maxLength: 120 },
    { name: "compatibilityConfirmed", label: "Compatibility confirmed by HGR", type: "checkbox", defaultValue: false },
    { name: "condition", type: "select", options: ["new", "used", "reconditioned"].map((value) => ({ label: value[0]!.toUpperCase() + value.slice(1), value })) },
    ...inventoryDescriptionFields(),
    ...inventoryAvailabilityPriceFields(["available", "reserved", "sold", "unavailable"]),
    ...inventoryMediaFields(),
    ...inventorySEOFields(),
  ],
};
