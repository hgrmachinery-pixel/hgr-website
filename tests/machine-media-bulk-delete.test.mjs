import assert from "node:assert/strict";
import test from "node:test";

import { MachineMedia } from "../src/collections/MachineMedia.ts";
import { deleteMachineMediaSelection, machineMediaBulkDeleteEndpoint } from "../src/lib/machines/media-bulk-delete.ts";

const staff = { collection: "users", id: 9 };
const beforeDelete = MachineMedia.hooks.beforeDelete[0];
const afterDelete = MachineMedia.hooks.afterDelete[0];

function batchRequest(deleteOne) {
  return {
    user: staff,
    context: {},
    payload: { delete: (args) => deleteOne(args) },
  };
}

test("collection keeps default bulk deletion disabled and exposes the guarded explicit endpoint", () => {
  assert.equal(MachineMedia.disableBulkDelete, true);
  assert.equal(MachineMedia.endpoints.some(({ path, method }) => path === "/bulk-delete" && method === "post"), true);
});

test("bulk endpoint requires staff access and returns per-record failures", async () => {
  let deleteCalls = 0;
  const denied = await machineMediaBulkDeleteEndpoint({
    user: null,
    json: async () => ({ ids: [1, 2] }),
    payload: { delete: async () => { deleteCalls += 1; } },
  });
  assert.equal(denied.status, 403);
  assert.equal(deleteCalls, 0);

  const request = {
    user: staff,
    context: {},
    json: async () => ({ ids: [73, 74] }),
    payload: {
      delete: async ({ id, req }) => {
        deleteCalls += 1;
        if (id === 73) throw new Error("Unpublish the machine and remove this photo from any published machine before deleting it");
        req.context.machineMediaDeletion = { ...(req.context.machineMediaDeletion ?? {}), [String(id)]: { childIDs: [] } };
        return { id };
      },
    },
  };
  const response = await machineMediaBulkDeleteEndpoint(request);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    deletedIDs: [74], cascadedIDs: [], failures: [{
      id: 73,
      message: "Unpublish the machine and remove this photo from any published machine before deleting it",
    }],
  });
});

test("multiple derivatives run sequentially through the existing hooks and create one cleanup job and audit event each", async () => {
  const sqlStatements = [];
  const cleanupJobs = [];
  const auditEvents = [];
  let activeID;
  let perRecordQuery = 0;
  const digests = new Map([[41, `sha256:${"a".repeat(64)}`], [42, `sha256:${"b".repeat(64)}`]]);
  const req = {
    user: staff,
    context: {},
    transactionID: Promise.resolve("bulk-test-tx"),
    payload: {
      config: { admin: { user: "users" }, i18n: { fallbackLanguage: "en", supportedLanguages: { en: {} }, translations: {} }, collections: [] },
      db: {
        drizzle: {}, sessions: { "bulk-test-tx": { db: {} } },
        execute: async ({ sql }) => {
          perRecordQuery += 1;
          sqlStatements.push(sql);
          const sqlText = sql.queryChunks.flatMap((chunk) => Array.isArray(chunk?.value) ? chunk.value : []).join("");
          if (sqlText.includes('INSERT INTO "machine_media_deletion_jobs"')) cleanupJobs.push(sqlText);
          if (perRecordQuery === 1) return { rows: [{ machineId: 20 }] };
          if (perRecordQuery === 2) return { rows: [{ id: 20, machineStatus: "draft", currentPhotoRevisions: {} }] };
          if (perRecordQuery === 3) return { rows: [{
            id: activeID, machineId: 20, assetKind: "derivative", filename: `hgr-${activeID}.webp`, prefix: "machine-media",
            objectKey: null, sizes: {}, photoIdentity: `photo-${activeID}`, revision: 1, contentDigest: digests.get(activeID),
            sourceMasterId: 10, redactionDigest: null, reviewStatus: "approved", reviewRevision: 1,
            reviewSerialPolicyRevision: 1, reviewDigest: digests.get(activeID), reviewChecklist: {}, reviewHistory: [], auditHistory: [],
          }] };
          if (perRecordQuery === 4) return { rows: [] };
          return { rows: [] };
        },
      },
      create: async ({ collection, data }) => {
        assert.equal(collection, "asset-audit-events");
        auditEvents.push(data);
        return {};
      },
      delete: async () => { throw new Error("A derivative delete must not cascade"); },
    },
  };
  const originalDelete = req.payload.delete;
  req.payload.delete = async ({ id }) => {
    activeID = id;
    perRecordQuery = 0;
    await beforeDelete({ id, req });
    await afterDelete({ doc: { id, filename: `hgr-${id}.webp`, sizes: {}, _objectKey: null }, req });
    // beforeDelete issues four safety queries, one revision update, and one outbox insert.
    assert.equal(perRecordQuery, 6);
    return { id };
  };

  const previousBucket = process.env.R2_BUCKET;
  process.env.R2_BUCKET = "synthetic-test-bucket";
  let result;
  try {
    result = await deleteMachineMediaSelection(req, [41, 42]);
  } finally {
    if (previousBucket === undefined) delete process.env.R2_BUCKET;
    else process.env.R2_BUCKET = previousBucket;
    req.payload.delete = originalDelete;
  }

  assert.deepEqual(result, { deletedIDs: [41, 42], cascadedIDs: [], failures: [] });
  assert.equal(sqlStatements.length, 12);
  assert.equal(cleanupJobs.length, 2);
  assert.equal(auditEvents.length, 2);
  assert.deepEqual(auditEvents.map(({ entityID }) => entityID), ["41", "42"]);
});

test("multiple masters are processed sequentially", async () => {
  const calls = [];
  let active = 0;
  let maxActive = 0;
  const req = batchRequest(async ({ id, req: deleteReq }) => {
    calls.push(id);
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 2));
    deleteReq.context.machineMediaDeletion ??= {};
    deleteReq.context.machineMediaDeletion[String(id)] = { childIDs: [] };
    active -= 1;
    return { id };
  });

  const result = await deleteMachineMediaSelection(req, [51, 52]);
  assert.deepEqual(calls, [51, 52]);
  assert.equal(maxActive, 1);
  assert.deepEqual(result.deletedIDs, [51, 52]);
  assert.deepEqual(result.failures, []);
});

test("selecting a master and its derivative together records the cascade and avoids a second delete", async () => {
  const calls = [];
  const req = batchRequest(async ({ id, req: deleteReq }) => {
    calls.push(id);
    deleteReq.context.machineMediaDeletion ??= {};
    deleteReq.context.machineMediaDeletion[String(id)] = { childIDs: id === 61 ? [62] : [] };
    return { id };
  });

  const result = await deleteMachineMediaSelection(req, [61, 62]);
  assert.deepEqual(calls, [61]);
  assert.deepEqual(result, { deletedIDs: [61, 62], cascadedIDs: [62], failures: [] });
});

test("a published-machine photo failure is reported while the remaining selection continues", async () => {
  const calls = [];
  const req = batchRequest(async ({ id, req: deleteReq }) => {
    calls.push(id);
    if (id === 71) throw new Error("Unpublish the machine and remove this photo from any published machine before deleting it");
    deleteReq.context.machineMediaDeletion ??= {};
    deleteReq.context.machineMediaDeletion[String(id)] = { childIDs: [] };
    return { id };
  });

  const result = await deleteMachineMediaSelection(req, [71, 72]);
  assert.deepEqual(calls, [71, 72]);
  assert.deepEqual(result.deletedIDs, [72]);
  assert.deepEqual(result.failures, [{
    id: 71,
    message: "Unpublish the machine and remove this photo from any published machine before deleting it",
  }]);
});

test("duplicate selected IDs are deduplicated before deletion and cascade handling", async () => {
  const calls = [];
  const req = batchRequest(async ({ id, req: deleteReq }) => {
    calls.push(id);
    deleteReq.context.machineMediaDeletion ??= {};
    deleteReq.context.machineMediaDeletion[String(id)] = { childIDs: id === 81 ? [82] : [] };
    return { id };
  });

  const result = await deleteMachineMediaSelection(req, [81, "81", 82, 82]);
  assert.deepEqual(calls, [81]);
  assert.deepEqual(result, { deletedIDs: [81, 82], cascadedIDs: [82], failures: [] });
});

test("existing single-record deletion remains enabled through Payload's delete hook shape", async () => {
  const beforeOperation = MachineMedia.hooks.beforeOperation[0];
  const args = { id: 91, collection: "machine-media" };
  assert.equal(await beforeOperation({ operation: "delete", args, req: { user: staff } }), args);
});
