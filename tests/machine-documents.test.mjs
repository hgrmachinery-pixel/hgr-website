import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Payload registers machine documents only on private object storage", async () => {
  const config = await readFile(new URL("../src/payload.config.ts", import.meta.url), "utf8");
  assert.match(config, /collections:\s*\[[^\]]*MachineDocuments/s);
  assert.match(config, /"machine-documents":\s*true/);
});
