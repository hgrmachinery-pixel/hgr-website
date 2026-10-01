export function formatMachineId(sequence: number | bigint): string {
  const value = BigInt(sequence);
  if (value < 1n) {
    throw new RangeError("Machine sequence must be a positive integer");
  }

  return `HGR-${value.toString().padStart(6, "0")}`;
}

export function createMachineSlug(
  facts: { brand?: string | null; model?: string | null; year?: number | null },
  machineId: string,
): string {
  const description = [facts.year, facts.brand, facts.model]
    .filter((part) => part !== undefined && part !== null && String(part).trim())
    .join(" ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const idSuffix = machineId.toLowerCase();
  return `${description || "machine"}-${idSuffix}`;
}

export function machinePath(slug: string): string {
  return `/machines/${slug}`;
}

export function hasMachineIdSuffix(slug: string, machineId: string): boolean {
  return slug.toLowerCase().endsWith(`-${machineId.toLowerCase()}`);
}

export function appendHistoricalSlug(
  previousSlugs: string[],
  currentSlug: string | undefined,
  nextSlug: string | undefined,
): string[] {
  if (!currentSlug || !nextSlug || currentSlug === nextSlug) return previousSlugs;
  return previousSlugs.includes(currentSlug)
    ? previousSlugs
    : [...previousSlugs, currentSlug];
}

function relationshipId(value: unknown): string | null {
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (!value || typeof value !== "object") return null;
  if ("id" in value && (typeof value.id === "number" || typeof value.id === "string")) {
    return String(value.id);
  }
  if ("value" in value) {
    return relationshipId(value.value);
  }
  return null;
}

export function machinePublicationErrors(data: Record<string, unknown>): string[] {
  const gallery = Array.isArray(data.gallery) ? data.gallery : [];
  const galleryIds = new Set(
    gallery.map(relationshipId).filter((id): id is string => id !== null),
  );
  const featuredId = relationshipId(data.featuredImage);
  const missing = [
    ["HGR Reference", data.hgrId],
    ["Category", data.category],
    ["Brand", data.brand],
    ["Model", data.model],
    ["Stock Status", data.stockStatus],
    ["Featured Image", featuredId],
  ]
    .filter(([, value]) => typeof value !== "string" || value.trim() === "")
    .map(([label]) => label as string);

  if (featuredId && !galleryIds.has(featuredId)) {
    missing.push("Featured Image in Gallery");
  }

  return missing;
}

export function validateMachinePrice(value: unknown, priceMode: unknown): true | string {
  if (
    priceMode === "public" &&
    (typeof value !== "number" || !Number.isFinite(value) || value < 0)
  ) {
    return "Enter a valid price or choose another price display option.";
  }
  return true;
}
