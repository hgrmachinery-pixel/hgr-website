import type { MetadataRoute } from "next";
import { getPublicMachines } from "@/lib/machines/publicQueries";
import { buildPublicSitemap, getIndexingPolicy, getPublicOrigin } from "@/lib/siteMetadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const policy = getIndexingPolicy();
  const origin = getPublicOrigin();
  if (!policy.index || !origin) return [];

  const { machines } = await getPublicMachines();
  return buildPublicSitemap(policy, origin, machines);
}
