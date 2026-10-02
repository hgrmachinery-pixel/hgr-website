import test from "node:test";
import assert from "node:assert/strict";
import { projectPublicImage, publicImageSrcSet } from "../src/lib/machines/publicInventory.ts";

const image = (overrides = {}) => ({
  id: 12,
  url: "/api/machine-media/file/master-original.jpg",
  altText: "Komatsu PC200 excavator viewed from the side",
  category: "side-view-1",
  order: 4,
  assetKind: "derivative",
  processingStatus: "ready",
  sizes: {
    thumbnail: { url: "/api/machine-media/file/thumb.jpg" },
    card: { url: "/api/machine-media/file/card.jpg" },
    large: { url: "/api/machine-media/file/large.jpg" },
  },
  ...overrides,
});

test("verified public image projects supported responsive derivatives and reviewed alt text", () => {
  assert.deepEqual(projectPublicImage(image(), true), {
    url: "/api/machine-media/file/card.jpg",
    thumbnailUrl: "/api/machine-media/file/thumb.jpg",
    cardUrl: "/api/machine-media/file/card.jpg",
    largeUrl: "/api/machine-media/file/large.jpg",
    altText: "Komatsu PC200 excavator viewed from the side",
    category: "side-view-1",
    order: 4,
  });
});

test("partial responsive image omits absent derivatives and never substitutes master URL", () => {
  assert.deepEqual(projectPublicImage(image({ sizes: { thumbnail: { url: "/api/machine-media/file/thumb.jpg" } } }), true), {
    url: "/api/machine-media/file/thumb.jpg",
    thumbnailUrl: "/api/machine-media/file/thumb.jpg",
    altText: "Komatsu PC200 excavator viewed from the side",
    category: "side-view-1",
    order: 4,
  });
  assert.equal(projectPublicImage(image({ sizes: {} }), true), undefined);
});

test("unverified and malformed responsive URLs stay closed and empty alt text stays empty", () => {
  assert.equal(projectPublicImage(image(), false), undefined);
  assert.equal(projectPublicImage(image({ sizes: { card: { url: "https://bucket.example/card.jpg" } } }), true), undefined);
  assert.equal(projectPublicImage(image({ sizes: { card: { url: "/api/machine-documents/file/private.pdf" } } }), true), undefined);
  assert.equal(projectPublicImage(image({ altText: "", sizes: { card: { url: "/api/machine-media/file/card.jpg" } } }), true)?.altText, "");
});

test("responsive srcSet contains only available, validated derivatives", () => {
  assert.equal(publicImageSrcSet(projectPublicImage(image(), true)), "/api/machine-media/file/thumb.jpg 320w, /api/machine-media/file/card.jpg 640w, /api/machine-media/file/large.jpg 1280w");
  assert.equal(publicImageSrcSet(projectPublicImage(image({ sizes: { large: { url: "/api/machine-media/file/large.jpg" } } }), true)), "/api/machine-media/file/large.jpg 1280w");
});

test("machine share metadata uses only the eligible featured large derivative and factual alt", async () => {
  const { buildMachineMetadata } = await import("../src/lib/siteMetadata.ts");
  const machine = {
    hgrId: "HGR-000028",
    slug: "komatsu-pc200-hgr-000028",
    reference: "HGR-000028",
    brand: "Komatsu",
    model: "PC200",
    year: 2018,
    stockStatus: "available",
    featuredImage: { url: "/api/machine-media/file/card.jpg", largeUrl: "/api/machine-media/file/large.jpg", altText: "Komatsu PC200 viewed from the side" },
  };
  const metadata = buildMachineMetadata(machine, "https://hgrmachinery.com");
  assert.deepEqual(metadata.openGraph.images, [{ url: "https://hgrmachinery.com/api/machine-media/file/large.jpg", alt: "Komatsu PC200 viewed from the side" }]);
  assert.deepEqual(metadata.twitter.images, [{ url: "https://hgrmachinery.com/api/machine-media/file/large.jpg", alt: "Komatsu PC200 viewed from the side" }]);

  const noImage = buildMachineMetadata({ ...machine, featuredImage: undefined }, "https://hgrmachinery.com");
  assert.equal("images" in noImage.openGraph, false);
  assert.equal("twitter" in noImage, false);
});

test("cards and gallery use responsive browser image sources without changing alt text", async () => {
  const { readFile } = await import("node:fs/promises");
  const card = await readFile(new URL("../src/components/site/MachineCard.tsx", import.meta.url), "utf8");
  const gallery = await readFile(new URL("../src/components/site/MachineGallery.tsx", import.meta.url), "utf8");
  assert.match(card, /srcSet=\{publicImageSrcSet\(image\)\}/);
  assert.match(card, /sizes=/);
  assert.match(gallery, /srcSet=\{publicImageSrcSet\(current\)\}/);
  assert.match(gallery, /sizes=/);
  assert.match(gallery, /thumbnailUrl \?\? image\.url/);
});
