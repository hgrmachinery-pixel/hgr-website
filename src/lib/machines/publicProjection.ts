import { youtubeEmbedURL } from "./video.ts";

export type PublicMachine = {
  hgrId: string;
  slug: string;
  reference: string;
  category?: string;
  brand?: string;
  model?: string;
  year?: number;
  hours?: number;
  engine?: string;
  operatingWeight?: string;
  condition?: string;
  countryOfOrigin?: string;
  machineOriginStatus?: string;
  registrationDate?: string;
  description?: string;
  videoUrl?: string;
  stockStatus: "available" | "reserved" | "sold";
  price?: { mode: "contact" } | { mode: "public"; amount: number };
  serialNumber?: string;
};

type MachineDocument = Record<string, unknown>;

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function projectPublicMachine(document: MachineDocument): PublicMachine | null {
  const hgrId = optionalString(document.hgrId);
  const slug = optionalString(document.slug);
  const stockStatus = document.stockStatus;
  if (
    document._status !== "published" ||
    document.archived === true ||
    !hgrId ||
    !slug ||
    !/^HGR-[0-9]{6,}$/i.test(hgrId) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !slug.endsWith(hgrId.toLowerCase()) ||
    !["available", "reserved", "sold"].includes(String(stockStatus))
  ) {
    return null;
  }

  const projection: PublicMachine = {
    hgrId,
    slug,
    reference: hgrId,
    stockStatus: stockStatus as PublicMachine["stockStatus"],
  };

  const stringFields = [
    "category",
    "brand",
    "model",
    "engine",
    "operatingWeight",
    "condition",
    "countryOfOrigin",
    "machineOriginStatus",
    "registrationDate",
    "description",
  ] as const;
  for (const field of stringFields) {
    const value = optionalString(document[field]);
    if (value !== undefined) projection[field] = value;
  }

  const year = optionalNumber(document.year);
  const hours = optionalNumber(document.hours);
  if (year !== undefined) projection.year = year;
  if (hours !== undefined) projection.hours = hours;

  if (document.priceMode === "contact") {
    projection.price = { mode: "contact" };
  } else if (document.priceMode === "public") {
    const amount = optionalNumber(document.price);
    if (amount !== undefined && amount >= 0) projection.price = { mode: "public", amount };
  }

  const serialNumber = optionalString(document.serialNumber);
  if (document.showSerialPublicly === true && serialNumber) {
    projection.serialNumber = serialNumber;
  }

  const videoUrl = youtubeEmbedURL(document.videoUrl);
  if (videoUrl) projection.videoUrl = videoUrl;

  return projection;
}
