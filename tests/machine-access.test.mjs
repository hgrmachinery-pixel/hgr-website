import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { Users } from "../src/collections/Users.ts";
import { isStaffUser } from "../src/lib/machines/access.ts";
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

test("only explicitly identified Payload staff identities pass staff access", () => {
  assert.equal(isStaffUser(owner), true);
  assert.equal(isStaffUser(administrator), true);
  assert.equal(isStaffUser({ id: 3, collection: "users", role: "customer" }), false);
  assert.equal(isStaffUser({ id: 4, collection: "customers", role: "owner" }), false);
  assert.equal(isStaffUser(null), false);
});

test("first-user hook assigns the owner and permits exactly one owner-created administrator", async () => {
  const beforeChange = Users.hooks.beforeChange[0];
  const run = (count, user, data = {}) => beforeChange({
    data,
    operation: "create",
    req: {
      user,
      payload: { count: async () => ({ totalDocs: count }) },
    },
  });

  const first = await run(0, null, { email: "owner@example.invalid", role: "website-administrator" });
  assert.equal(first.role, "owner");
  const second = await run(1, owner, { email: "admin@example.invalid", role: "owner" });
  assert.equal(second.role, "website-administrator");
  await assert.rejects(run(2, owner), /Only the first owner/);
  await assert.rejects(run(1, administrator), /Only the first owner/);

  assert.equal(await Users.access.create({ req: { user: null } }), false);
  assert.equal(await Users.access.create({
    req: { user: owner, payload: { count: async () => ({ totalDocs: 1 }) } },
  }), true);
  assert.equal(await Users.access.create({
    req: { user: administrator, payload: { count: async () => ({ totalDocs: 1 }) } },
  }), false);
});

test("staff role is immutable and user administration is protected", async () => {
  const beforeChange = Users.hooks.beforeChange[0];
  await assert.rejects(beforeChange({
    data: { role: "website-administrator" },
    operation: "update",
    originalDoc: { role: "owner" },
    req: { user: owner },
  }), /identity cannot be changed/);
  assert.equal(await Users.access.delete({ req: { user: owner } }), false);
  assert.equal(await Users.access.read({ req: { user: administrator }, id: 1 }), false);
  assert.equal(await Users.access.read({ req: { user: administrator }, id: 2 }), true);
  assert.equal(await Users.access.admin({ req: { user: administrator } }), true);
  assert.equal(Users.disableDuplicate, true);
  assert.equal(Users.fields.find(({ name }) => name === "role").unique, true);
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
