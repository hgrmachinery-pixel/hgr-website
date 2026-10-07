import type { CollectionBeforeChangeHook, Field, PayloadRequest } from "payload";
import { sql } from "@payloadcms/db-postgres";

export const inventoryTypes = ["used-machine", "spare-part", "lubricant", "rental-machine", "attachment"] as const;
export type InventoryType = (typeof inventoryTypes)[number];
export type InventoryAvailability = "available" | "reserved" | "sold" | "unavailable" | "enquiry-only";

export function inventoryIdentityFields(options: { referencePrefix: "PART" | "LUBE" }): Field[] {
  return [
    { name: "referenceNumber", label: "HGR Reference", type: "text", required: true, unique: true, index: true, admin: { readOnly: true, position: "sidebar" } },
    { name: "slug", type: "text", required: true, unique: true, admin: { hidden: true, readOnly: true } },
    { name: "name", label: "Item Name", type: "text", required: true, maxLength: 160, index: true },
    { name: "brand", label: "Brand / Maker", type: "text", maxLength: 100, index: true },
    { name: "referencePrefix", type: "text", defaultValue: options.referencePrefix, admin: { hidden: true, readOnly: true } },
  ];
}

export function inventoryDescriptionFields(): Field[] {
  return [
    { name: "shortDescription", type: "textarea", maxLength: 300 },
    { name: "description", type: "textarea", maxLength: 5000 },
  ];
}

export function inventoryAvailabilityPriceFields(availability: InventoryAvailability[]): Field[] {
  return [
    { name: "availability", label: "Availability", type: "select", required: true, defaultValue: "available", options: availability.map((value) => ({ value, label: value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) })) },
    { name: "priceMode", label: "Price Display", type: "select", required: true, defaultValue: "contact", options: [{ label: "Contact for Price", value: "contact" }, { label: "Show Price", value: "public" }] },
    { name: "price", label: "Price (MYR)", type: "number", min: 0, admin: { condition: (_, siblingData: Record<string, unknown>) => siblingData?.priceMode === "public" }, validate: (value: unknown, { siblingData }: { siblingData?: Record<string, unknown> }) => siblingData?.priceMode !== "public" || (typeof value === "number" && Number.isFinite(value) && value >= 0) ? true : "Enter a price or choose Contact for Price." },
    { name: "archived", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
  ];
}

export function inventoryCommonFields(options: { referencePrefix: "PART" | "LUBE"; availability: InventoryAvailability[] }): Field[] {
  return [
    ...inventoryIdentityFields({ referencePrefix: options.referencePrefix }),
    ...inventoryDescriptionFields(),
    ...inventoryAvailabilityPriceFields(options.availability),
    ...inventoryMediaFields(),
    ...inventorySEOFields(),
  ];
}

export function inventorySEOFields(): Field[] {
  return [
    { name: "seoTitle", label: "SEO Title", type: "text", maxLength: 70, admin: { description: "Optional. Otherwise the item name is used." } },
    { name: "seoDescription", label: "SEO Description", type: "textarea", maxLength: 160, admin: { description: "Optional. Otherwise a description is generated from visible item details." } },
  ];
}

export function inventoryMediaFields(): Field[] {
  return [
    { name: "featuredImage", label: "Featured Image", type: "relationship", relationTo: "inventory-media", required: true },
    { name: "gallery", label: "Supporting Photos", type: "relationship", relationTo: "inventory-media", hasMany: true },
  ];
}

export function inventoryPublicationErrors(data: Record<string, unknown>): string[] {
  const errors: string[] = [];
  for (const [key, label] of [["referenceNumber", "HGR Reference"], ["slug", "URL"], ["name", "Item Name"], ["availability", "Availability"]]) {
    if (typeof data[key] !== "string" || !String(data[key]).trim()) errors.push(label);
  }
  const relationId = (value: unknown): string | undefined => {
    const candidate = Array.isArray(value) ? value[0] : value;
    if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);
    if (candidate && typeof candidate === "object") {
      const id = (candidate as { id?: unknown; value?: unknown }).id ?? (candidate as { value?: unknown }).value;
      if (typeof id === "string" || typeof id === "number") return String(id);
    }
    return undefined;
  };
  const featured = relationId(data.featuredImage);
  if (!featured) errors.push("Featured Image");
  if (featured && Array.isArray(data.gallery) && !data.gallery.some((image) => relationId(image) === featured)) errors.push("Featured Image in Supporting Photos");
  if (data.priceMode === "public" && (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price < 0)) errors.push("Price");
  return errors;
}

export function inventoryPublicationHook(typeLabel: string): CollectionBeforeChangeHook {
  return async ({ data, originalDoc }) => {
    if (data._status !== "published") return data;
    const errors = inventoryPublicationErrors({ ...(originalDoc ?? {}), ...data });
    if (errors.length) throw new Error(`Complete these fields before publishing ${typeLabel}: ${errors.join(", ")}.`);
    return data;
  };
}

export async function allocateInventoryIdentity(req: PayloadRequest, sequenceName: "hgr_spare_part_id_seq" | "hgr_lubricant_id_seq", prefix: "PART" | "LUBE", name: unknown) {
  const sequence = await req.payload.db.execute({ drizzle: req.payload.db.drizzle, sql: sql.raw(`SELECT nextval('${sequenceName}') AS value`) });
  const value = sequence.rows[0]?.value;
  if (value === undefined || value === null) throw new Error("Could not allocate an inventory reference");
  const referenceNumber = `${prefix}-${String(value).padStart(6, "0")}`;
  const base = (typeof name === "string" ? name : prefix === "PART" ? "spare-part" : "lubricant").normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90) || prefix.toLowerCase();
  return { referenceNumber, slug: `${base}-${referenceNumber.toLowerCase()}` };
}
