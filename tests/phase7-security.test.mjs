import assert from "node:assert/strict";
import test from "node:test";

import { projectPublicMachine } from "../src/lib/machines/publicProjection.ts";
import { isStaffUser } from "../src/lib/machines/access.ts";
import { MachineDocuments } from "../src/collections/MachineDocuments.ts";
import { validateImageUpload, publicMachineMediaAccess } from "../src/lib/machines/media.ts";
import { configuredDocumentMimeTypes } from "../src/lib/machines/documents.ts";
import { validateServerURL } from "../src/lib/serverURL.ts";

const publicMachine = {
  id: 42,
  _status: "published",
  archived: false,
  hgrId: "HGR-000042",
  slug: "komatsu-pc200-hgr-000042",
  stockStatus: "available",
  brand: "Komatsu",
  model: "PC200",
  serialNumber: "SYNTHETIC-PRIVATE-SERIAL",
  showSerialPublicly: false,
  internalNotes: "SYNTHETIC-PRIVATE-NOTE",
};

test("public projection excludes drafts, private serials, and internal fields", () => {
  assert.equal(projectPublicMachine({ ...publicMachine, _status: "draft" }), null);
  const projected = projectPublicMachine(publicMachine);
  assert.ok(projected);
  assert.equal("serialNumber" in projected, false);
  assert.equal("internalNotes" in projected, false);
  assert.doesNotMatch(JSON.stringify(projected), /SYNTHETIC-PRIVATE/);
});

test("public machine reads request only published non-archived records through access control", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/lib/machines/publicQueries.ts", import.meta.url), "utf8");
  assert.match(source, /_status:\s*\{\s*equals:\s*"published"\s*\}/);
  assert.match(source, /archived:\s*\{\s*not_equals:\s*true\s*\}/);
  assert.match(source, /overrideAccess:\s*false/);
});

test("original documents deny anonymous reads and all document bytes are private no-store", () => {
  assert.equal(MachineDocuments.access.read({ req: { user: null } }), false);
  assert.equal(MachineDocuments.access.delete(), false);
  assert.match(MachineDocuments.upload.modifyResponseHeaders({ headers: new Headers() }).get("Cache-Control"), /private, no-store/);
});

test("unauthorized machine media reads and master delivery are denied", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/collections/MachineMedia.ts", import.meta.url), "utf8");
  assert.match(source, /access:\s*\{[\s\S]*?read:\s*staffFieldRead/);
  assert.equal(await publicMachineMediaAccess({ req: {}, data: { filename: "synthetic-master.jpg" } }), false);
});

test("private document route responds with private no-store headers and rejects anonymous staff access", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/app/api/machine-documents/[action]/route.ts", import.meta.url), "utf8");
  assert.match(source, /Cache-Control[^\n]*private, no-store/);
  assert.match(source, /if \(!isStaffUser\(auth\.user\)\) return json\([^\n]*401/);
  assert.match(source, /action !== "capability" && action !== "preview"/);
});

test("the initial staff boundary remains limited to authenticated users records", () => {
  assert.equal(isStaffUser({ id: 1, collection: "users", role: "owner" }), true);
  assert.equal(isStaffUser({ id: 2, collection: "users", role: "website-administrator" }), true);
  assert.equal(isStaffUser({ id: 3, collection: "customers", role: "owner" }), false);
  assert.equal(isStaffUser(null), false);
});

test("photo batch and document MIME validation reject unsafe inputs", () => {
  assert.match(validateImageUpload(0), /invalid image size/i);
  assert.deepEqual(configuredDocumentMimeTypes("application/pdf, image/jpeg, image/svg+xml"), ["application/pdf", "image/jpeg"]);
});

test("Next.js baseline security headers are configured without HSTS or CSP", async () => {
  const { readFile } = await import("node:fs/promises");
  const config = await readFile(new URL("../next.config.mjs", import.meta.url), "utf8");
  assert.match(config, /poweredByHeader:\s*false/);
  assert.match(config, /X-Content-Type-Options.*nosniff/);
  assert.match(config, /X-Frame-Options.*DENY/);
  assert.match(config, /Referrer-Policy.*strict-origin-when-cross-origin/);
  assert.doesNotMatch(config, /Strict-Transport-Security|Content-Security-Policy/);
});

test("production SERVER_URL guard requires HTTPS and Secure cookies fail closed", async () => {
  const { readFile } = await import("node:fs/promises");
  const config = await readFile(new URL("../src/payload.config.ts", import.meta.url), "utf8");
  const users = await readFile(new URL("../src/collections/Users.ts", import.meta.url), "utf8");
  assert.match(config, /validateServerURL\(serverURL\)/);
  assert.throws(() => validateServerURL("http://hgrmachinery.com", "production"), /must use HTTPS/);
  assert.equal(validateServerURL("https://hgrmachinery.com", "production").origin, "https://hgrmachinery.com");
  assert.throws(() => validateServerURL("https://wrong.example", "production", "production"), /must be https:\/\/hgrmachinery\.com/);
  assert.equal(validateServerURL("https://abundant-presence-staging.up.railway.app", "production", "staging").origin, "https://abundant-presence-staging.up.railway.app");
  assert.equal(validateServerURL("http://localhost:3000", "development").origin, "http://localhost:3000");
  assert.match(users, /secure: process\.env\.NODE_ENV === "production" \|\| process\.env\.SERVER_URL\?\.startsWith\("https:\/\/"\) === true/);
});
