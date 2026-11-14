import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";

import { blurSensitiveAreas, createResponsiveMachineImage } from "../src/lib/machines/media-image.ts";

async function checkerboardPhoto(orientation) {
  const width = 3200;
  const height = 1600;
  const pixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = ((Math.floor(x / 16) + Math.floor(y / 16)) % 2) * 255;
      const offset = (y * width + x) * 3;
      pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = value;
    }
  }
  return sharp(pixels, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 100 })
    .withMetadata({ orientation })
    .toBuffer();
}

async function regionDifference(first, second, region) {
  const [a, b] = await Promise.all([
    sharp(first).extract(region).raw().toBuffer(),
    sharp(second).extract(region).raw().toBuffer(),
  ]);
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference += Math.abs(a[index] - b[index]);
  return difference / a.length;
}

for (const orientation of [1, 6]) {
  test(`redaction covers the selected pixels after >1600px resizing with EXIF orientation ${orientation}`, async () => {
    const source = await checkerboardPhoto(orientation);
    const original = Buffer.from(source);
    const box = { left: 0.2, top: 0.2, width: 0.2, height: 0.2 };
    const baseline = await createResponsiveMachineImage(source);
    const redacted = await blurSensitiveAreas(source, [box]);
    const metadata = await sharp(redacted).metadata();
    const expected = orientation === 6 ? { width: 800, height: 1600 } : { width: 1600, height: 800 };
    assert.deepEqual({ width: metadata.width, height: metadata.height }, expected);
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.orientation, undefined);
    assert.deepEqual(source, original);

    // Sample inside the selected box, away from blur/compression boundaries.
    // Reusing original-size overlays after resizing leaves this area unblurred.
    const inside = {
      left: Math.round(expected.width * 0.25), top: Math.round(expected.height * 0.25),
      width: Math.round(expected.width * 0.1), height: Math.round(expected.height * 0.1),
    };
    assert.ok(await regionDifference(redacted, baseline, inside) > 60, "selected sensitive pixels must be blurred");

    const outside = {
      left: Math.round(expected.width * 0.8), top: Math.round(expected.height * 0.8),
      width: Math.round(expected.width * 0.1), height: Math.round(expected.height * 0.1),
    };
    assert.ok(await regionDifference(redacted, baseline, outside) < 5, "pixels outside the selected box must remain unchanged apart from encoding noise");
  });
}
