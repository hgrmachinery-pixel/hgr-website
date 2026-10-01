import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function readIfPresent(url) {
  try { await access(url); return await readFile(url, "utf8"); } catch { return ""; }
}

test("audit events are registered as create-only and server-stamped", async () => {
  const [config, collection, helper] = await Promise.all([
    readFile(new URL("../src/payload.config.ts", import.meta.url), "utf8"),
    readIfPresent(new URL("../src/collections/AssetAuditEvents.ts", import.meta.url)),
    readIfPresent(new URL("../src/lib/audit/assets.ts", import.meta.url)),
  ]);
  assert.match(config, /AssetAuditEvents/);
  assert.match(collection, /create:\s*\(\)\s*=>\s*false/);
  assert.match(collection, /beforeChange/);
  assert.match(collection, /beforeDelete/);
  assert.match(helper, /actorID/);
  assert.match(helper, /occurredAt/);
  assert.match(helper, /req/);
});

