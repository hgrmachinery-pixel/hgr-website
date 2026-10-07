import type { MetadataRoute } from "next";
import { getPublicMachines } from "@/lib/machines/publicQueries";
import { buildPublicSitemap, getIndexingPolicy, getPublicOrigin } from "@/lib/siteMetadata";
import { getPublicInventoryItems } from "@/lib/inventory/publicInventory";
import { buildInventorySitemapEntries } from "@/lib/siteMetadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const policy = getIndexingPolicy();
  const origin = getPublicOrigin();
  if (!policy.index || !origin) return [];

  const [{ machines }, { items: spareParts }, { items: lubricants }] = await Promise.all([
    getPublicMachines(), getPublicInventoryItems("spare-part"), getPublicInventoryItems("lubricant"),
  ]);
  return [...buildPublicSitemap(policy, origin, machines), ...buildInventorySitemapEntries(policy, origin, [
    ...spareParts.map(({ slug }) => ({ kind: "spare-part" as const, slug })),
    ...lubricants.map(({ slug }) => ({ kind: "lubricant" as const, slug })),
  ])];
}
