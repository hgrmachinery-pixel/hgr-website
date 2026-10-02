import test from "node:test";
import assert from "node:assert/strict";
import { projectPublicImage } from "../src/lib/machines/publicInventory.ts";

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
