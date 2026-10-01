import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { Users } from "../src/collections/Users.ts";
import { Roles } from "../src/collections/Roles.ts";
import { isStaffUser } from "../src/lib/machines/access.ts";
import { APPROVE_PUBLIC_DOCUMENTS, BUILT_IN_ROLE_SEEDS, hasOwnerAuthority, hasPermission } from "../src/lib/auth/permissions.ts";
import {
  createMachinePreviewToken,
  createPreviewHandler,
  machinePreviewURL,
  verifyMachinePreviewToken,
} from "../src/lib/machines/preview.ts";

const secret = "phase-two-test-secret-with-more-than-32-characters";
const owner = { id: 1, collection: "users", role: "owner" };
const administrator = {
  id: 2,
  collection: "users",
  role: "website-administrator",
};

test("any authenticated staff collection user is staff regardless of role key", () => {
  assert.equal(isStaffUser(owner), true);
  assert.equal(isStaffUser(administrator), true);
  assert.equal(isStaffUser({ id: 3, collection: "users", role: "future-reviewer" }), true);
  assert.equal(isStaffUser({ id: 4, collection: "customers", role: "owner" }), false);
  assert.equal(isStaffUser({ collection: "users", role: "owner" }), false);
  assert.equal(isStaffUser(null), false);
});

function permissionRequest({
  user = owner,
  storedRole = 1,
  roles = new Map([
    [1, { id: 1, key: "owner", permissions: [{ name: APPROVE_PUBLIC_DOCUMENTS }] }],
    [2, { id: 2, key: "website-administrator", permissions: [] }],
  ]),
  count = 1,
} = {}) {
  const calls = [];
  const req = {
    user,
    payload: {
      count: async () => ({ totalDocs: count }),
      findByID: async ({ collection, id, ...options }) => {
        calls.push({ collection, id, ...options });
        if (collection === "users") return { id, role: storedRole };
        if (collection === "roles") return roles.get(Number(id));
        throw new Error(`Unexpected collection: ${collection}`);
      },
      find: async ({ collection }) => collection === "roles"
        ? { docs: [{ id: 1, key: "owner" }] }
        : { docs: [] },
    },
  };
  return { req, calls };
}

test("built-in roles and permission resolution use current persisted relationships", async () => {
  assert.deepEqual(BUILT_IN_ROLE_SEEDS, [
    { name: "Owner", key: "owner", permissions: [{ name: APPROVE_PUBLIC_DOCUMENTS }] },
    { name: "Website Administrator", key: "website-administrator", permissions: [] },
  ]);
  assert.equal(Roles.slug, "roles");
  assert.equal(Roles.fields.find(({ name }) => name === "key").unique, true);
  assert.ok(Roles.fields.find(({ name }) => name === "permissions").fields.some(({ name }) => name === "name"));

  const { req, calls } = permissionRequest({
    user: { ...administrator, role: "owner", permissions: [APPROVE_PUBLIC_DOCUMENTS] },
    storedRole: 2,
    roles: new Map([[2, { id: 2, key: "website-administrator", permissions: [] }]]),
  });
  assert.equal(await hasPermission(req, APPROVE_PUBLIC_DOCUMENTS), false);
  assert.deepEqual(calls.map(({ collection }) => collection), ["users", "roles"]);

  const changingRoles = new Map([[3, { id: 3, key: "owner", permissions: [{ name: APPROVE_PUBLIC_DOCUMENTS }] }]]);
  const ownerState = permissionRequest({ storedRole: 3, roles: changingRoles });
  assert.equal(await hasPermission(ownerState.req, APPROVE_PUBLIC_DOCUMENTS), true);
  assert.equal(await hasOwnerAuthority(ownerState.req), true);
  changingRoles.set(3, { id: 3, key: "owner", permissions: [] });
  assert.equal(await hasPermission(ownerState.req, APPROVE_PUBLIC_DOCUMENTS), false);
});

test("delegated document approvers cannot administer roles or staff accounts", async () => {
  const delegated = { id: 4, collection: "users", role: "owner", permissions: [APPROVE_PUBLIC_DOCUMENTS] };
  const { req } = permissionRequest({
    user: delegated,
    storedRole: 4,
    roles: new Map([[4, { id: 4, key: "document-reviewer", permissions: [{ name: APPROVE_PUBLIC_DOCUMENTS }] }]]),
  });
  assert.equal(await hasPermission(req, APPROVE_PUBLIC_DOCUMENTS), true);
  assert.equal(await hasOwnerAuthority(req), false);
  assert.equal(await Roles.access.admin({ req }), false);
  assert.equal(await Roles.access.create({ req }), false);
  assert.equal(await Users.access.create({ req }), false);
  assert.equal(await Users.fields.find(({ name }) => name === "role").access.update({ req }), false);
});

test("first staff account receives the seeded Owner role; later accounts require Owner authority", async () => {
  const beforeChange = Users.hooks.beforeChange[0];
  let bootstrapLockCount = 0;
  const run = (count, user, data = {}) => beforeChange({
    data,
    operation: "create",
    req: {
      user,
      transactionID: "tx-1",
      payload: {
        count: async () => ({ totalDocs: count }),
        find: async () => ({ docs: [{ id: 1, key: "owner" }] }),
        db: {
          sessions: { "tx-1": { db: {} } },
          execute: async () => { bootstrapLockCount += 1; return { rows: [{ id: 1 }] }; },
          drizzle: {},
        },
      },
    },
  });

  const first = await run(0, null, { email: "owner@example.invalid", role: 99 });
  assert.equal(first.role, 1);
  assert.equal(bootstrapLockCount, 1);
  const unauthorized = permissionRequest({ user: administrator, storedRole: 2, roles: new Map([[2, { id: 2, permissions: [] }]]) });
  await assert.rejects(beforeChange({ data: { email: "admin@example.invalid", role: 2 }, operation: "create", req: unauthorized.req }), /current Owner/);

  const ownerState = permissionRequest({ count: 50 });
  assert.equal(await Users.access.create({ req: ownerState.req }), true);
  const createdByOwner = permissionRequest({ count: 50, storedRole: 1 });
  assert.equal(await Users.access.create({ req: createdByOwner.req }), true);
  const second = await beforeChange({ data: { email: "admin@example.invalid", role: 2 }, operation: "create", req: createdByOwner.req });
  assert.equal(second.role, 2);
  assert.equal(Users.fields.find(({ name }) => name === "role").relationTo, "roles");
});

test("Payload create access probe is read-only; bootstrap serializes and recounts in beforeChange", async () => {
  const counts = [0, 0, 0, 0, 1];
  let lockCount = 0;
  const req = {
    user: null,
    transactionID: "tx-1",
    payload: {
      count: async () => ({ totalDocs: counts.shift() ?? 1 }),
      find: async () => ({ docs: [{ id: 1, key: "owner" }] }),
      db: {
        sessions: { "tx-1": { db: {} } },
        execute: async () => { lockCount += 1; return { rows: [{ id: 1 }] }; },
        drizzle: {},
      },
    },
  };
  assert.equal(await Users.access.create({ req }), true);
  assert.equal(lockCount, 0);
  const created = await Users.hooks.beforeChange[0]({
    data: { email: "first-owner@example.invalid", role: 99 },
    operation: "create",
    req,
  });
  assert.equal(created.role, 1);
  assert.equal(lockCount, 1);
  await assert.rejects(Users.hooks.beforeChange[0]({
    data: { email: "racing@example.invalid" },
    operation: "create",
    req,
  }), /current Owner/);
  assert.equal(lockCount, 2);
});

test("role assignments and role permission changes are protected server-side", async () => {
  const beforeChange = Users.hooks.beforeChange[0];
  const adminState = permissionRequest({ user: administrator, storedRole: 2, roles: new Map([[2, { id: 2, key: "website-administrator", permissions: [] }]]) });
  await assert.rejects(beforeChange({
    data: { role: 1 },
    operation: "update",
    originalDoc: { role: 2 },
    req: adminState.req,
  }), /current Owner/);
  assert.equal(await Users.fields.find(({ name }) => name === "role").access.update({ req: adminState.req }), false);
  assert.equal(await Roles.access.create({ req: adminState.req }), false);
  assert.equal(Roles.access.delete(), false);
  await assert.rejects(Roles.hooks.beforeChange[0]({
    data: { permissions: [{ name: APPROVE_PUBLIC_DOCUMENTS }] },
    operation: "update",
    originalDoc: { key: "website-administrator", permissions: [] },
    req: adminState.req,
  }), /current Owner/);

  const ownerState = permissionRequest();
  const roleHook = Roles.hooks.beforeChange[0];
  await assert.rejects(roleHook({
    data: { key: "website-administrator", permissions: [] },
    operation: "update",
    originalDoc: { key: "owner", permissions: [{ name: APPROVE_PUBLIC_DOCUMENTS }] },
    req: ownerState.req,
  }), /stable key cannot be changed/);
  await assert.rejects(roleHook({
    data: { permissions: [] },
    operation: "update",
    originalDoc: { key: "owner", permissions: [{ name: APPROVE_PUBLIC_DOCUMENTS }] },
    req: ownerState.req,
  }), /must retain Approve Public Documents/);
  await assert.rejects(roleHook({
    data: { permissions: null },
    operation: "update",
    originalDoc: { key: "owner", permissions: [{ name: APPROVE_PUBLIC_DOCUMENTS }] },
    req: ownerState.req,
  }), /must retain Approve Public Documents/);
  await assert.rejects(roleHook({
    data: { permissions: [APPROVE_PUBLIC_DOCUMENTS] },
    operation: "update",
    originalDoc: { key: "owner", permissions: [{ name: APPROVE_PUBLIC_DOCUMENTS }] },
    req: ownerState.req,
  }), /must retain Approve Public Documents/);
  const delegatedGrant = [{ name: APPROVE_PUBLIC_DOCUMENTS }];
  assert.deepEqual(await roleHook({
    data: { permissions: delegatedGrant },
    operation: "update",
    originalDoc: { key: "document-reviewer", permissions: [] },
    req: ownerState.req,
  }), { permissions: delegatedGrant });

  const ownerUserUpdateReq = permissionRequest().req;
  ownerUserUpdateReq.transactionID = "tx-1";
  ownerUserUpdateReq.payload.count = async () => ({ totalDocs: 1 });
  ownerUserUpdateReq.payload.db = {
    sessions: { "tx-1": { db: {} } },
    execute: async () => ({ rows: [{ id: 1 }] }),
    drizzle: {},
  };
  await assert.rejects(beforeChange({
    data: { role: 2 },
    operation: "update",
    originalDoc: { role: 1 },
    req: ownerUserUpdateReq,
  }), /last Owner account cannot be demoted/);
  ownerUserUpdateReq.payload.count = async () => ({ totalDocs: 2 });
  assert.deepEqual(await beforeChange({
    data: { role: 2 },
    operation: "update",
    originalDoc: { role: 1 },
    req: ownerUserUpdateReq,
  }), { role: 2 });
  assert.equal(await Roles.access.update({ req: ownerState.req }), true);

  assert.equal(await Users.access.delete({ req: { user: owner } }), false);
  assert.equal(await Users.access.read({ req: adminState.req, id: 1 }), false);
  assert.equal(await Users.access.read({ req: adminState.req, id: 2 }), true);
  assert.equal(await Users.access.admin({ req: adminState.req }), true);
  assert.equal(Users.disableDuplicate, true);
});

test("Local API deletion hooks retain the final Owner and built-in roles", async () => {
  const ownerState = permissionRequest({ count: 1 });
  ownerState.req.payload.findByID = async ({ collection, id }) => collection === "users"
    ? { id, role: 1 }
    : id === 1 ? { id, key: "owner" } : { id, key: "reviewer" };
  ownerState.req.payload.count = async () => ({ totalDocs: 1 });
  ownerState.req.transactionID = "delete-tx";
  ownerState.req.payload.db = {
    sessions: { "delete-tx": { db: {} } },
    execute: async () => ({ rows: [{ id: 1 }] }),
    drizzle: {},
  };
  await assert.rejects(Users.hooks.beforeDelete[0]({ id: 1, req: ownerState.req }), /last Owner account cannot be deleted/);

  const roleHook = Roles.hooks.beforeDelete[0];
  await assert.rejects(roleHook({ id: 1, req: ownerState.req }), /Built-in staff roles cannot be deleted/);
  ownerState.req.payload.findByID = async ({ collection, id }) => collection === "users"
    ? { id, role: 1 }
    : id === 1 ? { id, key: "owner" } : { id, key: "reviewer" };
  ownerState.req.payload.count = async () => ({ totalDocs: 1 });
  await assert.rejects(roleHook({ id: 3, req: ownerState.req }), /assigned to staff accounts cannot be deleted/);
  assert.equal(Users.access.delete(), false);
  assert.equal(Roles.access.delete(), false);
});

test("signed preview links expire and are bound to one machine", () => {
  const token = createMachinePreviewToken(27, secret, 1_900_000_000);
  assert.equal(verifyMachinePreviewToken(token, "27", secret, 1_900_000_100), true);
  assert.equal(verifyMachinePreviewToken(token, "28", secret, 1_900_000_100), false);
  assert.equal(verifyMachinePreviewToken(token, "27", secret, 1_900_000_301), false);
  assert.equal(verifyMachinePreviewToken(`${token}x`, "27", secret, 1_900_000_100), false);
  assert.match(machinePreviewURL({ id: 27 }, "https://hgr.example", secret), /^https:\/\/hgr\.example\/api\/preview/);
  assert.equal(machinePreviewURL({ id: 27 }, "https://hgr.example", "short"), null);
});

test("preview handler denies anonymous, malformed, and invalid links before Draft Mode", async () => {
  let draftEnabled = 0;
  const handler = createPreviewHandler({
    authenticate: async () => null,
    findMachine: async () => ({ id: 27, slug: "komatsu-pc200-hgr-000027" }),
    enableDraft: async () => { draftEnabled += 1; },
    serverURL: "https://hgr.example",
    secret,
    nowSeconds: () => 1_900_000_100,
  });

  const malformed = await handler(new Request("https://untrusted.example/api/preview?id=../&token=x"));
  assert.equal(malformed.status, 400);
  const anonymous = await handler(new Request(`https://untrusted.example/api/preview?id=27&token=${createMachinePreviewToken(27, secret, 1_900_000_000)}`));
  assert.equal(anonymous.status, 401);
  assert.equal(draftEnabled, 0);
});

test("authorized preview reads the matching draft and redirects only to configured origin", async () => {
  let draftEnabled = 0;
  let readAs;
  const handler = createPreviewHandler({
    authenticate: async () => owner,
    findMachine: async (id, user) => {
      readAs = { id, user };
      return { id: 27, slug: "komatsu-pc200-hgr-000027", archived: false };
    },
    enableDraft: async () => { draftEnabled += 1; },
    serverURL: "https://hgr.example",
    secret,
    nowSeconds: () => 1_900_000_100,
  });
  const token = createMachinePreviewToken(27, secret, 1_900_000_000);
  const response = await handler(new Request(`https://attacker.example/api/preview?id=27&token=${token}`));
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "https://hgr.example/machines/komatsu-pc200-hgr-000027");
  assert.equal(response.headers.get("cache-control"), "no-store, private");
  assert.equal(draftEnabled, 1);
  assert.deepEqual(readAs, { id: "27", user: owner });
});

test("phase 2 config registers protected users, recovery stub, preview secret, and editor", async () => {
  const [config, route, machines, pages, envExample] = await Promise.all([
    readFile(new URL("../src/payload.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/preview/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/collections/Machines.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/collections/Pages.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);
  assert.match(config, /Users/);
  assert.match(config, /admin: \{ user: "users" \}/);
  assert.match(config, /noDeliveryEmailAdapter/);
  assert.match(config, /editor: lexicalEditor/);
  assert.match(route, /overrideAccess: false/);
  assert.match(route, /draft: true/);
  assert.match(machines, /preview: \(doc\)/);
  assert.match(pages, /name: "body"[\s\S]*type: "richText"/);
  assert.match(envExample, /PREVIEW_SECRET=/);
  assert.match(await readFile(new URL("../src/collections/Users.ts", import.meta.url), "utf8"), /secure: process\.env\.SERVER_URL\?\.startsWith\("https:\/\/"\)/);
});

test("phase 2 migration extends foundation users safely and adds the permanent ID sequence", async () => {
  const migration = await readFile(
    new URL("../src/migrations/20261001_080057_phase2_machines.ts", import.meta.url),
    "utf8",
  );
  const registry = await readFile(new URL("../src/migrations/index.ts", import.meta.url), "utf8");
  assert.match(migration, /CREATE SEQUENCE "hgr_machine_id_seq" START WITH 1/);
  assert.match(migration, /IF EXISTS \(SELECT 1 FROM "users"\)/);
  assert.match(migration, /ALTER TABLE "users" ADD COLUMN "role"/);
  assert.doesNotMatch(migration, /CREATE TABLE "users"/);
  assert.match(migration, /CREATE TABLE "pages"/);
  assert.match(migration, /"body" jsonb/);
  assert.match(migration, /DROP SEQUENCE "hgr_machine_id_seq"/);
  assert.match(migration, /DROP COLUMN "role"/);
  assert.ok(migration.indexOf('DROP CONSTRAINT "payload_locked_documents_rels_machines_fk"') < migration.indexOf('DROP TABLE "machines" CASCADE'));
  assert.match(registry, /20261001_080057_phase2_machines/);
});

test("Phase 3 permissions use persisted flexible roles rather than fixed role labels", async () => {
  const [users, payloadConfig, access] = await Promise.all([
    readFile(new URL("../src/collections/Users.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/payload.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/machines/access.ts", import.meta.url), "utf8"),
  ]);

  assert.equal(isStaffUser({ id: 8, collection: "users", role: "custom-role" }), true);
  assert.match(users, /relationTo:\s*["']roles["']/);
  assert.match(users, /relationTo:\s*["']roles["']/);
  assert.match(payloadConfig, /Roles/);
  assert.match(access, /candidate\.collection === ["']users["']/);
  assert.doesNotMatch(access, /candidate\.role ===/);
});
