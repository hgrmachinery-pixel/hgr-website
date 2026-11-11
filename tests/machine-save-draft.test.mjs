import assert from "node:assert/strict";
import test from "node:test";

import { Machines } from "../src/collections/Machines.ts";

const beforeChange = Machines.hooks.beforeChange[0];
const beforeValidate = Machines.hooks.beforeValidate[0];
const identity = { hgrId: "HGR-000001", currentPhotoRevisions: { "photo-a": 1, "photo-b": 2 }, _status: "draft" };

function update(data, context = {}) {
  return beforeChange({
    data: { hgrId: identity.hgrId, _status: "draft", ...data },
    operation: "update",
    originalDoc: identity,
    req: { context },
  });
}

test("Save Draft accepts an unchanged photo revision map even when key order differs", async () => {
  const data = await update({ currentPhotoRevisions: { "photo-b": 2, "photo-a": 1 }, model: "SYNTHETIC-DRAFT" });
  assert.equal(data.model, "SYNTHETIC-DRAFT");
});

test("Save Draft rejects changed, null, or malformed photo revision maps", async () => {
  for (const value of [
    { "photo-a": 2, "photo-b": 2 },
    { "photo-a": 1 },
    null,
    [],
  ]) {
    await assert.rejects(
      update({ currentPhotoRevisions: value }),
      /Current photo revisions can only be updated by the protected photo processor/,
    );
  }
});

test("Save Draft permits omitted photo revision data and protected processing updates", async () => {
  assert.equal((await update({ model: "SYNTHETIC-OMITTED" })).model, "SYNTHETIC-OMITTED");
  const data = await update({ currentPhotoRevisions: { "photo-a": 3 } }, { machinePhotoProcessing: true });
  assert.deepEqual(data.currentPhotoRevisions, { "photo-a": 3 });
});

test("stale machine drafts inherit the locked main-row photo revision map without changing their draft status", async () => {
  const original = { ...identity, id: 1, slug: "komatsu-pc200-hgr-000001" };
  const context = {};
  const req = {
    context,
    transactionID: Promise.resolve("machine-save"),
    payload: {
      db: {
        drizzle: {},
        sessions: { "machine-save": { db: {} } },
        execute: async () => ({ rows: [{
          hgrId: "HGR-000001", slug: original.slug, previousSlugs: [], showSerialPublicly: false,
          serialVisibilityRevision: 1, currentPhotoRevisions: { "photo-a": 1, "photo-b": 2, "photo-new": 1 },
        }] }),
      },
    },
  };
  const data = await beforeValidate({
    data: { _status: "draft", brand: "Pending draft brand", currentPhotoRevisions: original.currentPhotoRevisions },
    operation: "update", originalDoc: original, req,
  });
  assert.deepEqual(data.currentPhotoRevisions, { "photo-a": 1, "photo-b": 2, "photo-new": 1 });
  assert.equal(data._status, "draft");
  const saved = await beforeChange({ data, operation: "update", originalDoc: original, req });
  assert.equal(saved.brand, "Pending draft brand");
  assert.equal(saved._status, "draft");
  assert.deepEqual(saved.currentPhotoRevisions, { "photo-a": 1, "photo-b": 2, "photo-new": 1 });
});

test("Payload's merged published machine stays on its existing gallery during photo processing", async () => {
  const published = { ...identity, id: 1, _status: "published", featuredImage: 51, gallery: [51] };
  const data = { ...published, currentPhotoRevisions: { "photo-a": 3 } };
  const result = await beforeChange({ data, operation: "update", originalDoc: published, req: { context: { machinePhotoProcessing: true } } });
  assert.deepEqual(result.gallery, [51]);
  assert.equal(result.featuredImage, 51);
  assert.deepEqual(result.currentPhotoRevisions, { "photo-a": 3 });
});
