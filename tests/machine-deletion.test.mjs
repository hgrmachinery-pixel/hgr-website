import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { Machines } from "../src/collections/Machines.ts";
import { machineDeletionBlockReason } from "../src/lib/machines/deletion.ts";

const beforeOperation = Machines.hooks.beforeOperation[0];
const beforeDelete = Machines.hooks.beforeDelete[0];
const beforeValidate = Machines.hooks.beforeValidate[0];
const safeEvidence = {
  status: "draft", everPublished: false, hasPublishedVersion: false,
  hasMachineMedia: false, hasMachineDocuments: false, hasMediaReferences: false,
  hasPendingCleanupJobs: false,
};

function requestAs(roleKey = "owner", evidence = safeEvidence, deleteVersions) {
  const deletedVersionQueries = [];
  const lockQueries = [];
  let executeCount = 0;
  const req = {
    user: roleKey ? { id: 7, collection: "users" } : null,
    transactionID: Promise.resolve("machine-delete-tx"),
    context: {},
    payload: {
      findByID: async ({ collection }) => collection === "users"
        ? { role: { id: 2 } }
        : { key: roleKey },
      db: {
        drizzle: {},
        sessions: { "machine-delete-tx": { db: { transaction: true } } },
        execute: async () => {
          executeCount += 1;
          // In the successful path, permission preflight is first, then the
          // transaction-bound row lock, then a fresh eligibility snapshot.
          if (executeCount === 2) {
            lockQueries.push(executeCount);
            return { rows: [{ id: 42 }] };
          }
          return { rows: [{ ...evidence }] };
        },
        deleteVersions: deleteVersions ?? (async (args) => deletedVersionQueries.push(args)),
      },
    },
  };
  return { req, deletedVersionQueries, lockQueries };
}

test("Owner can permanently delete a never-published draft and Payload versions are removed transactionally", async () => {
  const { req, deletedVersionQueries, lockQueries } = requestAs();
  assert.equal(await Machines.access.delete({ id: 42, req }), true);
  await beforeOperation({ operation: "delete", args: { id: 42, collection: "machines" }, req });
  await beforeDelete({ id: 42, req });
  assert.equal(lockQueries.length, 1);
  assert.deepEqual(deletedVersionQueries, [{
    collection: "machines", req,
    where: { parent: { equals: 42 } },
  }]);
});

test("version cleanup failure aborts machine deletion rather than leaving detached history", async () => {
  const { req } = requestAs("owner", safeEvidence, async () => { throw new Error("version cleanup failed"); });
  assert.equal(await Machines.access.delete({ id: 42, req }), true);
  await assert.rejects(beforeDelete({ id: 42, req }), /version cleanup failed/);
});

test("non-Owner staff and anonymous users cannot permanently delete machines", async () => {
  const staff = requestAs("website-administrator");
  assert.equal(await Machines.access.delete({ id: 42, req: staff.req }), false);
  await assert.rejects(beforeDelete({ id: 42, req: staff.req }), /Only the current Owner/);
  const anonymous = requestAs(null);
  assert.equal(await Machines.access.delete({ id: 42, req: anonymous.req }), false);
  await assert.rejects(beforeDelete({ id: 42, req: anonymous.req }), /Only the current Owner/);
});

test("published or historically published machines are refused with archive guidance", async () => {
  for (const evidence of [
    { ...safeEvidence, status: "published" },
    { ...safeEvidence, everPublished: true },
    { ...safeEvidence, hasPublishedVersion: true },
  ]) {
    assert.match(machineDeletionBlockReason(evidence), /Archive it instead/);
    const { req, deletedVersionQueries } = requestAs("owner", evidence);
    assert.equal(await Machines.access.delete({ id: 42, req }), false);
    await assert.rejects(beforeDelete({ id: 42, req }), /Archive it instead/);
    assert.equal(deletedVersionQueries.length, 0);
  }
});

test("unknown legacy publication history and any attached media or documents fail closed", async () => {
  const blocked = [
    [{ ...safeEvidence, everPublished: null }, /cannot be verified/],
    [{ ...safeEvidence, hasMachineMedia: true }, /linked photos first/],
    [{ ...safeEvidence, hasMediaReferences: true }, /linked photos first/],
    [{ ...safeEvidence, hasMachineDocuments: true }, /retained documents/],
    [{ ...safeEvidence, hasPendingCleanupJobs: true }, /cleanup is still queued/],
  ];
  for (const [evidence, reason] of blocked) {
    const { req, deletedVersionQueries } = requestAs("owner", evidence);
    assert.equal(await Machines.access.delete({ id: 42, req }), false);
    await assert.rejects(beforeDelete({ id: 42, req }), reason);
    assert.equal(deletedVersionQueries.length, 0);
  }
});

test("machine deletion is single-record only even when Local API bypasses access", async () => {
  const { req } = requestAs();
  assert.equal(Machines.disableBulkDelete, true);
  const payloadSingleDeleteArgs = { id: 42, collection: "machines" };
  assert.equal(await beforeOperation({ operation: "delete", args: payloadSingleDeleteArgs, req }), payloadSingleDeleteArgs);
  await assert.rejects(beforeOperation({
    operation: "delete", args: { where: { id: { in: [42, 43] } }, collection: "machines" }, req,
  }), /one at a time/);
  await assert.rejects(beforeOperation({
    operation: "delete", args: { id: 42, where: { id: { equals: 42 } }, collection: "machines" }, req,
  }), /one at a time/);
  assert.equal(await Machines.access.delete({ req }), false, "collection-wide Payload delete controls stay hidden");
});

test("stale machine saves fail instead of upserting a deleted row", async () => {
  const req = {
    context: {}, transactionID: Promise.resolve("stale-save-tx"),
    payload: { db: {
      drizzle: {}, sessions: { "stale-save-tx": { db: {} } },
      execute: async () => ({ rows: [] }),
    } },
  };
  await assert.rejects(beforeValidate({
    data: { _status: "draft" }, operation: "update",
    originalDoc: { id: 42, hgrId: "HGR-000042", slug: "unit-hgr-000042" }, req,
  }), /machine no longer exists/i);
});

test("machine identity allocation remains sequence-backed and deletion never resets it", async () => {
  const [machines, migration, worker] = await Promise.all([
    readFile(new URL("../src/collections/Machines.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/migrations/20261114_000000_machine_hard_delete_safety.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/machines/deletion.ts", import.meta.url), "utf8"),
  ]);
  assert.match(machines, /nextval\('hgr_machine_id_seq'\)/);
  assert.doesNotMatch(migration + worker, /\bsetval\s*\(/i);
  assert.match(migration, /ever_published/);
  assert.match(migration, /NEW\."ever_published" := OLD\."ever_published" OR NEW\."_status" = 'published'/);
});

test("only a safe Owner receives the per-document delete permission and control", async () => {
  const [machineSource, ui] = await Promise.all([
    readFile(new URL("../src/collections/Machines.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/payload/MachineDeleteAction.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(machineSource, /delete: async \(\{ id, req \}\) => canOwnerDeleteMachine\(req, id\)/);
  assert.match(machineSource, /MachineDeleteAction#MachineDeleteAction/);
  assert.match(ui, /docPermissions\.delete === true/);
  assert.match(ui, /method: "DELETE"/);
  assert.match(ui, /window\.confirm/);
});
