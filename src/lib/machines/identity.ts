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
