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

test("robots builder keeps pages crawlable while withholding sitemap until indexing is enabled", async () => {
  const { buildRobotsRoute } = await import("../src/lib/siteMetadata.ts");
  const closed = buildRobotsRoute({ index: false, follow: true }, "https://hgrmachinery.com");
  assert.deepEqual(closed.rules, { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/api/machine-documents/file/"] });
  assert.equal(closed.sitemap, undefined);
  const enabled = buildRobotsRoute({ index: true, follow: true }, "https://hgrmachinery.com");
  assert.equal(enabled.sitemap, "https://hgrmachinery.com/sitemap.xml");
  assert.deepEqual(enabled.rules, closed.rules);
  assert.equal(buildRobotsRoute({ index: true, follow: true }, "https://user:pass@hgrmachinery.com").sitemap, undefined);
});

test("public sitemap builder emits only fixed routes and published machine paths when indexing is enabled", async () => {
  const { buildPublicSitemap } = await import("../src/lib/siteMetadata.ts");
  const machines = [
    { slug: "sold-pc200", stockStatus: "sold" },
    { slug: "available-pc210", stockStatus: "available" },
    { slug: "draft-private", stockStatus: "draft" },
  ];
  const entries = buildPublicSitemap({ index: true, follow: true }, "https://hgrmachinery.com", machines);
  assert.deepEqual(entries.map((entry) => entry.url), [
    "https://hgrmachinery.com/",
    "https://hgrmachinery.com/used-excavators",
    "https://hgrmachinery.com/about",
    "https://hgrmachinery.com/contact",
    "https://hgrmachinery.com/rental",
    "https://hgrmachinery.com/machinery-services",
    "https://hgrmachinery.com/lubricants",
    "https://hgrmachinery.com/machines/sold-pc200",
    "https://hgrmachinery.com/machines/available-pc210",
  ]);
  assert.deepEqual(buildPublicSitemap({ index: false, follow: true }, "https://hgrmachinery.com", machines), []);
  assert.deepEqual(buildPublicSitemap({ index: true, follow: true }, undefined, machines), []);
  assert.equal(buildPublicSitemap({ index: true, follow: true }, "https://hgrmachinery.com", [
    { slug: "invalid/slug?status=sold", stockStatus: "sold" },
  ]).length, 7);
  assert.equal(buildPublicSitemap({ index: true, follow: true }, "https://hgrmachinery.com", []).length, 7);
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

test("route metadata helpers exist for home, inventory and supporting pages", async () => {
  const source = await readFile(new URL("../src/lib/siteMetadata.ts", import.meta.url), "utf8");
  assert.match(source, /export function buildRouteMetadata/);
  assert.match(source, /export function buildInventoryMetadata/);
  assert.match(source, /export function buildSupportingPageMetadata/);
});

test("home and inventory have distinct factual metadata and stable canonicals", async () => {
  const { buildRouteMetadata } = await import("../src/lib/siteMetadata.ts");
  const origin = "https://hgrmachinery.com";
  const home = buildRouteMetadata({ title: "Used Excavators", description: "Browse HGR’s used excavator inventory.", path: "/", origin, robots: { index: true, follow: true } });
  const inventory = buildRouteMetadata({ title: "Used Excavators", description: "Browse excavators by brand, model and current stock status.", path: "/used-excavators", origin, robots: { index: true, follow: true } });
  assert.equal(home.alternates.canonical, `${origin}/`);
  assert.equal(inventory.alternates.canonical, `${origin}/used-excavators`);
  assert.notEqual(home.description, inventory.description);
});

test("inventory query variants remain canonical to the base route and noindex", async () => {
  const { buildInventoryMetadata } = await import("../src/lib/siteMetadata.ts");
  for (const searchParams of [{ q: "PC200" }, { brand: "Komatsu" }, { status: "sold" }, { page: "2" }]) {
    const metadata = buildInventoryMetadata(searchParams, "https://hgrmachinery.com", { index: true, follow: true });
    assert.equal(metadata.alternates.canonical, "https://hgrmachinery.com/used-excavators");
    assert.deepEqual(metadata.robots, { index: false, follow: true });
  }
});

test("supporting page metadata follows visible content and withholds empty legal pages", async () => {
  const { buildSupportingPageMetadata } = await import("../src/lib/siteMetadata.ts");
  const about = buildSupportingPageMetadata({ slug: "about", title: "About HGR", visibleText: "HGR Equipment Resources is a Malaysian used heavy machinery business.", fallbackDescription: "About HGR.", origin: "https://hgrmachinery.com", robots: { index: true, follow: true } });
  assert.equal(about.alternates.canonical, "https://hgrmachinery.com/about");
  assert.match(about.description, /Malaysian used heavy machinery business/);
  assert.equal(buildSupportingPageMetadata({ slug: "privacy-policy", title: "Privacy Policy", visibleText: "", fallbackDescription: "", origin: "https://hgrmachinery.com", robots: { index: true, follow: true } }), null);
  const policy = buildSupportingPageMetadata({ slug: "privacy-policy", title: "Privacy Policy", visibleText: "Owner-published privacy wording.", fallbackDescription: "", origin: "https://hgrmachinery.com", robots: { index: true, follow: true } });
  assert.equal(policy.alternates.canonical, "https://hgrmachinery.com/privacy-policy");
});
