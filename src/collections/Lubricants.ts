import type { CollectionConfig } from "payload";
import { staffAccess, denyAccess, isStaffUser } from "../lib/machines/access";
import { allocateInventoryIdentity, inventoryAvailabilityPriceFields, inventoryDescriptionFields, inventoryIdentityFields, inventoryMediaFields, inventoryPublicationHook, inventorySEOFields } from "../lib/inventory/fields";
import { validateInventoryPublicationMedia } from "../lib/inventory/media-server";

const publicRead = ({ req }: { req: { user?: unknown } }) => isStaffUser(req.user) ? true : { _status: { equals: "published" }, archived: { not_equals: true } };

export const Lubricants: CollectionConfig = {
  slug: "lubricants",
  labels: { singular: "Lubricant", plural: "Lubricants" },
  admin: { useAsTitle: "name", defaultColumns: ["referenceNumber", "name", "brand", "availability", "updatedAt"], components: { edit: { beforeDocumentControls: ["@/components/payload/InventoryMediaUploader#InventoryMediaUploader"] } } },
  disableDuplicate: true,
  access: { create: staffAccess, read: publicRead, update: staffAccess, delete: denyAccess, readVersions: staffAccess },
  versions: { drafts: true, maxPerDoc: 100 },
  hooks: {
    beforeValidate: [async ({ data, operation, req }) => {
      if (!data) return data;
      if (operation === "create") {
        Object.assign(data, await allocateInventoryIdentity(req, "hgr_lubricant_id_seq", "LUBE", data.name));
      }
      return data;
    }],
    beforeChange: [inventoryPublicationHook("this lubricant"), validateInventoryPublicationMedia],
  },
  fields: [
    ...inventoryIdentityFields({ referencePrefix: "LUBE" }),
    { name: "productCode", label: "Product Code", type: "text", maxLength: 120 },
    { name: "productType", label: "Product Type / Application", type: "text", maxLength: 160 },
    { name: "grade", label: "Grade / Specification", type: "text", maxLength: 120 },
    { name: "packSize", label: "Pack Size", type: "text", maxLength: 100 },
    { name: "compatibleMachineBrand", label: "Compatible Machine Brand", type: "text", maxLength: 100 },
    { name: "compatibleMachineModel", label: "Compatible Machine Model", type: "text", maxLength: 120 },
    { name: "compatibilityConfirmed", label: "Compatibility confirmed by HGR", type: "checkbox", defaultValue: false },
    ...inventoryDescriptionFields(),
    ...inventoryAvailabilityPriceFields(["available", "unavailable", "enquiry-only"]),
    ...inventoryMediaFields(),
    ...inventorySEOFields(),
  ],
};
