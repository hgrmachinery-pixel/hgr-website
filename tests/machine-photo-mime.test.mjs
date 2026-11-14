import assert from "node:assert/strict";
import test from "node:test";

import { machinePhotoMimeType } from "../src/lib/machines/media.ts";

test("Sharp HEIF metadata distinguishes AVIF from HEIC by codec", () => {
  assert.equal(machinePhotoMimeType({ format: "heif", compression: "av1" }), "image/avif");
  assert.equal(machinePhotoMimeType({ format: "heif", compression: "hevc" }), undefined);
  assert.equal(machinePhotoMimeType({ format: "heif" }), undefined);
});

test("supported image metadata maps to the corresponding upload MIME types", () => {
  assert.equal(machinePhotoMimeType({ format: "jpeg" }), "image/jpeg");
  assert.equal(machinePhotoMimeType({ format: "png" }), "image/png");
  assert.equal(machinePhotoMimeType({ format: "webp" }), "image/webp");
  assert.equal(machinePhotoMimeType({ format: "tiff" }), undefined);
});
