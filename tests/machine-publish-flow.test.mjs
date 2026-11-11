import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { Machines } from "../src/collections/Machines.ts";
import {
  isPublicMachineDerivative,
  publicMachineMediaAccess,
} from "../src/lib/machines/media.ts";
import {
  filterPublicMachines,
  normalizeInventoryFilters,
  projectPublicMachineWithMedia,
  resolvePublicMachineSlug,
  sortPublicMachines,
} from "../src/lib/machines/publicInventory.ts";
import { buildPassportGroups } from "../src/lib/machines/inspection.ts";

const publishHook = Machines.hooks.beforeChange[0];
const machineBase = {
  id: 1,
  hgrId: "HGR-000001",
  slug: "2018-komatsu-pc200-8-hgr-000001",
  previousSlugs: [],
  _status: "draft",
  archived: false,
  category: "excavator",
  brand: "Komatsu",
  model: "PC200-8",
  year: 2018,
  hours: 6840,
  engine: "Komatsu SAA6D107E",
  stockStatus: "available",
  priceMode: "contact",
  serialVisibilityRevision: 1,
  currentPhotoRevisions: { "photo-general": 1, "photo-front": 1, "photo-pending": 1 },
  featuredImage: null,
  gallery: [],
};

function derivative(id, photoIdentity, category, order, photoSequence, processingStatus = "ready") {
  const stem = `photo-${id}`;
  return {
    id,
    machine: 1,
    assetKind: "derivative",
    photoIdentity,
    category,
    order,
    photoSequence,
    revision: 1,
    serialPolicyRevision: 1,
    processingStatus,
    contentDigest: `sha256:${stem}`,
    sourceDigest: `sha256:master-${stem}`,
    review: { status: "needs-review", revision: 1, digest: `sha256:${stem}`, serialPolicyRevision: 1 },
    reviewHistory: [],
    altText: `Komatsu PC200-8 excavator ${category}`,
    sizes: {
      thumbnail: { url: `/api/machine-media/file/${stem}-thumb.webp`, width: 320 },
      card: { url: `/api/machine-media/file/${stem}-card.webp`, width: 640 },
      large: { url: `/api/machine-media/file/${stem}-large.webp`, width: 1280 },
    },
  };
}

const frontPhoto = derivative(11, "photo-front", "front-view", 10, 1);
const generalPhoto = derivative(10, "photo-general", "general-exterior", 20, 2);
const processingGeneralPhoto = derivative(12, "photo-pending", "general-exterior", 1, 3, "processing");
const privateMaster = { ...derivative(20, "photo-original", "general-exterior", 0, 0), assetKind: "master" };

function payloadWithPhotos(photos) {
  return {
    find: async ({ collection, where }) => {
      assert.equal(collection, "machine-media");
      assert.deepEqual(where, { and: [{ machine: { equals: 1 } }, { assetKind: { equals: "derivative" } }] });
      return { docs: photos };
    },
  };
}

async function publish(machine, photos) {
  return publishHook({
    data: { ...machine, _status: "published" },
    operation: "update",
    originalDoc: machine,
    req: { context: {}, payload: payloadWithPhotos(photos) },
  });
}

function hydratedPublicMachine(machine, photos) {
  const byId = new Map(photos.map((photo) => [String(photo.id), photo]));
  return {
    ...machine,
    featuredImage: byId.get(String(machine.featuredImage)) ?? null,
    gallery: machine.gallery.map((id) => byId.get(String(id))).filter(Boolean),
  };
}

test("publish rejects missing or still-processing General / Exterior photos", async () => {
  await assert.rejects(
    publish(machineBase, [frontPhoto]),
    /Processed General \/ Exterior Photo/,
  );
  await assert.rejects(
    publish(machineBase, [frontPhoto, processingGeneralPhoto]),
    /Processed General \/ Exterior Photo/,
  );
});

test("draft publishes with an ordered gallery and automatic General / Exterior featured fallback", async () => {
  assert.equal(projectPublicMachineWithMedia(machineBase, true), null, "drafts must not project to public listing or detail data");

  const publicationData = await publish(machineBase, [frontPhoto, generalPhoto, processingGeneralPhoto]);
  const published = { ...machineBase, ...publicationData };

  assert.equal(published._status, "published");
  assert.equal(published.featuredImage, generalPhoto.id, "featured selection remains optional and falls back to eligible General / Exterior");
  assert.deepEqual(published.gallery, [frontPhoto.id, generalPhoto.id], "only ready derivatives are snapshotted in order");
  assert.equal(isPublicMachineDerivative(generalPhoto, published), true);
  assert.equal(isPublicMachineDerivative(frontPhoto, published), true);
  assert.equal(isPublicMachineDerivative(processingGeneralPhoto, published), false);

  const publicDetail = projectPublicMachineWithMedia(hydratedPublicMachine(published, [frontPhoto, generalPhoto]), true);
  assert.equal(publicDetail?.reference, "HGR-000001");
  assert.equal(publicDetail?.brand, "Komatsu");
  assert.equal(publicDetail?.model, "PC200-8");
  assert.equal(publicDetail?.year, 2018);
  assert.equal(publicDetail?.hours, 6840);
  assert.deepEqual(publicDetail?.price, { mode: "contact" });
  assert.equal(publicDetail?.featuredImage?.category, "general-exterior");
  assert.deepEqual(publicDetail?.images.map((photo) => photo.category), ["front-view", "general-exterior"]);
  assert.equal(publicDetail?.images[0]?.altText, frontPhoto.altText);

  const listed = filterPublicMachines(
    sortPublicMachines([publicDetail]),
    normalizeInventoryFilters({ q: "pc200-8", brand: "komatsu", status: "available" }),
  );
  assert.deepEqual(listed.map((machine) => machine.hgrId), ["HGR-000001"]);
  assert.equal(resolvePublicMachineSlug([published], published.slug)?.id, 1);
  assert.equal(resolvePublicMachineSlug([published], "missing-hgr-000001"), undefined);

  const details = buildPassportGroups(publicDetail);
  assert.ok(details.flatMap((group) => group.fields).some(([label, value]) => label === "Engine" && value === "Komatsu SAA6D107E"));
});

test("unpublishing removes the listing, detail projection, and derivative access", async () => {
  const publicationData = await publish(machineBase, [frontPhoto, generalPhoto]);
  const published = { ...machineBase, ...publicationData };
  let currentMachine = published;
  const byId = new Map([[10, generalPhoto], [11, frontPhoto], [20, privateMaster]]);
  const payload = {
    findByID: async ({ collection, id }) => collection === "machine-media" ? byId.get(Number(id)) : currentMachine,
  };
  const originalFlag = process.env.HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED;
  process.env.HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED = "true";

  try {
    assert.deepEqual(await publicMachineMediaAccess({ id: generalPhoto.id, req: { payload } }), { id: { equals: generalPhoto.id } });
    assert.equal(await publicMachineMediaAccess({ id: privateMaster.id, req: { payload } }), false, "private originals are never public derivatives");

    const unpublishData = await publishHook({
      data: { ...published, _status: "draft" },
      operation: "update",
      originalDoc: published,
      req: { context: {}, payload },
    });
    currentMachine = { ...published, ...unpublishData };

    assert.equal(projectPublicMachineWithMedia(hydratedPublicMachine(currentMachine, [frontPhoto, generalPhoto]), true), null);
    assert.equal(isPublicMachineDerivative(generalPhoto, currentMachine), false);
    assert.equal(await publicMachineMediaAccess({ id: generalPhoto.id, req: { payload } }), false);
  } finally {
    if (originalFlag === undefined) delete process.env.HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED;
    else process.env.HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED = originalFlag;
  }
});

test("machine detail retains verified contact links and mobile gallery affordances", async () => {
  const [detail, styles] = await Promise.all([
    readFile(new URL("../src/app/(site)/machines/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/(site)/site.css", import.meta.url), "utf8"),
  ]);
  assert.match(detail, /const viewingMessage = canonicalURL \?/);
  assert.match(detail, /\$\{machine\.reference\}[^\n]*\$\{canonicalURL\}/);
  assert.match(detail, /href=\{`https:\/\/wa\.me\/\$\{contact\.whatsApp\}\?text=\$\{encodeURIComponent\(viewingMessage\)\}`\}/);
  assert.match(detail, /href=\{`tel:\$\{contact\.phone/);
  assert.match(detail, /<InventoryEnquiry kind="machine" machineSlug=\{machine\.slug\}/);
  assert.match(styles, /\.machine-gallery__hero-grid \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(styles, /\.machine-gallery__thumbs \{ flex-direction: row; max-height: none; overflow-x: auto;/);
  assert.match(styles, /\.machine-mobile-whatsapp \{ position: fixed;[^}]*min-height: 52px; display: flex;/);
});
