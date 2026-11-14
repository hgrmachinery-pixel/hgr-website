import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("machine deletion guard is registered and legacy publication history fails closed", async () => {
  const [migration, registry] = await Promise.all([
    readFile(new URL("../src/migrations/20261114_000000_machine_hard_delete_safety.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/migrations/index.ts", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /ALTER TABLE "machines" ADD COLUMN "ever_published" boolean/);
  assert.doesNotMatch(migration, /ADD COLUMN "ever_published" boolean NOT NULL DEFAULT FALSE/i);
  assert.match(migration, /SET "ever_published" = TRUE[\s\S]*version\."version__status" = 'published'/);
  assert.match(migration, /CREATE TRIGGER "machines_ever_published_guard"/);
  assert.match(migration, /NEW\."ever_published" := CASE WHEN NEW\."_status" = 'published' THEN TRUE ELSE NULL END/);
  assert.match(registry, /20261114_000000_machine_hard_delete_safety/);
});

test("migration rollback refuses to remove the publication safety marker while history is protected or unknown", async () => {
  const migration = await readFile(new URL("../src/migrations/20261114_000000_machine_hard_delete_safety.ts", import.meta.url), "utf8");
  const guard = migration.indexOf('"ever_published" IS DISTINCT FROM FALSE');
  const lock = migration.indexOf('LOCK TABLE "machines", "_machines_v" IN ACCESS EXCLUSIVE MODE');
  const drop = migration.indexOf('ALTER TABLE "machines" DROP COLUMN "ever_published"');
  assert.ok(lock >= 0 && guard > lock && drop > guard);
  assert.match(migration, /version__status" = 'published'/);
});
