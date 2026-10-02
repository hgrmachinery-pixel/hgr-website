import assert from "node:assert/strict";
import test from "node:test";

import { buildRobotsRoute, getIndexingPolicy } from "../src/lib/siteMetadata.ts";

test("staging indexing policy fails closed unless production, explicit opt-in, and a valid origin are present", () => {
  assert.deepEqual(getIndexingPolicy({ nodeEnv: "production", enabled: "true", origin: "https://hgrmachinery.com" }), { index: true, follow: true });
  for (const config of [
    { nodeEnv: "development", enabled: "true", origin: "https://staging.hgrmachinery.com" },
    { nodeEnv: "production", enabled: "false", origin: "https://hgrmachinery.com" },
    { nodeEnv: "production", enabled: "true", origin: undefined },
    { nodeEnv: "production", enabled: "true", origin: "not a URL" },
  ]) {
    assert.equal(getIndexingPolicy(config).index, false);
  }
});

test("robots output is only a crawler directive, not staging authentication or cache denial", () => {
  const policy = getIndexingPolicy({ nodeEnv: "production", enabled: "false", origin: "https://staging.hgrmachinery.com" });
  const robots = buildRobotsRoute(policy, "https://staging.hgrmachinery.com");
  assert.deepEqual(robots.rules, { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/api/machine-documents/file/"] });
  assert.equal(robots.sitemap, undefined);
  assert.deepEqual(Object.keys(policy).sort(), ["follow", "index"]);
});
