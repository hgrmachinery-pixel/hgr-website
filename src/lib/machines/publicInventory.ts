import { projectPublicMachine, type PublicMachine } from "./publicProjection.ts";

export { projectPublicMachine } from "./publicProjection.ts";

export type InventoryStatus = PublicMachine["stockStatus"];

export type InventoryFilters = {
  query: string;
  brand?: string;
  status?: InventoryStatus;
  page: number;
};

export type PublicImageCandidate = {
  url: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  largeUrl?: string;
  thumbnailWidth?: number;
  cardWidth?: number;
  largeWidth?: number;
  altText?: string;
  category?: string;
  order?: number;
  assetKind?: string;
  processingStatus?: string;
  review?: { status?: string };
};

const statusOrder: Record<InventoryStatus, number> = { available: 0, reserved: 1, sold: 2 };
const validStatuses = new Set<InventoryStatus>(["available", "reserved", "sold"]);
const safeRelativeImage = /^\/api\/machine-media\/file\/[A-Za-z0-9._-]+$/;

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim().toLocaleLowerCase("en") : "";
}

export function projectPublicInventoryMachine(document: Record<string, unknown>): (PublicMachine & { id: string | number }) | null {
  const machine = projectPublicMachine(document);
  const id = document.id;
  if (!machine || typeof id !== "string" && typeof id !== "number") return null;
  return { ...machine, id };
}

export function getRelationId(value: unknown): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (!value || typeof value !== "object") return undefined;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" || typeof id === "number" ? id : undefined;
}

export function normalizeInventoryFilters(params: Record<string, unknown>): InventoryFilters {
  const rawPage = typeof params.page === "string" || typeof params.page === "number" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 10_000) : 1;
  const rawStatus = normalize(params.status) as InventoryStatus;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const brand = typeof params.brand === "string" ? params.brand.trim().slice(0, 80) : "";
  return {
    query,
    ...(brand ? { brand } : {}),
    ...(validStatuses.has(rawStatus) ? { status: rawStatus } : {}),
    page,
  };
}

export function sortPublicMachines<T extends Pick<PublicMachine, "hgrId" | "stockStatus">>(machines: readonly T[]): T[] {
  return [...machines].sort((a, b) => statusOrder[a.stockStatus] - statusOrder[b.stockStatus] || a.hgrId.localeCompare(b.hgrId));
}

export function filterPublicMachines<T extends PublicMachine>(machines: readonly T[], filters: InventoryFilters): T[] {
  const query = normalize(filters.query);
  const brand = normalize(filters.brand);
  return machines.filter((machine) => {
    if (filters.status && machine.stockStatus !== filters.status) return false;
    if (brand && normalize(machine.brand) !== brand) return false;
    if (query && !`${machine.brand ?? ""} ${machine.model ?? ""}`.toLocaleLowerCase("en").includes(query)) return false;
    return true;
  });
}

export function getAvailableHomepageMachines<T extends PublicMachine>(machines: readonly T[], limit = 6): T[] {
  const safeLimit = Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, 6) : 6;
  return sortPublicMachines(machines.filter((machine) => machine.stockStatus === "available")).slice(0, safeLimit);
}

export function paginateMachines<T>(items: readonly T[], requestedPage: number, requestedSize = 12) {
  const pageSize = Number.isSafeInteger(requestedSize) && requestedSize > 0 ? Math.min(requestedSize, 24) : 12;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, totalPages) : 1;
  return { page, pageSize, totalPages, items: items.slice((page - 1) * pageSize, page * pageSize) };
}

export function getPublicImageURL(value: unknown, deliveryVerified = false): string | undefined {
  const url = text(value);
  if (!url || !safeRelativeImage.test(url)) return undefined;
  if (!deliveryVerified) return undefined;
  return url;
}

export function projectPublicImage(value: unknown, deliveryVerified = false): PublicImageCandidate | undefined {
  if (!value || typeof value !== "object") return undefined;
  const image = value as Record<string, unknown>;
  const sizes = image.sizes && typeof image.sizes === "object" ? image.sizes as Record<string, unknown> : {};
  const thumbnail = sizes.thumbnail && typeof sizes.thumbnail === "object" ? sizes.thumbnail as Record<string, unknown> : {};
  const card = sizes.card && typeof sizes.card === "object" ? sizes.card as Record<string, unknown> : {};
  const large = sizes.large && typeof sizes.large === "object" ? sizes.large as Record<string, unknown> : {};
  // This helper is called only for a relationship that Payload has returned
  // through the published Machine record's media read access. Each byte request
  // is independently re-authorized by publicMachineMediaAccess.
  const thumbnailUrl = getPublicImageURL(thumbnail.url, deliveryVerified);
  const cardUrl = getPublicImageURL(card.url, deliveryVerified);
  const largeUrl = getPublicImageURL(large.url, deliveryVerified);
  const actualWidth = (size: Record<string, unknown>) =>
    typeof size.width === "number" && Number.isSafeInteger(size.width) && size.width > 0 ? size.width : undefined;
  const url = cardUrl ?? largeUrl ?? thumbnailUrl;
  if (!url) return undefined;
  return {
    url,
    ...(typeof image.altText === "string" ? { altText: image.altText } : {}),
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    ...(cardUrl ? { cardUrl } : {}),
    ...(largeUrl ? { largeUrl } : {}),
    ...(actualWidth(thumbnail) ? { thumbnailWidth: actualWidth(thumbnail) } : {}),
    ...(actualWidth(card) ? { cardWidth: actualWidth(card) } : {}),
    ...(actualWidth(large) ? { largeWidth: actualWidth(large) } : {}),
    ...(text(image.category) ? { category: text(image.category) } : {}),
    ...(typeof image.order === "number" && Number.isFinite(image.order) ? { order: image.order } : {}),
  };
}

export function publicImageSrcSet(image: PublicImageCandidate): string | undefined {
  const sources = [
    image.thumbnailUrl && image.thumbnailWidth ? `${image.thumbnailUrl} ${image.thumbnailWidth}w` : undefined,
    image.cardUrl && image.cardWidth ? `${image.cardUrl} ${image.cardWidth}w` : undefined,
    image.largeUrl && image.largeWidth ? `${image.largeUrl} ${image.largeWidth}w` : undefined,
  ].filter((source): source is string => Boolean(source));
  return sources.length ? sources.join(", ") : undefined;
}

export function projectPublicMachineWithMedia(document: Record<string, unknown>, deliveryVerified: boolean) {
  const machine = projectPublicInventoryMachine(document);
  if (!machine) return null;
  const featuredRelation = document.featuredImage;
  const galleryRelations = Array.isArray(document.gallery) ? document.gallery : [];
  const relations = [featuredRelation, ...galleryRelations].filter(Boolean);
  const seen = new Set<string>();
  const images: PublicImageCandidate[] = [];
  let featuredImage: PublicImageCandidate | undefined;
  for (const relation of relations) {
    if (!relation || typeof relation !== "object") continue;
    const image = projectPublicImage(relation, deliveryVerified);
    const id = getRelationId(relation);
    if (!image || id === undefined || seen.has(String(id))) continue;
    seen.add(String(id));
    images.push(image);
    if (getRelationId(featuredRelation) === id) featuredImage = image;
  }
  images.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return { ...machine, images, featuredImage };
}

export function resolvePublicMachineSlug<T extends { id: string | number; slug: string; previousSlugs?: unknown; _status?: unknown; archived?: unknown }>(
  machines: readonly T[],
  slug: string,
): T | undefined {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
  const matches = machines.filter((machine) => machine._status === "published" && machine.archived !== true &&
    (machine.slug === slug || Array.isArray(machine.previousSlugs) && machine.previousSlugs.includes(slug)));
  return matches.length === 1 ? matches[0] : undefined;
}

export function inventoryBrandOptions(machines: readonly PublicMachine[]): string[] {
  return [...new Set(machines.map((machine) => text(machine.brand)).filter((brand): brand is string => Boolean(brand)))].sort((a, b) => a.localeCompare(b));
}

export function publicMachinePath(slug: string): string {
  return `/machines/${encodeURIComponent(slug)}`;
}
