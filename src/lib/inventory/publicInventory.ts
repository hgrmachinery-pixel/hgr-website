import type { Payload } from "payload";

export type InventoryKind = "spare-part" | "lubricant";
export type PublicInventoryImage = { id: string | number; url: string; cardUrl?: string; thumbnailUrl?: string; largeUrl?: string; srcSet?: string; altText?: string; focalX?: number; focalY?: number; order: number };
export type PublicInventoryItem = {
  id: string | number;
  type: InventoryKind;
  referenceNumber: string;
  slug: string;
  name: string;
  brand?: string;
  shortDescription?: string;
  description?: string;
  availability: string;
  price?: { mode: "contact" } | { mode: "public"; amount: number };
  featuredImage?: PublicInventoryImage;
  gallery: PublicInventoryImage[];
  category?: string;
  manufacturerPartNumber?: string;
  compatibleMachineBrand?: string;
  compatibleMachineModel?: string;
  compatibilityConfirmed?: boolean;
  condition?: string;
  productCode?: string;
  productType?: string;
  grade?: string;
  packSize?: string;
  seoTitle?: string;
  seoDescription?: string;
  kind: InventoryKind;
};

function relationId(value: unknown): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (!value || typeof value !== "object") return undefined;
  const id = (value as { id?: unknown; value?: unknown }).id ?? (value as { value?: unknown }).value;
  return typeof id === "string" || typeof id === "number" ? id : undefined;
}

function projectMedia(value: unknown, item: Record<string, unknown>, kind: InventoryKind): PublicInventoryImage | undefined {
  if (!value || typeof value !== "object") return undefined;
  const media = value as Record<string, any>;
  if (media.assetKind !== "derivative" || media.reviewStatus !== "approved" || media.processingStatus !== "ready" || media.ownerType !== kind || String(media.ownerId) !== String(item.id) || !media.contentDigest || !media.sourceDigest || !media.sourceMaster || Number(media.revision) < 1) return undefined;
  const url = `/api/inventory-media/file/${encodeURIComponent(String(media.id))}`;
  const text = typeof media.altText === "string" && media.altText.trim() ? media.altText.trim() : `Photo for ${String(item.name ?? "this item")}`;
  return { id: media.id as string | number, url: `${url}?size=large`, cardUrl: `${url}?size=card`, thumbnailUrl: `${url}?size=thumbnail`, largeUrl: `${url}?size=large`, srcSet: [`${url}?size=thumbnail 320w`, `${url}?size=card 640w`, `${url}?size=large 1280w`].join(", "), altText: text, ...(typeof media.focalX === "number" ? { focalX: media.focalX } : {}), ...(typeof media.focalY === "number" ? { focalY: media.focalY } : {}), order: typeof media.order === "number" ? media.order : 0 };
}

function projectItem(raw: Record<string, unknown>, kind: InventoryKind): PublicInventoryItem | null {
  if (raw._status !== "published" || raw.archived === true || typeof raw.referenceNumber !== "string" || typeof raw.slug !== "string" || typeof raw.name !== "string") return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.slug) || !/^[A-Z0-9-]{1,40}$/.test(raw.referenceNumber)) return null;
  const price = raw.priceMode === "public" && typeof raw.price === "number" && Number.isFinite(raw.price) && raw.price >= 0
    ? { mode: "public" as const, amount: raw.price }
    : { mode: "contact" as const };
  const gallerySource = Array.isArray(raw.gallery) ? raw.gallery : [];
  const gallery = gallerySource.map((image) => projectMedia(image, raw, kind)).filter((image): image is PublicInventoryImage => Boolean(image)).sort((a, b) => a.order - b.order);
  const featuredImage = projectMedia(raw.featuredImage, raw, kind);
  return {
    id: relationId(raw.id) ?? raw.referenceNumber,
    type: kind,
    kind,
    referenceNumber: raw.referenceNumber,
    slug: raw.slug,
    name: raw.name,
    ...(typeof raw.brand === "string" ? { brand: raw.brand } : {}),
    ...(typeof raw.shortDescription === "string" ? { shortDescription: raw.shortDescription } : {}),
    ...(typeof raw.description === "string" ? { description: raw.description } : {}),
    availability: typeof raw.availability === "string" ? raw.availability : "unavailable",
    price,
    ...(featuredImage ? { featuredImage } : {}),
    gallery,
    ...copyText(raw, ["category", "manufacturerPartNumber", "compatibleMachineBrand", "compatibleMachineModel", "condition", "productCode", "productType", "grade", "packSize", "seoTitle", "seoDescription"]),
    ...(typeof raw.compatibilityConfirmed === "boolean" ? { compatibilityConfirmed: raw.compatibilityConfirmed } : {}),
  };
}

function copyText(source: Record<string, unknown>, keys: string[]): Partial<PublicInventoryItem> {
  const result: Record<string, string> = {};
  for (const key of keys) if (typeof source[key] === "string" && (source[key] as string).trim()) result[key] = (source[key] as string).trim();
  return result;
}

export async function getPublicInventoryItems(kind: InventoryKind) {
  const collection = kind === "spare-part" ? "spare-parts" : "lubricants";
  try {
    const [{ default: config }, { getPayload }] = await Promise.all([import("@payload-config"), import("payload")]);
    const payload: Payload = await getPayload({ config });
    const result = await payload.find({ collection, where: { and: [{ _status: { equals: "published" } }, { archived: { not_equals: true } }] }, limit: 500, page: 1, depth: 2, overrideAccess: false, sort: "referenceNumber" });
    return { items: result.docs.map((doc) => projectItem(doc as unknown as Record<string, unknown>, kind)).filter((item): item is PublicInventoryItem => Boolean(item)), unavailable: false };
  } catch {
    return { items: [] as PublicInventoryItem[], unavailable: true };
  }
}

export async function getPublicInventoryItem(kind: InventoryKind, slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { item: null, unavailable: false };
  const collection = kind === "spare-part" ? "spare-parts" : "lubricants";
  try {
    const [{ default: config }, { getPayload }] = await Promise.all([import("@payload-config"), import("payload")]);
    const payload: Payload = await getPayload({ config });
    const result = await payload.find({ collection, where: { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }, { archived: { not_equals: true } }] }, limit: 2, page: 1, depth: 2, overrideAccess: false });
    if (result.docs.length !== 1) return { item: null, unavailable: false };
    return { item: projectItem(result.docs[0] as unknown as Record<string, unknown>, kind), unavailable: false };
  } catch {
    return { item: null, unavailable: true };
  }
}
