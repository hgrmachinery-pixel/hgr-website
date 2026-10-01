import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const categories = [
  "general-exterior",
  "side-view-1",
  "side-view-2",
  "front-view",
  "rear-view",
  "cabin-interior",
  "hour-meter",
  "chassis-serial-number",
  "engine",
  "undercarriage-tracks",
  "boom-arm-bucket",
  "other-details",
];

test("photo policy defines all twelve required machine photography categories", async () => {
  const implementation = await readFile(new URL("../src/lib/machines/media.ts", import.meta.url), "utf8");
  for (const category of categories) assert.match(implementation, new RegExp(category));
});

test("machine photo masters remain staff-only and initialize as Needs Review", async () => {
  const config = await readFile(new URL("../src/collections/MachineMedia.ts", import.meta.url), "utf8");
  assert.match(config, /read:\s*staffAccess/);
  assert.match(config, /name:\s*["']category["']/);
  assert.match(config, /defaultValue:\s*["']needs-review["']/i);
});
