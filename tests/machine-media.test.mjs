import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

import * as media from "../src/lib/machines/media.ts";
import * as image from "../src/lib/machines/media-image.ts";
import { processMachinePhoto } from "../src/lib/machines/media-process.ts";

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
  assert.deepEqual(media.MACHINE_PHOTO_CATEGORIES, categories);
});

test("machine photo masters remain staff-only and initialize as Needs Review", async () => {
  const config = await readFile(new URL("../src/collections/MachineMedia.ts", import.meta.url), "utf8");
  assert.match(config, /publicMachineMediaAccess/);
  assert.match(config, /isReadingStaticFile/);
  assert.match(config, /machinePhotoProcessing/);
  assert.match(config, /name:\s*["']category["']/);
  assert.match(config, /defaultValue:\s*["']needs-review["']/i);
});

test("machine photo names are generated from stable machine, category and photo sequence", () => {
  assert.equal(
    media.generatedMachinePhotoFilename("HGR-000028", "engine", 17, "image/jpeg"),
    "hgr-000028-engine-000017.jpg",
  );
  assert.throws(() => media.generatedMachinePhotoFilename("HGR-000028", "engine", 0, "image/jpeg"), /sequence/i);
  assert.throws(() => media.generatedMachinePhotoFilename("HGR-000028", "engine", 17, "image/svg+xml"), /unsupported/i);
});

test("each D-10 checklist must be explicitly clear before human approval", () => {
  const clear = Object.fromEntries([
    "manufacturerSerialNumbers", "chassisVinNumbers", "engineNumbers", "registrationNumbers", "qrCodes",
    "barcodes", "customerLabels", "deliveryInformation", "personalInformation", "otherSensitiveIdentifiers",
  ].map((key) => [key, "clear"]));
  assert.equal(media.isPhotoReviewComplete(clear), true);
  assert.equal(media.isPhotoReviewComplete({ ...clear, qrCodes: "found" }), false);
  assert.equal(media.isPhotoReviewComplete({ ...clear, personalInformation: "uncertain" }), false);
  assert.deepEqual(media.initialPhotoReview(2), { status: "needs-review", revision: 2 });
});

test("public machine media fails closed unless an exact reviewed derivative is selected", () => {
  const checklist = Object.fromEntries([
    "manufacturerSerialNumbers", "chassisVinNumbers", "engineNumbers", "registrationNumbers", "qrCodes",
    "barcodes", "customerLabels", "deliveryInformation", "personalInformation", "otherSensitiveIdentifiers",
  ].map((key) => [key, "clear"]));
  const derivative = {
    id: 92, assetKind: "derivative", machine: 28, photoIdentity: "photo-uuid-1", processingStatus: "ready", revision: 1,
    contentDigest: "sha256:abc",
    review: { status: "approved", revision: 1, digest: "sha256:abc", reviewedBy: 4, reviewedAt: "2026-10-01T10:00:00.000Z", checklist },
  };
  const machine = { id: 28, _status: "published", archived: false, featuredImage: 92, gallery: [92], currentPhotoRevisions: { "photo-uuid-1": 1 } };
  assert.equal(media.isPublicMachineDerivative(derivative, machine), true);
  assert.equal(media.isPublicMachineDerivative({ ...derivative, assetKind: "master" }, machine), false);
  assert.equal(media.isPublicMachineDerivative({ ...derivative, machine: 29 }, machine), false);
  assert.equal(media.isPublicMachineDerivative({ ...derivative, revision: 2 }, machine), false);
  assert.equal(media.isPublicMachineDerivative(derivative, { ...machine, _status: "draft" }), false);
  assert.equal(media.isPublicMachineDerivative(derivative, { ...machine, archived: true }), false);
  assert.equal(media.isPublicMachineDerivative(derivative, { ...machine, currentPhotoRevisions: { "photo-uuid-1": 2 } }), false);
  assert.equal(media.isPublicMachineDerivative({ ...derivative, review: { ...derivative.review, checklist: { ...checklist, barcodes: "found" } } }, machine), false);
  assert.equal(media.isPublicMediaDeliveryVerified(undefined), false);
  assert.equal(media.isPublicMediaDeliveryVerified("TRUE"), false);
  assert.equal(media.isPublicMediaDeliveryVerified("true"), true);
});

test("public static access resolves a unique current derivative and denies master or ambiguous filenames", async () => {
  const prior = process.env.HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED;
  process.env.HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED = "true";
  const checklist = Object.fromEntries(media.PHOTO_REVIEW_CHECKLIST.map((key) => [key, "clear"]));
  const derivative = {
    id: 92, filename: "hgr-000028-engine-000017-public-r1.webp", assetKind: "derivative", machine: 28,
    photoIdentity: "photo-uuid-1", processingStatus: "ready", revision: 1, contentDigest: "sha256:abc",
    review: { status: "approved", revision: 1, digest: "sha256:abc", reviewedBy: 4, reviewedAt: "2026-10-01T10:00:00.000Z", checklist },
  };
  const machine = { id: 28, _status: "published", archived: false, featuredImage: 92, gallery: [92], currentPhotoRevisions: { "photo-uuid-1": 1 } };
  const req = { payload: {
    find: async () => ({ docs: [derivative] }),
    findByID: async ({ collection }) => collection === "machines" ? machine : derivative,
  } };
  assert.deepEqual(await media.publicMachineMediaAccess({ req, data: { filename: derivative.filename } }), { id: { equals: 92 } });
  req.payload.find = async () => ({ docs: [{ ...derivative }, { ...derivative, id: 93 }] });
  assert.equal(await media.publicMachineMediaAccess({ req, data: { filename: derivative.filename } }), false);
  req.payload.find = async () => ({ docs: [{ ...derivative, assetKind: "master" }] });
  assert.equal(await media.publicMachineMediaAccess({ req, data: { filename: derivative.filename } }), false);
  if (prior === undefined) delete process.env.HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED;
  else process.env.HGR_PUBLIC_MEDIA_DELIVERY_VERIFIED = prior;
});

test("upload limits fail closed and batch validation permits representative synthetic batches", () => {
  const env = { HGR_MACHINE_PHOTO_MAX_FILE_BYTES: "30000000", HGR_MACHINE_PHOTO_MAX_BATCH_BYTES: "250000000" };
  assert.match(media.validateImageUpload(1000, 0, {}), /not configured/i);
  assert.equal(media.validateImageUpload(20_000_000, 0, env), undefined);
  assert.match(media.validateImageUpload(31_000_000, 0, env), /per-file/i);
  assert.match(media.validateImageUpload(10_000_000, 245_000_000, env), /batch/i);
  assert.equal(media.planImageBatch(Array.from({ length: 30 }, () => ({ size: 2_000_000 })), 3, env).totalBytes, 60_000_000);
  assert.throws(() => media.configuredImageLimits({ HGR_MACHINE_PHOTO_MAX_FILE_BYTES: "-1" }), /positive/i);
});

test("watermark artwork stays unavailable until approved and rejects active SVG content", () => {
  const base = { mode: "hgr-logo", placement: "bottom-right", sizePercent: 12, opacity: 0.7, margin: 24, logoSvg: "<svg/>" };
  assert.match(image.validateWatermarkOptions(base), /approval/i);
  assert.match(image.validateWatermarkOptions({ ...base, approvedArtwork: true, logoSvg: '<svg><script>alert(1)</script></svg>' }), /active content/i);
  assert.equal(image.validateWatermarkOptions({ ...base, approvedArtwork: true }), undefined);
});

test("measured progress stays indeterminate until computable and below 100 until server success", () => {
  assert.equal(media.measuredUploadProgress(5, 0, true), undefined);
  assert.equal(media.measuredUploadProgress(5, 10, false), undefined);
  assert.equal(media.measuredUploadProgress(5, 10, true), 50);
  assert.equal(media.measuredUploadProgress(10, 10, true), 99);
});

test("bounded batch work never exceeds its configured concurrent worker count", async () => {
  let active = 0;
  let peak = 0;
  await media.runBounded(Array.from({ length: 30 }, (_, index) => index), 3, async () => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 1));
    active -= 1;
  });
  assert.equal(peak, 3);
});

test("photo processing rejects a cross-origin request before authenticating or reading its body", async () => {
  const prior = process.env.SERVER_URL;
  process.env.SERVER_URL = "https://hgr.example";
  let authCalls = 0;
  const request = new Request("https://hgr.example/api/machine-media/process", {
    method: "POST", body: new Uint8Array([1, 2, 3]), headers: {
      origin: "https://attacker.example", "sec-fetch-site": "same-origin", "content-type": "image/jpeg", "content-length": "3",
    },
  });
  const result = await processMachinePhoto({ request, payload: { auth: async () => { authCalls += 1; throw new Error("should not authenticate"); } } });
  assert.equal(result.status, 403);
  assert.equal(authCalls, 0);
  if (prior === undefined) delete process.env.SERVER_URL;
  else process.env.SERVER_URL = prior;
});

test("responsive Sharp variants use synthetic source and preserve its bytes", async () => {
  const source = await sharp({ create: { width: 1800, height: 900, channels: 3, background: "#cc5500" } }).jpeg().toBuffer();
  const original = Buffer.from(source);
  const outputs = await image.createResponsiveMachineImages(source);
  assert.deepEqual(outputs.map((output) => output.width), [480, 960, 1600, 1800]);
  assert.ok((await Promise.all(outputs.map(({ buffer }) => sharp(buffer).metadata()))).every(({ format }) => format === "webp"));
  assert.deepEqual(source, original);
});

test("blurred revisions are separate outputs, and redaction coordinates must be normalized", async () => {
  const source = await sharp({ create: { width: 120, height: 80, channels: 3, background: "#cc5500" } }).jpeg().toBuffer();
  const original = Buffer.from(source);
  const boxes = media.validateRedactions([{ left: 0.1, top: 0.1, width: 0.2, height: 0.3 }]);
  assert.ok(boxes);
  const redacted = await image.blurSensitiveAreas(source, boxes);
  assert.notDeepEqual(redacted, source);
  assert.deepEqual(source, original);
  assert.equal(media.validateRedactions([{ left: 0.9, top: 0.9, width: 0.2, height: 0.2 }]), undefined);
});

test("Sharp creates an oriented WebP derivative without mutating source bytes", async () => {
  const source = await sharp({ create: { width: 80, height: 40, channels: 3, background: "#cc5500" } }).jpeg().toBuffer();
  const original = Buffer.from(source);
  const derivative = await image.createResponsiveMachineImage(source);
  assert.equal((await sharp(derivative).metadata()).format, "webp");
  assert.deepEqual(source, original);
});
