import assert from "node:assert/strict";
import test from "node:test";

import { MachineMedia } from "../src/collections/MachineMedia.ts";

const beforeOperation = MachineMedia.hooks.beforeOperation[0];
const beforeChange = MachineMedia.hooks.beforeChange[0];

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
  assert.equal(request.req.context.machinePhotoPolicyRevision, undefined);
  assert.equal(request.req.file.name, "hgr-000001-general-exterior-000007.jpg");
});

function masterChangeRequest({ machine, context = {}, readMachine, user = { id: 2, collection: "users" } }) {
  const req = {
    user,
    context,
    file: { data: Buffer.from("synthetic private machine photo") },
    payload: { findByID: readMachine },
  };
  return { req, data: { assetKind: "master", machine, review: { status: "approved", serialPolicyRevision: 900 } } };
}

test("beforeChange accepts missing hook context and uses the authorized current machine revision", async () => {
  let reads = 0;
  const upload = masterChangeRequest({
    machine: 1,
    readMachine: async (options) => {
      reads++;
      assert.deepEqual(options, {
        collection: "machines", id: 1, depth: 0, overrideAccess: false, req: upload.req,
      });
      return { serialVisibilityRevision: 1, showSerialPublicly: false };
    },
  });

  const result = await beforeChange({ data: upload.data, operation: "create", req: upload.req });
  assert.equal(reads, 1);
  assert.deepEqual(result.review, { status: "needs-review", revision: 1, serialPolicyRevision: 1 });
  assert.equal(result.uploadedBy, 2);
  assert.equal(result.auditHistory[0].event, "uploaded");
});

test("beforeChange ignores stale context and client review revisions", async () => {
  const upload = masterChangeRequest({
    machine: { id: 8 },
    context: { machinePhotoPolicyRevision: 2 },
    readMachine: async (options) => {
      assert.equal(options.id, 8);
      assert.equal(options.overrideAccess, false);
      return { serialVisibilityRevision: 4 };
    },
  });

  const result = await beforeChange({ data: upload.data, operation: "create", req: upload.req });
  assert.deepEqual(result.review, { status: "needs-review", revision: 1, serialPolicyRevision: 4 });
});

test("beforeChange rejects absent or invalid server policy revisions", async () => {
  for (const serialVisibilityRevision of [undefined, null, 0, -1, 1.5, "invalid", Number.MAX_SAFE_INTEGER + 1]) {
    const upload = masterChangeRequest({
      machine: 1,
      readMachine: async () => ({ serialVisibilityRevision }),
    });
    await assert.rejects(
      beforeChange({ data: upload.data, operation: "create", req: upload.req }),
      /machine serial policy revision is invalid/i,
    );
  }
});

test("beforeChange turns denied machine reads into a controlled upload validation error", async () => {
  const upload = masterChangeRequest({
    machine: 1,
    readMachine: async (options) => {
      assert.equal(options.overrideAccess, false);
      throw new Error("private database/access detail");
    },
  });
  await assert.rejects(
    beforeChange({ data: upload.data, operation: "create", req: upload.req }),
    (error) => error.message === "The selected machine could not be verified for photo upload" && !error.message.includes("private"),
  );
});

function cloudStorageFollowUp({ changed = {}, markers = true, file = undefined, user = { id: 2, collection: "users" } } = {}) {
  const originalDoc = {
    id: 19,
    assetKind: "master",
    machine: 1,
    category: "general-exterior",
    filename: "hgr-000001-general-exterior-000007.webp",
    mimeType: "image/webp",
    filesize: 400,
    width: 800,
    height: 600,
    sizes: { thumbnail: { filename: "thumb.webp", width: 320, height: 240 } },
    contentDigest: "sha256:synthetic",
    review: { status: "needs-review", revision: 1, serialPolicyRevision: 1 },
    auditHistory: [{ event: "uploaded", actor: 2 }],
    altText: "Excavator exterior",
  };
  const data = { ...originalDoc, filename: "stored-name.webp", filesize: 390, ...changed };
  const req = {
    user,
    context: markers ? { skipCloudStorage: true, _payloadCloudStorage: { file: { name: "synthetic.jpg" } } } : {},
    file,
    transactionID: Promise.resolve("synthetic-transaction"),
    payload: {
      db: {
        drizzle: {},
        sessions: { "synthetic-transaction": { db: {} } },
        execute: async () => ({ rows: [{ serialVisibilityRevision: 1, reviewHistory: [], auditHistory: [] }] }),
      },
    },
  };
  return { data, originalDoc, req };
}

test("trusted S3 follow-up accepts storage metadata while preserving private master and review data", async () => {
  const upload = cloudStorageFollowUp();
  const result = await beforeChange({ data: upload.data, operation: "update", originalDoc: upload.originalDoc, req: upload.req });
  assert.equal(result.filename, "stored-name.webp");
  assert.equal(result.contentDigest, upload.originalDoc.contentDigest);
  assert.deepEqual(result.review, upload.originalDoc.review);
  assert.equal(result.assetKind, "master");
});

test("full-document update without cloud-storage markers remains blocked as a direct edit", async () => {
  const upload = cloudStorageFollowUp({ markers: false });
  await assert.rejects(
    beforeChange({ data: upload.data, operation: "update", originalDoc: upload.originalDoc, req: upload.req }),
    /Only factual alternative text, focal point and gallery order may be edited directly/,
  );
});

test("cloud-storage follow-up rejects changes to protected machine-photo and review fields", async () => {
  for (const changed of [
    { review: { status: "approved", revision: 1, serialPolicyRevision: 1 } },
    { machine: 99 },
    { contentDigest: "sha256:attacker" },
    { assetKind: "derivative" },
    { photoIdentity: "attacker-photo" },
    { revision: 2 },
    { auditHistory: [] },
    { publishedBy: 2 },
    { prefix: "public" },
  ]) {
    const upload = cloudStorageFollowUp({ changed });
    await assert.rejects(
      beforeChange({ data: upload.data, operation: "update", originalDoc: upload.originalDoc, req: upload.req }),
      /Cloud storage metadata updates cannot change machine photo or review data/,
    );
  }
});

test("cloud-storage skip flag alone or a live upload file cannot authorize follow-up update", async () => {
  const noPreservedFile = cloudStorageFollowUp({ markers: false });
  noPreservedFile.req.context.skipCloudStorage = true;
  await assert.rejects(
    beforeChange({ data: noPreservedFile.data, operation: "update", originalDoc: noPreservedFile.originalDoc, req: noPreservedFile.req }),
    /Cloud storage metadata updates cannot change machine photo or review data/,
  );

  const withIncomingFile = cloudStorageFollowUp({ file: { data: Buffer.from("synthetic") } });
  await assert.rejects(
    beforeChange({ data: withIncomingFile.data, operation: "update", originalDoc: withIncomingFile.originalDoc, req: withIncomingFile.req }),
    /Cloud storage metadata updates cannot change machine photo or review data/,
  );

  const anonymous = cloudStorageFollowUp({ user: null });
  await assert.rejects(
    beforeChange({ data: anonymous.data, operation: "update", originalDoc: anonymous.originalDoc, req: anonymous.req }),
    /Cloud storage metadata updates cannot change machine photo or review data/,
  );
});
