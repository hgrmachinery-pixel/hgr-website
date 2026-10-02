import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const machine = {
  hgrId: "HGR-000028",
  slug: "komatsu-pc200-hgr-000028",
  reference: "HGR-000028",
  brand: "Komatsu",
  model: "PC200",
  year: 2018,
  stockStatus: "available",
  price: { mode: "public", amount: 350000 },
  featuredImage: { url: "/media/pc200.webp", alt: "Komatsu PC200 excavator" },
};

test("shared SEO helpers exist for validated origins and machine metadata", async () => {
  const { getPublicOrigin, buildMachineMetadata } = await import("../src/lib/siteMetadata.ts");
  assert.equal(getPublicOrigin("https://hgrmachinery.com"), "https://hgrmachinery.com");
  assert.equal(typeof buildMachineMetadata, "function");
});

test("public origin accepts only credential-free HTTP(S) origins", async () => {
  const { getPublicOrigin } = await import("../src/lib/siteMetadata.ts");
  assert.equal(getPublicOrigin("https://hgrmachinery.com"), "https://hgrmachinery.com");
  for (const value of [undefined, "not a URL", "ftp://hgrmachinery.com", "https://user:pass@hgrmachinery.com", "https://hgrmachinery.com/path?x=1"]) {
    assert.equal(getPublicOrigin(value), undefined);
  }
});

test("indexing fails closed unless production and explicit opt-in are both set", async () => {
  const { getIndexingPolicy } = await import("../src/lib/siteMetadata.ts");
  assert.equal(getIndexingPolicy({ nodeEnv: "production", enabled: "true", origin: "https://hgrmachinery.com" }).index, true);
  for (const config of [
    { nodeEnv: "development", enabled: "true", origin: "https://hgrmachinery.com" },
    { nodeEnv: "production", enabled: "false", origin: "https://hgrmachinery.com" },
    { nodeEnv: "production", enabled: "true", origin: undefined },
  ]) assert.equal(getIndexingPolicy(config).index, false);
});

test("machine metadata and schema use only visible projected facts and stable slug", async () => {
  const { buildMachineMetadata, buildMachineStructuredData } = await import("../src/lib/siteMetadata.ts");
  const metadata = buildMachineMetadata(machine, "https://hgrmachinery.com");
  assert.equal(metadata.title, "2018 Komatsu PC200 — HGR-000028");
  assert.equal(metadata.alternates.canonical, "https://hgrmachinery.com/machines/komatsu-pc200-hgr-000028");
  const json = buildMachineStructuredData(machine, "https://hgrmachinery.com");
  assert.equal(json.url, metadata.alternates.canonical);
  assert.equal("offers" in json, true);
  assert.equal("aggregateRating" in json, false);

  const sold = buildMachineStructuredData({ ...machine, stockStatus: "sold", price: undefined, serialNumber: "PRIVATE" }, "https://hgrmachinery.com");
  assert.equal(sold.availability, "https://schema.org/OutOfStock");
  assert.equal("offers" in sold, false);
  assert.equal(JSON.stringify(sold).includes("PRIVATE"), false);
  assert.equal(JSON.stringify(sold).includes("/media/pc200.webp"), false);
});

test("JSON-LD escapes markup-significant characters", async () => {
  const { serializeJsonLd } = await import("../src/lib/siteMetadata.ts");
  const encoded = serializeJsonLd({ name: "</script><img src=x> & \u2028" });
  assert.doesNotMatch(encoded, /<|>|&|\u2028/);
  assert.match(encoded, /\\u003c/);
});
