import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { MachineMedia } from "../src/collections/MachineMedia.ts";
import { machineMediaObjectKeys, mediaDeletionRetryDelayMs, runMachineMediaDeletionAttempt, safeMediaDeletionErrorCode } from "../src/lib/machines/media-deletion.ts";
import { shouldCarryPhotoReviewHold } from "../src/lib/machines/media-process.ts";

const staff = { collection: "users", id: 9 };
const beforeOperation = MachineMedia.hooks.beforeOperation[0];
const beforeDelete = MachineMedia.hooks.beforeDelete[0];
const afterDelete = MachineMedia.hooks.afterDelete[0];

test("Machine Images offer staff one-record delete and reject bulk or anonymous delete", async () => {
  assert.equal(MachineMedia.disableBulkDelete, true);
  await assert.rejects(beforeOperation({ operation: "delete", args: { where: { id: { in: [1, 2] } }, collection: "machine-media" }, req: { user: staff } }), /one at a time/);
  // Payload's deleteByIDOperation maps its hook operation to "delete" and
  // passes the selected record in args.id.
  const payloadSingleDeleteArgs = { id: 1, collection: "machine-media" };
  assert.equal(await beforeOperation({ operation: "delete", args: payloadSingleDeleteArgs, req: { user: staff } }), payloadSingleDeleteArgs);
  await assert.rejects(beforeOperation({ operation: "delete", args: { id: 1, where: { id: { in: [1, 2] } }, collection: "machine-media" }, req: { user: staff } }), /one at a time/);
  await assert.rejects(beforeOperation({ operation: "deleteByID", args: { id: 1, collection: "machine-media" }, req: { user: null } }), /Staff sign-in/);
  const args = { id: 1, collection: "machine-media" };
  assert.equal(await beforeOperation({ operation: "deleteByID", args, req: { user: staff } }), args);
  assert.equal(await MachineMedia.access.delete({ req: { user: staff } }), true);
  assert.equal(await MachineMedia.access.delete({ req: { user: null } }), false);
});

test("master cleanup keys include its responsive files and linked derivative files exactly once", () => {
  const keys = machineMediaObjectKeys([
    { prefix: "machine-media", filename: "hgr-master.webp", sizes: { card: { filename: "hgr-master-card.webp" } } },
    { prefix: "machine-media", objectKey: "folder-id", filename: "hgr-public.webp", sizes: { large: { filename: "hgr-public-large.webp" } } },
  ]);
  assert.deepEqual(keys, [
    "machine-media/hgr-master.webp", "machine-media/hgr-master-card.webp",
    "machine-media/folder-id/hgr-public.webp", "machine-media/folder-id/hgr-public-large.webp",
  ]);
  assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual(machineMediaObjectKeys([{ filename: "only-derivative.webp", sizes: {} }]), ["machine-media/only-derivative.webp"]);
});

test("deletion checks publication state before creating cleanup jobs", async () => {
  let calls = 0;
  const request = {
    user: staff, context: {}, transactionID: Promise.resolve("tx-1"),
    payload: {
      db: { drizzle: {}, sessions: { "tx-1": { db: {} } }, execute: async () => {
        calls += 1;
        if (calls === 1) return { rows: [{ machineId: 20 }] };
        if (calls === 2) return { rows: [{ id: 20, machineStatus: "published" }] };
        if (calls === 3) return { rows: [{ id: 1, machineId: 20, assetKind: "master", filename: "master.webp", prefix: "machine-media", sizes: {}, photoIdentity: "photo-1", revision: 1, contentDigest: `sha256:${"a".repeat(64)}` }] };
        return { rows: [] };
      } },
    },
  };
  await assert.rejects(beforeDelete({ id: 1, req: request }), /Unpublish the machine/);
  assert.equal(request.context.machineMediaDeletion, undefined);
});

test("deleting one derivative queues only its own cleanup key and audit event", async () => {
  const statements = [];
  const digest = `sha256:${"d".repeat(64)}`;
  const request = {
    user: staff, context: {}, transactionID: Promise.resolve("tx-derivative"),
    payload: {
      config: { admin: { user: "users" }, i18n: { fallbackLanguage: "en", supportedLanguages: { en: {} }, translations: {} }, collections: [] },
      db: { drizzle: {}, sessions: { "tx-derivative": { db: {} } }, execute: async ({ sql }) => {
        statements.push(sql);
        if (statements.length === 1) return { rows: [{ machineId: 20 }] };
        if (statements.length === 2) return { rows: [{ id: 20, machineStatus: "draft", currentPhotoRevisions: {} }] };
        if (statements.length === 3) return { rows: [{
          id: 22, machineId: 20, assetKind: "derivative", filename: "hgr-public.webp", prefix: "machine-media",
          objectKey: null, sizes: {}, photoIdentity: "photo-1", revision: 1, contentDigest: digest,
          sourceMasterId: 10, redactionDigest: null, reviewStatus: "approved", reviewRevision: 1,
          reviewSerialPolicyRevision: 1, reviewDigest: digest, reviewChecklist: {}, reviewHistory: [], auditHistory: [],
        }] };
        if (statements.length === 4) return { rows: [] };
        return { rows: [] };
      } },
      create: async ({ collection, data }) => {
        assert.equal(collection, "asset-audit-events");
        assert.equal(data.entityID, "22");
        assert.equal(data.eventType, "modified");
        return {};
      },
    },
  };
  const previousBucket = process.env.R2_BUCKET;
  process.env.R2_BUCKET = "hgr-staging-media";
  try {
    await beforeDelete({ id: 22, req: request });
  } finally {
    if (previousBucket === undefined) delete process.env.R2_BUCKET;
    else process.env.R2_BUCKET = previousBucket;
  }
  assert.equal(statements.length, 6); // locks/checks, revision watermark, then one outbox insert
  assert.deepEqual(request.context.machineMediaDeletion["22"].childIDs, []);
  assert.equal(request.context.machineMediaDeletion["22"].row.assetKind, "derivative");
});

test("deleting a master queues cleanup durably and deletes linked derivatives sequentially", async () => {
  const deleted = [];
  const objectJobs = [];
  let dbCall = 0;
  let active = 0;
  let maxActive = 0;
  const request = {
    user: staff, context: {}, transactionID: Promise.resolve("tx-1"),
    payload: {
      config: { admin: { user: "users" }, i18n: { fallbackLanguage: "en", supportedLanguages: { en: {} }, translations: {} }, collections: [] },
      db: { drizzle: {}, sessions: { "tx-1": { db: {} } }, execute: async ({ sql }) => {
        dbCall += 1;
        if (dbCall === 1) return { rows: [{ machineId: 20 }] };
        if (dbCall === 2) return { rows: [{ id: 20, machineStatus: "draft" }] };
        if (dbCall === 3) return { rows: [{ id: 1, machineId: 20, assetKind: "master", filename: "master.webp", prefix: "machine-media", sizes: { thumbnail: { filename: "thumb.webp" } }, photoIdentity: "photo-1", revision: 1, contentDigest: `sha256:${"a".repeat(64)}` }] };
        if (dbCall === 4) return { rows: [] };
        if (dbCall === 5) return { rows: [{ id: 2, filename: "public.webp", prefix: "machine-media", sizes: {}, objectKey: null, photoIdentity: "photo-1", revision: 1, contentDigest: `sha256:${"b".repeat(64)}` }] };
        objectJobs.push(sql);
        return { rows: [] };
      } },
      create: async ({ collection }) => { assert.equal(collection, "asset-audit-events"); return {}; },
      delete: async ({ id }) => { active += 1; maxActive = Math.max(maxActive, active); await new Promise((resolve) => setTimeout(resolve, 1)); deleted.push(id); active -= 1; return {}; },
    },
  };
  const previousBucket = process.env.R2_BUCKET;
  process.env.R2_BUCKET = "hgr-staging-media";
  await beforeDelete({ id: 1, req: request });
  assert.equal(objectJobs.length, 3);
  assert.deepEqual(request.context.machineMediaDeletion["1"].childIDs, [2]);
  const result = await afterDelete({ doc: { id: 1, filename: "master.webp", sizes: { thumbnail: { filename: "thumb.webp" } }, _objectKey: null }, req: request });
  if (previousBucket === undefined) delete process.env.R2_BUCKET;
  else process.env.R2_BUCKET = previousBucket;
  assert.deepEqual(deleted, [2]);
  assert.equal(maxActive, 1);
  assert.equal(result.filename, undefined);
  assert.deepEqual(result.sizes, {});
  const source = await readFile(new URL("../src/collections/MachineMedia.ts", import.meta.url), "utf8");
  assert.match(source, /INSERT INTO "machine_media_deletion_jobs"/);
  assert.match(source, /childIDs: childRows\.rows\.map/);
});

test("deleting one derivative does not cascade to sibling or master records", async () => {
  const deleted = [];
  const req = {
    context: {},
    payload: { delete: async ({ id }) => deleted.push(id) },
  };
  const result = await afterDelete({ doc: { id: 22, filename: "one.webp", sizes: {} }, req });
  assert.deepEqual(deleted, []);
  assert.equal(result.filename, undefined);
  assert.deepEqual(result.sizes, {});
});

test("cleanup retries are bounded, errors are sanitized, and expired leases can be reclaimed", async () => {
  assert.equal(mediaDeletionRetryDelayMs(1), 30_000);
  assert.equal(mediaDeletionRetryDelayMs(4), 240_000);
  assert.equal(mediaDeletionRetryDelayMs(500), 21_600_000);
  assert.equal(safeMediaDeletionErrorCode({ name: "AccessDenied", message: "secret token value" }), "AccessDenied");
  assert.equal(safeMediaDeletionErrorCode({ code: "bad code", message: "secret" }), "storage-delete-failed");
  const sentKeys = [];
  const retries = [];
  let completed = 0;
  let failOnce = true;
  const attempt = () => runMachineMediaDeletionAttempt({
    attempt: retries.length + 1,
    deleteObject: async () => {
      sentKeys.push("machine-media/exact-object.webp");
      if (failOnce) { failOnce = false; throw Object.assign(new Error("never logged"), { name: "ServiceUnavailable" }); }
    },
    markCompleted: async () => { completed += 1; },
    scheduleRetry: async (code, delay) => retries.push({ code, delay }),
  });
  assert.equal(await attempt(), "retry-scheduled");
  assert.equal(await attempt(), "completed");
  assert.deepEqual(sentKeys, ["machine-media/exact-object.webp", "machine-media/exact-object.webp"]);
  assert.deepEqual(retries, [{ code: "ServiceUnavailable", delay: 30_000 }]);
  assert.equal(completed, 1);
  const migration = await readFile(new URL("../src/migrations/20261112_000000_machine_media_deletion_jobs.ts", import.meta.url), "utf8");
  const worker = await readFile(new URL("../src/lib/machines/media-deletion.ts", import.meta.url), "utf8");
  assert.match(migration, /UNIQUE \("bucket", "object_key"\)/);
  const collection = await readFile(new URL("../src/collections/MachineMedia.ts", import.meta.url), "utf8");
  assert.match(collection, /ON CONFLICT \("bucket", "object_key"\) DO NOTHING/);
  assert.match(collection, /UPDATE "machines" SET "current_photo_revisions"/);
  assert.match(worker, /status.*processing.*lease_until.*< now\(\)/s);
  assert.match(worker, /DeleteObjectCommand/); // S3 DeleteObject is safe to repeat for the same exact key.
  assert.match(worker, /job\.bucket !== bucket/);
  assert.equal(shouldCarryPhotoReviewHold(undefined, [], [{ event: "review-required-carried-forward", reason: "sensitive-derivative-deleted" }]), true);
});

test("delete audit uses retained modified event and a deletion-specific event key", async () => {
  const source = await readFile(new URL("../src/collections/MachineMedia.ts", import.meta.url), "utf8");
  assert.match(source, /eventType:\s*"modified"/);
  assert.match(source, /photo:\$\{row\.id\}:deleted:/);
  assert.match(source, /beforeDelete/);
});
