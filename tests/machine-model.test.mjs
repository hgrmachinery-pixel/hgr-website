import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  appendHistoricalSlug,
  createMachineSlug,
  formatMachineId,
  hasMachineIdSuffix,
  machinePublicationErrors,
  machinePath,
  validateMachinePrice,
} from "../src/lib/machines/identity.ts";
import { projectPublicMachine } from "../src/lib/machines/publicProjection.ts";
import { generatedMachineImageName } from "../src/lib/machines/media.ts";
import {
  denyAccess,
  publishedMachineRead,
  publishedPageRead,
  publicPriceRead,
  publicSerialRead,
  staffAccess,
} from "../src/lib/machines/access.ts";

test("machine references are permanent sequential HGR identifiers", () => {
  assert.equal(formatMachineId(1), "HGR-000001");
  assert.equal(formatMachineId(27), "HGR-000027");
  assert.equal(formatMachineId(1_000_000), "HGR-1000000");
  assert.throws(() => formatMachineId(0), RangeError);
});

test("readable machine routes include permanent identity and tolerate duplicate facts", () => {
  const facts = { brand: "Komatsu", model: "PC200-8", year: 2018 };
  const first = createMachineSlug(facts, "HGR-000001");
  const second = createMachineSlug(facts, "HGR-000002");

  assert.equal(first, "2018-komatsu-pc200-8-hgr-000001");
  assert.notEqual(first, second);
  assert.equal(machinePath(first), `/machines/${first}`);
  assert.match(machinePath(first), /hgr-000001$/);
  assert.equal(hasMachineIdSuffix(first, "HGR-000001"), true);
  assert.equal(hasMachineIdSuffix(first, "HGR-000002"), false);
});

test("route corrections retain every prior path for the same machine", () => {
  const firstSlug = "2018-komatsu-pc200-hgr-000001";
  const correctedSlug = "2018-komatsu-pc200-8-hgr-000001";
  const laterSlug = "2018-komatsu-pc200-8-excavator-hgr-000001";

  assert.deepEqual(appendHistoricalSlug([], firstSlug, correctedSlug), [firstSlug]);
  assert.deepEqual(
    appendHistoricalSlug([firstSlug], correctedSlug, laterSlug),
    [firstSlug, correctedSlug],
  );
  assert.deepEqual(appendHistoricalSlug([firstSlug], correctedSlug, correctedSlug), [firstSlug]);
});

test("publishing needs core facts and one real featured gallery reference", () => {
  const base = {
    hgrId: "HGR-000001",
    category: "excavator",
    brand: "Komatsu",
    model: "PC200-8",
    stockStatus: "available",
    featuredImage: { id: 15 },
    gallery: [{ id: 15 }],
  };

  assert.deepEqual(machinePublicationErrors(base), []);
  assert.deepEqual(
    machinePublicationErrors({ ...base, gallery: [{ id: 16 }] }),
    ["Featured Image in Gallery"],
  );
  assert.deepEqual(
    machinePublicationErrors({ ...base, brand: "", model: undefined, featuredImage: null }),
    ["Brand", "Model", "Featured Image"],
  );
  assert.deepEqual(
    machinePublicationErrors({ ...base, featuredImage: { relationTo: "machine-media", value: 15 } }),
    [],
  );
});

test("machine configuration protects identity from routine changes and deletion", async () => {
  const [collection, config] = await Promise.all([
    readFile(new URL("../src/collections/Machines.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/payload.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(config, /Machines/);
  assert.match(collection, /disableDuplicate:\s*true/);
  assert.match(collection, /delete:\s*deny/);
  assert.match(collection, /unique:\s*true/);
  assert.match(collection, /originalDoc/);
});

test("machine image object names do not reuse uploader filenames", () => {
  assert.equal(
    generatedMachineImageName("image/jpeg", "unit-000001-side-01"),
    "machine-image-unit-000001-side-01.jpg",
  );
  assert.equal(
    generatedMachineImageName("image/webp", "unit-000001-02"),
    "machine-image-unit-000001-02.webp",
  );
  assert.throws(() => generatedMachineImageName("image/svg+xml", "file"), /Unsupported/);
});

test("machine facts keep separate dates and the CMS contact values blank until verified", async () => {
  const [machine, contact, pages, config] = await Promise.all([
    readFile(new URL("../src/collections/Machines.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/globals/SiteContact.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/collections/Pages.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/payload.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(machine, /name: "year", label: "Year of Manufacture"/);
  assert.match(machine, /name: "registrationDate",\s+label: "Registration Date"/);
  assert.match(machine, /name: "machineOriginStatus"/);
  assert.match(machine, /name: "stockStatus"/);
  assert.match(contact, /name: "phone"/);
  assert.match(contact, /name: "whatsApp"/);
  assert.match(contact, /name: "yardLocation"/);
  assert.doesNotMatch(contact, /defaultValue/);
  assert.match(pages, /name: "title"/);
  assert.match(pages, /name: "slug"[\s\S]*unique: true/);
  assert.match(pages, /name: "seoTitle"/);
  assert.match(pages, /name: "seoDescription"/);
  assert.match(pages, /name: "body"[\s\S]*type: "richText"/);
  assert.match(config, /editor: lexicalEditor\(\{\}\)/);
  assert.match(config, /collections: \[[^\]]*Pages/s);
  assert.match(config, /globals: \[SiteContact\]/);
});

test("Payload access keeps drafts, archives, and private facts behind server rules", async () => {
  const [machineSource, mediaSource, pagesSource] = await Promise.all([
    readFile(new URL("../src/collections/Machines.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/collections/MachineMedia.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/collections/Pages.ts", import.meta.url), "utf8"),
  ]);
  const anonymous = { req: { user: null } };
  const staff = { req: { user: { id: 1, collection: "users", role: "owner" } } };

  assert.deepEqual(await publishedMachineRead(anonymous), {
    _status: { equals: "published" },
    archived: { not_equals: true },
  });
  assert.equal(await publishedMachineRead(staff), true);
  assert.equal(await staffAccess(anonymous), false);
  assert.equal(await staffAccess(staff), true);
  assert.equal(await denyAccess(staff), false);
  assert.deepEqual(await publishedPageRead(anonymous), { _status: { equals: "published" } });
  assert.equal(await publishedPageRead(staff), true);
  assert.equal(await publicPriceRead({ ...anonymous, doc: { priceMode: "unset" } }), false);
  assert.equal(await publicPriceRead({ ...anonymous, doc: { priceMode: "public" } }), true);
  assert.equal(await publicSerialRead({ ...anonymous, doc: { showSerialPublicly: false } }), false);
  assert.equal(await publicSerialRead({ ...anonymous, doc: { showSerialPublicly: true } }), true);
  assert.match(machineSource, /readVersions: isStaff/);
  assert.match(mediaSource, /read: staffAccess/);
  assert.match(pagesSource, /versions: \{ drafts: true/);
});

test("public projection excludes drafts, archived records, hidden price, and private serial", () => {
  const base = {
    hgrId: "HGR-000001",
    slug: "2018-komatsu-pc200-hgr-000001",
    _status: "published",
    archived: false,
    stockStatus: "sold",
    brand: "Komatsu",
    model: "PC200",
    priceMode: "unset",
    price: 0,
    serialNumber: "PRIVATE-123",
    showSerialPublicly: false,
    hours: null,
    description: "  ",
  };

  const projection = projectPublicMachine(base);
  assert.equal(projection?.stockStatus, "sold");
  assert.equal(projection?.price, undefined);
  assert.equal(projection?.serialNumber, undefined);
  assert.equal("hours" in projection, false);
  assert.equal("description" in projection, false);
  assert.equal(projectPublicMachine({ ...base, _status: "draft" }), null);
  assert.equal(projectPublicMachine({ ...base, archived: true }), null);
});

test("public projection includes only explicitly public price and serial values", () => {
  const base = {
    hgrId: "HGR-000002",
    slug: "komatsu-pc200-hgr-000002",
    _status: "published",
    archived: false,
    stockStatus: "reserved",
    priceMode: "public",
    price: 120000,
    serialNumber: "SERIAL-002",
    showSerialPublicly: true,
  };

  assert.deepEqual(projectPublicMachine(base)?.price, { mode: "public", amount: 120000 });
  assert.equal(projectPublicMachine(base)?.serialNumber, "SERIAL-002");
  assert.deepEqual(
    projectPublicMachine({ ...base, priceMode: "contact", price: undefined })?.price,
    { mode: "contact" },
  );
  for (const stockStatus of ["available", "reserved", "sold"]) {
    assert.equal(
      projectPublicMachine({ ...base, stockStatus })?.stockStatus,
      stockStatus,
    );
  }
  assert.equal(validateMachinePrice(120000, "public"), true);
  assert.equal(typeof validateMachinePrice(undefined, "public"), "string");
  assert.equal(typeof validateMachinePrice(Number.NaN, "public"), "string");
  assert.equal(validateMachinePrice(undefined, "unset"), true);
});
