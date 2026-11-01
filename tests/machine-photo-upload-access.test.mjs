import assert from "node:assert/strict";
import test from "node:test";

import { MachineMedia } from "../src/collections/MachineMedia.ts";

const beforeOperation = MachineMedia.hooks.beforeOperation[0];

function uploadRequest(user, findByID) {
  let sequenceCalls = 0;
  const req = {
    user,
    context: {},
    file: { name: "synthetic.jpg", mimetype: "image/jpeg" },
    payload: {
      findByID,
      db: {
        drizzle: {},
        execute: async () => {
          sequenceCalls++;
          return { rows: [{ value: 7 }] };
        },
      },
    },
  };
  return { req, sequenceCalls: () => sequenceCalls };
}

test("master upload rejects anonymous callers before machine reads or sequence allocation", async () => {
  let machineReads = 0;
  for (const user of [undefined, null, { id: 2, collection: "customers" }]) {
    const request = uploadRequest(user, async () => {
      machineReads++;
      return { hgrId: "HGR-000001", serialVisibilityRevision: 1 };
    });
    const args = { data: { machine: 1, category: "general-exterior" } };
    await assert.rejects(beforeOperation({ args, operation: "create", req: request.req }), /Staff sign-in is required/);
    assert.equal(machineReads, 0);
    assert.equal(request.sequenceCalls(), 0);
    assert.equal(request.req.file.name, "synthetic.jpg");
    assert.equal(args.data.photoIdentity, undefined);
  }
});

test("a denied staff machine read prevents allocation and upload identity changes", async () => {
  const denied = new Error("Machine read denied");
  let machineReads = 0;
  const request = uploadRequest({ id: 2, collection: "users" }, async (options) => {
    machineReads++;
    assert.equal(options.overrideAccess, false);
    assert.equal(options.req, request.req);
    assert.equal(options.collection, "machines");
    assert.equal(options.id, 1);
    throw denied;
  });
  const args = { data: { machine: 1, category: "general-exterior" } };
  await assert.rejects(beforeOperation({ args, operation: "create", req: request.req }), (error) => error === denied);
  assert.equal(machineReads, 1);
  assert.equal(request.sequenceCalls(), 0);
  assert.deepEqual(request.req.context, {});
  assert.equal(request.req.file.name, "synthetic.jpg");
  assert.equal(args.data.photoIdentity, undefined);
});

test("an authorized staff upload uses the machine policy returned by an access-controlled read", async () => {
  const request = uploadRequest({ id: 2, collection: "users" }, async (options) => {
    assert.equal(options.overrideAccess, false);
    assert.equal(options.req, request.req);
    return { hgrId: "HGR-000001", serialVisibilityRevision: 4 };
  });
  const args = { data: { machine: 1, category: "general-exterior", review: { serialPolicyRevision: 99 } } };
  const result = await beforeOperation({ args, operation: "create", req: request.req });
  assert.equal(result, args);
  assert.equal(request.sequenceCalls(), 1);
  assert.equal(result.data.review.serialPolicyRevision, 4);
  assert.equal(request.req.context.machinePhotoPolicyRevision, 4);
  assert.equal(request.req.file.name, "hgr-000001-general-exterior-000007.jpg");
});
