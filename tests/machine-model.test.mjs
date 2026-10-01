import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  appendHistoricalSlug,
  createMachineSlug,
  formatMachineId,
  hasMachineIdSuffix,
  machinePath,
} from "../src/lib/machines/identity.ts";

test("machine references are permanent sequential HGR identifiers", () => {
  assert.equal(formatMachineId(1), "HGR-000001");
  assert.equal(formatMachineId(27), "HGR-000027");
  assert.equal(formatMachineId(1_000_000), "HGR-1000000");
  assert.throws(() => formatMachineId(0), RangeError);
});

test("readable machine routes include permanent identity and tolerate duplicate facts", () => {
  const facts = { brand: "Komatsu", model: "PC200-8", year: 2018 };
  const first = createMachineSlug(facts, "HGR-000001");
  const second = createMachineSlug(facts, "HGR-000002");

  assert.equal(first, "2018-komatsu-pc200-8-hgr-000001");
  assert.notEqual(first, second);
  assert.equal(machinePath(first), `/machines/${first}`);
  assert.match(machinePath(first), /hgr-000001$/);
  assert.equal(hasMachineIdSuffix(first, "HGR-000001"), true);
  assert.equal(hasMachineIdSuffix(first, "HGR-000002"), false);
});

test("route corrections retain every prior path for the same machine", () => {
  const firstSlug = "2018-komatsu-pc200-hgr-000001";
  const correctedSlug = "2018-komatsu-pc200-8-hgr-000001";
  const laterSlug = "2018-komatsu-pc200-8-excavator-hgr-000001";

  assert.deepEqual(appendHistoricalSlug([], firstSlug, correctedSlug), [firstSlug]);
  assert.deepEqual(
    appendHistoricalSlug([firstSlug], correctedSlug, laterSlug),
    [firstSlug, correctedSlug],
  );
  assert.deepEqual(appendHistoricalSlug([firstSlug], correctedSlug, correctedSlug), [firstSlug]);
});

test("machine configuration protects identity from routine changes and deletion", async () => {
  const [collection, config] = await Promise.all([
    readFile(new URL("../src/collections/Machines.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/payload.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(config, /Machines/);
  assert.match(collection, /disableDuplicate:\s*true/);
  assert.match(collection, /delete:\s*deny/);
  assert.match(collection, /unique:\s*true/);
  assert.match(collection, /originalDoc/);
});
