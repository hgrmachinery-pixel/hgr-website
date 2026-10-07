import type { InventoryType } from "./fields";

export type InventoryMediaCategory = "featured" | "item" | "label-details" | "other";
export type InventoryMediaReviewStatus = "needs-review" | "approved" | "rejected";
export const inventoryMediaReviewChecklist = ["imageQuality", "sensitiveIdentifiers", "personalInformation", "customerInformation", "accurateAltText"] as const;

export type InventoryMediaOwner = { type: Exclude<InventoryType, "used-machine">; id: string | number };
export type InventoryMediaReference = {
  id: string | number;
  owner: InventoryMediaOwner;
  category: InventoryMediaCategory;
  reviewStatus: InventoryMediaReviewStatus;
  derivativeId?: string | number;
  altText?: string;
  focalPoint?: { x: number; y: number };
  order: number;
};

/** Adapter boundary for new-type media. MachineMedia remains on its protected machine-specific workflow. */
export interface InventoryMediaProvider {
  createMaster(owner: InventoryMediaOwner, category: InventoryMediaCategory, file: File): Promise<InventoryMediaReference>;
  process(reference: InventoryMediaReference): Promise<InventoryMediaReference>;
  review(reference: InventoryMediaReference, status: InventoryMediaReviewStatus): Promise<InventoryMediaReference>;
  publicURL(reference: InventoryMediaReference): Promise<string | null>;
}

export const inventoryMediaCategories = [
  { label: "Featured", value: "featured" },
  { label: "Product / Item", value: "item" },
  { label: "Label / Details", value: "label-details" },
  { label: "Other", value: "other" },
] as const;
