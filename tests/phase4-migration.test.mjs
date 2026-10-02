import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(new URL("../src/migrations/20261002_005506_phase4_youtube_video.ts", import.meta.url), "utf8");
const registry = readFileSync(new URL("../src/migrations/index.ts", import.meta.url), "utf8");
const snapshot = JSON.parse(readFileSync(new URL("../src/migrations/20261002_005506_phase4_youtube_video.json", import.meta.url), "utf8"));

test("video migration adds current/version fields and is registered", () => {
  assert.match(migration, /ALTER TABLE "machines" ADD COLUMN "video_url" varchar/);
  assert.match(migration, /ALTER TABLE "_machines_v" ADD COLUMN "version_video_url" varchar/);
  assert.match(registry, /20261002_005506_phase4_youtube_video/);
  assert.ok(snapshot.tables["public.machines"].columns.video_url);
  assert.ok(snapshot.tables["public._machines_v"].columns.version_video_url);
});

test("video migration rollback refuses to discard stored URLs before dropping fields", () => {
  const guardAt = migration.indexOf("Phase 4 rollback refused");
  const dropAt = migration.indexOf('ALTER TABLE "machines" DROP COLUMN');
  assert.ok(guardAt >= 0 && dropAt > guardAt);
  assert.match(migration, /public\.machines WHERE "video_url" IS NOT NULL/);
  assert.match(migration, /public\._machines_v WHERE "version_video_url" IS NOT NULL/);
});
