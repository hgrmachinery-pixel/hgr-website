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
  assert.deepEqual(media.initialPhotoReview(2), { status: "needs-review", revision: 2, serialPolicyRevision: 1 });
});

test("initial photo review stamps a valid server-selected serial policy revision", () => {
  assert.deepEqual(media.initialPhotoReview(2, 4), { status: "needs-review", revision: 2, serialPolicyRevision: 4 });
  assert.deepEqual(media.initialPhotoReview(), { status: "needs-review", revision: 1, serialPolicyRevision: 1 });
});

test("master upload independently reads and validates the current serial policy in beforeChange", async () => {
  const collection = await readFile(new URL("../src/collections/MachineMedia.ts", import.meta.url), "utf8");
  assert.match(collection, /overrideAccess:\s*false,[\s\S]*req,\s*\}\);[\s\S]*validSerialPolicyRevision\(machine\?\.serialVisibilityRevision\)/);
  assert.doesNotMatch(collection, /Number\(context\.machinePhotoPolicyRevision\)/);
  assert.match(collection, /data\.review\s*=\s*initialPhotoReview\(1, serialPolicyRevision\)/);
  assert.match(collection, /name: "serialPolicyRevision", type: "number", required: true/);
  assert.match(collection, /Number\(\(data\.review as Record<string, unknown>\)\.serialPolicyRevision\) !== Number\(machine\.serialVisibilityRevision \?\? 1\)/);
});

test("serial visibility changes revoke all existing machine photo reviews", async () => {
  const machines = await readFile(new URL("../src/collections/Machines.ts", import.meta.url), "utf8");
  const mediaSource = await readFile(new URL("../src/lib/machines/media.ts", import.meta.url), "utf8");
  assert.match(machines, /serialVisibilityPolicyChanged/);
  assert.match(machines, /serial-visibility-policy-changed/);
  assert.match(mediaSource, /export function serialVisibilityPolicyChanged/);
  assert.equal(media.serialVisibilityPolicyChanged({ showSerialPublicly: false }, { showSerialPublicly: true }), true);
  assert.equal(media.isPhotoReviewComplete(Object.fromEntries(media.PHOTO_REVIEW_CHECKLIST.map((key) => [key, "clear"]))), true);
  assert.equal(media.isPhotoReviewComplete(Object.fromEntries(media.PHOTO_REVIEW_CHECKLIST.map((key) => [key, key === "manufacturerSerialNumbers" ? "found" : "clear"]))), false);
});

test("serial policy revision changes make a previously approved derivative non-public", () => {
  const checklist = Object.fromEntries(media.PHOTO_REVIEW_CHECKLIST.map((key) => [key, "clear"]));
  const derivative = {
    id: 92,
    assetKind: "derivative",
    machine: 1,
    photoIdentity: "synthetic-photo",
    processingStatus: "ready",
    revision: 1,
    contentDigest: "sha256:synthetic",
    review: { status: "approved", revision: 1, digest: "sha256:synthetic", serialPolicyRevision: 1, reviewedBy: 2, reviewedAt: "2026-10-01T00:00:00.000Z", checklist },
  };
  const machine = { id: 1, _status: "published", archived: false, showSerialPublicly: false, serialVisibilityRevision: 1, featuredImage: 92, gallery: [92], currentPhotoRevisions: { "synthetic-photo": 1 } };
  assert.equal(media.isPublicMachineDerivative(derivative, machine), true);

  const policyChanged = { ...machine, showSerialPublicly: true, serialVisibilityRevision: 2 };
  assert.equal(media.serialVisibilityPolicyChanged(machine, policyChanged), true);
  assert.equal(media.isPublicMachineDerivative(derivative, policyChanged), false);
});

test("photo review and audit histories preserve prior events", async () => {
  const collection = await readFile(new URL("../src/collections/MachineMedia.ts", import.meta.url), "utf8");
  const review = await readFile(new URL("../src/lib/machines/media-review.ts", import.meta.url), "utf8");
  assert.match(collection, /historyIsAppendOnly/);
  assert.match(collection, /beforeDelete:\s*\[\(\)\s*=>\s*\{\s*throw/);
  assert.match(review, /initTransaction/);
  assert.match(review, /FOR UPDATE/);
  const previous = [{ event: "uploaded", actor: 4, at: "2026-10-01T00:00:00.000Z" }];
  assert.equal(media.historyIsAppendOnly(previous, [...previous, { event: "approved" }]), true);
  assert.equal(media.historyIsAppendOnly(previous, [{ event: "forged" }, { event: "approved" }]), false);
});

test("public machine media fails closed unless an exact reviewed derivative is selected", () => {
  const checklist = Object.fromEntries([
    "manufacturerSerialNumbers", "chassisVinNumbers", "engineNumbers", "registrationNumbers", "qrCodes",
    "barcodes", "customerLabels", "deliveryInformation", "personalInformation", "otherSensitiveIdentifiers",
  ].map((key) => [key, "clear"]));
  const derivative = {
    id: 92, assetKind: "derivative", machine: 28, photoIdentity: "photo-uuid-1", processingStatus: "ready", revision: 1,
    contentDigest: "sha256:abc",
    review: { status: "approved", revision: 1, digest: "sha256:abc", serialPolicyRevision: 1, reviewedBy: 4, reviewedAt: "2026-10-01T10:00:00.000Z", checklist },
  };
  const machine = { id: 28, _status: "published", archived: false, serialVisibilityRevision: 1, featuredImage: 92, gallery: [92], currentPhotoRevisions: { "photo-uuid-1": 1 } };
  assert.equal(media.isPublicMachineDerivative(derivative, machine), true);
  assert.equal(media.isPublicMachineDerivative(derivative, { ...machine, serialVisibilityRevision: 2 }), false);
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
    review: { status: "approved", revision: 1, digest: "sha256:abc", serialPolicyRevision: 1, reviewedBy: 4, reviewedAt: "2026-10-01T10:00:00.000Z", checklist },
  };
  const machine = { id: 28, _status: "published", archived: false, serialVisibilityRevision: 1, featuredImage: 92, gallery: [92], currentPhotoRevisions: { "photo-uuid-1": 1 } };
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

test("master upload reports bounded client errors but hides server response internals", () => {
  assert.equal(
    media.machinePhotoUploadFailure(400, JSON.stringify({ errors: [{ message: "Choose a machine before uploading its photo" }] })),
    "Master photo upload failed (HTTP 400). Choose a machine before uploading its photo",
  );
  assert.equal(
    media.machinePhotoUploadFailure(500, JSON.stringify({ message: "secret database connection string" })),
    "Master photo upload failed (HTTP 500). Check sanitized server logs before retrying.",
  );
  assert.equal(
    media.machinePhotoUploadFailure(502, "proxy internal detail"),
    "Master photo upload failed (HTTP 502). Check sanitized server logs before retrying.",
  );
  assert.equal(media.machinePhotoUploadFailure(403, "not-json"), "Master photo upload failed (HTTP 403).");
  assert.equal(media.machinePhotoUploadFailure(201, "{}"), "Master photo upload failed (HTTP 201).");
});

test("machine photo pixel limit is configurable and validated", () => {
  assert.equal(image.configuredMachinePhotoMaxPixels({}), 20_000_000);
  assert.equal(image.configuredMachinePhotoMaxPixels({ HGR_MACHINE_PHOTO_MAX_PIXELS: "12000000" }), 12_000_000);
  assert.throws(() => image.configuredMachinePhotoMaxPixels({ HGR_MACHINE_PHOTO_MAX_PIXELS: "0" }), /positive whole number/i);
  assert.throws(() => image.configuredMachinePhotoMaxPixels({ HGR_MACHINE_PHOTO_MAX_PIXELS: "12.5" }), /positive whole number/i);
});

test("machine photo processing resizes large images proportionally without upscaling", async () => {
  const landscape = await sharp({ create: { width: 4000, height: 2000, channels: 3, background: "#cc5500" } }).jpeg().toBuffer();
  const landscapeOutput = await image.createResponsiveMachineImage(landscape);
  assert.deepEqual(await sharp(landscapeOutput).metadata().then(({ width, height, format }) => ({ width, height, format })), { width: 1600, height: 800, format: "webp" });

  const portrait = await sharp({ create: { width: 1200, height: 2400, channels: 3, background: "#cc5500" } }).jpeg().toBuffer();
  const portraitOutput = await image.createResponsiveMachineImage(portrait);
  assert.deepEqual(await sharp(portraitOutput).metadata().then(({ width, height }) => ({ width, height })), { width: 800, height: 1600 });

  const small = await sharp({ create: { width: 240, height: 120, channels: 3, background: "#cc5500" } }).jpeg().toBuffer();
  const smallOutput = await image.createResponsiveMachineImage(small);
  assert.deepEqual(await sharp(smallOutput).metadata().then(({ width, height }) => ({ width, height })), { width: 240, height: 120 });
});

test("machine photo processing applies EXIF orientation and rejects excessive or malformed images", async () => {
  const rotated = await sharp({ create: { width: 400, height: 200, channels: 3, background: "#cc5500" } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const rotatedMetadata = await image.inspectMachinePhoto(rotated);
  assert.equal(rotatedMetadata.width, 400);
  assert.equal(rotatedMetadata.height, 200);
  const rotatedOutput = await image.createResponsiveMachineImage(rotated);
  assert.deepEqual(await sharp(rotatedOutput).metadata().then(({ width, height }) => ({ width, height })), { width: 200, height: 400 });

  const tooLarge = await sharp({ create: { width: 200, height: 100, channels: 3, background: "#cc5500" } }).png().toBuffer();
  await assert.rejects(() => image.inspectMachinePhoto(tooLarge, 10_000), image.MachinePhotoPixelLimitError);
  await assert.rejects(() => image.createResponsiveMachineImage(tooLarge, 10_000), image.MachinePhotoPixelLimitError);
  await assert.rejects(() => image.inspectMachinePhoto(Buffer.from("not an image")), /decode|unsupported|input/i);
});

test("bounded photo batch work never exceeds one concurrent upload", async () => {
  let active = 0;
  let peak = 0;
  await media.runBounded(Array.from({ length: 30 }, (_, index) => index), 1, async () => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 1));
    active -= 1;
  });
  assert.equal(peak, 1);
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

test("separate responsive Sharp variants use synthetic source and preserve its bytes", async () => {
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

test("Sharp creates a bounded oriented WebP derivative without mutating source bytes", async () => {
  const source = await sharp({ create: { width: 80, height: 40, channels: 3, background: "#cc5500" } }).jpeg().toBuffer();
  const original = Buffer.from(source);
  const derivative = await image.createResponsiveMachineImage(source);
  assert.equal((await sharp(derivative).metadata()).format, "webp");
  assert.deepEqual(source, original);
});
