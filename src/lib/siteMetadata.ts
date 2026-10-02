import type { Metadata } from "next";
import { publicMachinePath } from "./machines/publicInventory.ts";

type IndexingEnvironment = {
  nodeEnv?: string;
  enabled?: string;
  origin?: string;
};

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

export function buildMachineMetadata(machine: MachineForMetadata, origin?: string): Metadata {
  const name = machineName(machine);
  const description = machine.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    `${name}. Reference ${machine.reference}. Current status: ${statusText(machine.stockStatus)}.`;
  const canonical = origin ? new URL(publicMachinePath(machine.slug), origin).toString() : undefined;
  return {
    title: name,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      type: "website",
      title: name,
      description,
      ...(canonical ? { url: canonical } : {}),
    },
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
