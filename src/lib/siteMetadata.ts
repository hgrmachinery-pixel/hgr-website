import type { Metadata, MetadataRoute } from "next";
import { getPublicImageURL, publicMachinePath, type PublicImageCandidate } from "./machines/publicInventory.ts";

type IndexingEnvironment = {
  nodeEnv?: string;
  enabled?: string;
  origin?: string;
};

type PublicIndexingPolicy = { index: boolean; follow: boolean };

type MachineForMetadata = {
  hgrId: string;
  slug: string;
  reference: string;
  brand?: string;
  model?: string;
  year?: number;
  description?: string;
  stockStatus: "available" | "reserved" | "sold";
  price?: { mode: "contact" } | { mode: "public"; amount: number };
  featuredImage?: PublicImageCandidate;
};

export function getPublicOrigin(value: string | undefined = process.env.SERVER_URL): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

export function getIndexingPolicy(environment: IndexingEnvironment = {
  nodeEnv: process.env.NODE_ENV,
  enabled: process.env.HGR_PUBLIC_INDEXING_ENABLED,
  origin: process.env.SERVER_URL,
}) {
  const index = environment.nodeEnv === "production" && environment.enabled === "true" && Boolean(getPublicOrigin(environment.origin));
  return { index, follow: true } satisfies NonNullable<Metadata["robots"]>;
}

export function getSiteMetadataBase(): URL | undefined {
  const origin = getPublicOrigin();
  return origin ? new URL(origin) : undefined;
}

const publicSitemapPaths = [
  "/",
  "/used-excavators",
  "/about",
  "/contact",
  "/rental",
  "/repair-services",
  "/spare-parts",
  "/lubricants",
] as const;

export function buildRobotsRoute(
  policy: PublicIndexingPolicy,
  origin: string | undefined,
): MetadataRoute.Robots {
  const safeOrigin = getPublicOrigin(origin);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/api/machine-documents/file/"],
    },
    ...(policy.index && safeOrigin ? { sitemap: `${safeOrigin}/sitemap.xml` } : {}),
  };
}

export function buildPublicSitemap(
  policy: PublicIndexingPolicy,
  origin: string | undefined,
  machines: readonly { slug: string; stockStatus: unknown }[],
): MetadataRoute.Sitemap {
  const safeOrigin = getPublicOrigin(origin);
  if (!policy.index || !safeOrigin) return [];

  const entries: MetadataRoute.Sitemap = publicSitemapPaths.map((path) => ({ url: new URL(path, safeOrigin).toString() }));
  for (const machine of machines) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(machine.slug) || !["available", "reserved", "sold"].includes(String(machine.stockStatus))) continue;
    entries.push({ url: new URL(publicMachinePath(machine.slug), safeOrigin).toString() });
  }
  return entries;
}

export function buildInventorySitemapEntries(
  policy: PublicIndexingPolicy,
  origin: string | undefined,
  items: readonly { kind: "spare-part" | "lubricant"; slug: string }[],
): MetadataRoute.Sitemap {
  const safeOrigin = getPublicOrigin(origin);
  if (!policy.index || !safeOrigin) return [];
  return items.filter(({ kind, slug }) => (kind === "spare-part" || kind === "lubricant") && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    .map(({ kind, slug }) => ({ url: new URL(`/${kind === "spare-part" ? "spare-parts" : "lubricants"}/${slug}`, safeOrigin).toString() }));
}

export function buildRouteMetadata({
  title,
  description,
  path,
  origin,
  robots,
}: {
  title: string;
  description: string;
  path: string;
  origin?: string;
  robots: Metadata["robots"];
}): Metadata {
  const canonical = origin ? new URL(path, origin).toString() : undefined;
  return {
    title,
    description: normalizeDescription(description),
    robots,
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

export function buildInventoryMetadata(
  searchParams: Record<string, string | string[] | undefined>,
  origin: string | undefined,
  robots: Metadata["robots"],
): Metadata {
  const filtered = ["q", "brand", "status", "page"].some((key) => searchParams[key] !== undefined);
  return buildRouteMetadata({
    title: "Used Excavators",
    description: "Browse excavators by brand, model and current stock status. Machine information is shown as entered by HGR.",
    path: "/used-excavators",
    origin,
    robots: filtered ? { index: false, follow: true } : robots,
  });
}

export function buildSupportingPageMetadata({
  slug,
  title,
  visibleText,
  fallbackDescription,
  origin,
  robots,
}: {
  slug: string;
  title: string;
  visibleText: string;
  fallbackDescription: string;
  origin?: string;
  robots: Metadata["robots"];
}): Metadata | null {
  const legal = slug === "privacy-policy" || slug === "website-terms";
  if (legal && !visibleText.trim()) return null;
  return buildRouteMetadata({
    title,
    description: visibleText.trim() || fallbackDescription,
    path: `/${slug}`,
    origin,
    robots,
  });
}

export function buildMachineMetadata(machine: MachineForMetadata, origin?: string): Metadata {
  const name = machineName(machine);
  const description = machine.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    `${name}. Reference ${machine.reference}. Current status: ${statusText(machine.stockStatus)}.`;
  const canonical = origin ? new URL(publicMachinePath(machine.slug), origin).toString() : undefined;
  const featuredLargeImage = machine.featuredImage && typeof machine.featuredImage.altText === "string"
    ? getPublicImageURL(machine.featuredImage.largeUrl, true)
    : undefined;
  const shareImage = featuredLargeImage
    ? { url: origin ? new URL(featuredLargeImage, origin).toString() : featuredLargeImage, alt: machine.featuredImage?.altText ?? "" }
    : undefined;
  return {
    title: name,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      type: "website",
      title: name,
      description,
      ...(canonical ? { url: canonical } : {}),
      ...(shareImage ? { images: [shareImage] } : {}),
    },
    ...(shareImage ? { twitter: { card: "summary_large_image", images: [shareImage] } } : {}),
  };
}

export function buildMachineStructuredData(machine: MachineForMetadata, origin: string) {
  const url = new URL(publicMachinePath(machine.slug), origin).toString();
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: machineName(machine),
    identifier: machine.reference,
    url,
    category: "Used excavator",
    availability: availability(machine.stockStatus),
  };

  if (machine.description?.trim()) schema.description = machine.description.trim();
  if (machine.stockStatus === "available" && machine.price?.mode === "public") {
    schema.offers = {
      "@type": "Offer",
      url,
      price: machine.price.amount,
      priceCurrency: "MYR",
      availability: availability(machine.stockStatus),
    };
  }
  return schema;
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function machineName(machine: MachineForMetadata): string {
  const description = [machine.year, machine.brand, machine.model].filter(Boolean).join(" ");
  return `${description || `Excavator ${machine.reference}`} — ${machine.reference}`;
}

function statusText(status: MachineForMetadata["stockStatus"]): string {
  return status[0].toUpperCase() + status.slice(1);
}

function availability(status: MachineForMetadata["stockStatus"]): string {
  return status === "available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
}

function normalizeDescription(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 160);
}
