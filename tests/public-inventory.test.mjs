import test from "node:test";
import assert from "node:assert/strict";
import {
  filterPublicMachines,
  getAvailableHomepageMachines,
  getPublicImageURL,
  normalizeInventoryFilters,
  paginateMachines,
  projectPublicMachine,
  resolvePublicMachineSlug,
  sortPublicMachines,
} from "../src/lib/machines/publicInventory.ts";
import { youtubeEmbedURL, youtubeVideoId } from "../src/lib/machines/video.ts";

const record = (overrides = {}) => {
  const hgrId = overrides.hgrId ?? "HGR-000001";
  return {
    id: 1,
    _status: "published",
    archived: false,
    hgrId,
    slug: `komatsu-pc200-${String(hgrId).toLowerCase()}`,
    category: "excavator",
    brand: "Komatsu",
    model: "PC200",
    stockStatus: "available",
    priceMode: "public",
    price: 250000,
    ...overrides,
  };
};

test("public projection omits private fields, invalid price and unpublished records", () => {
  const machine = projectPublicMachine(record({
    serialNumber: "PRIVATE-SERIAL",
    showSerialPublicly: false,
    previousSlugs: ["old-link"],
    auditHistory: ["private"],
    password: "secret",
  }));
  assert.equal(machine?.price?.mode, "public");
  assert.equal("serialNumber" in machine, false);
  assert.equal("previousSlugs" in machine, false);
  assert.equal("auditHistory" in machine, false);
  assert.equal(projectPublicMachine(record({ _status: "draft" })), null);
  assert.equal(projectPublicMachine(record({ archived: true })), null);
  assert.equal(projectPublicMachine(record({ hgrId: "" })), null);
  assert.equal(projectPublicMachine(record({ hgrId: "HGR-7" })), null);
  assert.equal(projectPublicMachine(record({ slug: "reused-url" })), null);
});

test("price mode requires an explicit valid public value", () => {
  assert.deepEqual(projectPublicMachine(record({ priceMode: "contact", price: 999 })).price, { mode: "contact" });
  assert.equal(projectPublicMachine(record({ priceMode: "unset", price: 500 })).price, undefined);
  assert.equal(projectPublicMachine(record({ priceMode: "public", price: -1 })).price, undefined);
  assert.equal(projectPublicMachine(record({ priceMode: "public", price: "500" })).price, undefined);
});

test("sort order is Available, Reserved, Sold with deterministic HGR tie-break", () => {
  const machines = [
    projectPublicMachine(record({ hgrId: "HGR-000004", stockStatus: "sold" })),
    projectPublicMachine(record({ hgrId: "HGR-000003", stockStatus: "reserved" })),
    projectPublicMachine(record({ hgrId: "HGR-000002", stockStatus: "available" })),
    projectPublicMachine(record({ hgrId: "HGR-000001", stockStatus: "available" })),
  ];
  assert.deepEqual(sortPublicMachines(machines).map((item) => item.hgrId), [
    "HGR-000001", "HGR-000002", "HGR-000003", "HGR-000004",
  ]);
});

test("search and brand/status filters combine and normalize", () => {
  const machines = [
    projectPublicMachine(record({ hgrId: "HGR-000001", brand: "Komatsu", model: "PC200" })),
    projectPublicMachine(record({ hgrId: "HGR-000002", brand: "Caterpillar", model: "320D", stockStatus: "reserved" })),
  ];
  const filters = normalizeInventoryFilters({ q: "  pc200 ", brand: "komatsu", status: "available" });
  assert.deepEqual(filterPublicMachines(machines, filters).map((item) => item.hgrId), ["HGR-000001"]);
  assert.equal(normalizeInventoryFilters({ status: "bogus", page: "-4" }).status, undefined);
});

test("homepage selection contains only available units and is capped at six", () => {
  const machines = Array.from({ length: 8 }, (_, index) => projectPublicMachine(record({
    id: index + 1,
    hgrId: `HGR-${String(index + 1).padStart(6, "0")}`,
    slug: `machine-${index + 1}-hgr-${String(index + 1).padStart(6, "0")}`,
  })));
  machines.push(projectPublicMachine(record({ hgrId: "HGR-000010", stockStatus: "reserved" })));
  assert.equal(getAvailableHomepageMachines(machines).length, 6);
  assert.ok(getAvailableHomepageMachines(machines).every((item) => item.stockStatus === "available"));
});

test("pagination clamps values and limits page size", () => {
  const items = Array.from({ length: 30 }, (_, index) => ({ index }));
  assert.deepEqual(paginateMachines(items, 0, 10), { page: 1, pageSize: 10, totalPages: 3, items: items.slice(0, 10) });
  assert.equal(paginateMachines(items, 999, 10).page, 3);
  assert.equal(paginateMachines(items, 1, 999).pageSize, 24);
});

test("image URL accepts only same-origin Payload file routes", () => {
  assert.equal(getPublicImageURL("/api/machine-media/file/photo.jpg", true), "/api/machine-media/file/photo.jpg");
  assert.equal(getPublicImageURL("https://bucket.storage.google.com/photo.jpg", true), undefined);
  assert.equal(getPublicImageURL("/api/machine-media/file/master-private.jpg", false), undefined);
  assert.equal(getPublicImageURL("/api/machine-documents/file/secret.pdf", true), undefined);
});

test("current and historical slugs resolve only when unique", () => {
  const first = record({ previousSlugs: ["older-komatsu-hgr-000001"] });
  const second = record({ id: 2, hgrId: "HGR-000002", slug: "cat-320-hgr-000002", previousSlugs: [] });
  assert.equal(resolvePublicMachineSlug([first, second], "older-komatsu-hgr-000001")?.id, 1);
  assert.equal(resolvePublicMachineSlug([first, second], "cat-320-hgr-000002")?.id, 2);
  assert.equal(resolvePublicMachineSlug([first, second], "unknown"), undefined);
  assert.equal(resolvePublicMachineSlug([first, { ...second, previousSlugs: [first.slug] }], first.slug), undefined);
});

test("YouTube video URLs are restricted to known HTTPS hosts and valid IDs", () => {
  assert.equal(youtubeVideoId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeEmbedURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0");
  assert.equal(youtubeVideoId("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ"), undefined);
  assert.equal(youtubeVideoId("http://youtube.com/watch?v=dQw4w9WgXcQ"), undefined);
  assert.equal(youtubeVideoId("https://youtube.com:444/watch?v=dQw4w9WgXcQ"), undefined);
  assert.equal(youtubeVideoId("https://youtube.com/watch?v=bad"), undefined);
});
