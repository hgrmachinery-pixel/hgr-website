import type { MetadataRoute } from "next";
import { buildRobotsRoute, getIndexingPolicy, getPublicOrigin } from "@/lib/siteMetadata";

export default function robots(): MetadataRoute.Robots {
  const policy = getIndexingPolicy();
  return buildRobotsRoute(policy, getPublicOrigin());
}
