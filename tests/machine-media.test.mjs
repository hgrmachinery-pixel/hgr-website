import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

import { MachineMedia } from "../src/collections/MachineMedia.ts";
import * as media from "../src/lib/machines/media.ts";
import * as image from "../src/lib/machines/media-image.ts";
import { isUnchangedStorageMetadataEcho } from "../src/lib/machines/storage-metadata-echo.ts";
import { processMachinePhoto } from "../src/lib/machines/media-process.ts";
import { changedMachineMediaFields } from "../src/lib/machines/media-update.ts";

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

test("master upload retains the database serial policy revision when Payload replaces request context", async () => {
  const beforeOperation = MachineMedia.hooks?.beforeOperation?.[0];
  const beforeChange = MachineMedia.hooks?.beforeChange?.[0];
  assert.ok(beforeOperation);
  assert.ok(beforeChange);

  const originalContext = {};
  const request = {
    context: originalContext,
    file: { name: "synthetic.jpg", mimetype: "image/jpeg", data: Buffer.from("synthetic-image") },
    user: { collection: "users", id: 73 },
    payload: {
      findByID: async () => {
        request.context = { ...request.context };
        return { hgrId: "HGR-000073", serialVisibilityRevision: 4 };
      },
      db: {
        drizzle: {},
        execute: async () => ({ rows: [{ value: 1 }] }),
      },
    },
  };
  const args = { data: { machine: 73, category: "engine" } };

  await beforeOperation({ args, operation: "create", req: request });
  await beforeChange({ data: args.data, operation: "create", req: request });

  assert.equal(originalContext.machinePhotoPolicyRevision, undefined);
  assert.equal(request.context.machinePhotoPolicyRevision, 4);
  assert.equal(args.data.review.serialPolicyRevision, 4);
  assert.equal(args.data.review.status, "needs-review");
});

test("Payload storage metadata echo allows only an unchanged staff record", async () => {
  const beforeChange = MachineMedia.hooks?.beforeChange?.[0];
  const photo = {
    id: 12,
    machine: 73,
    assetKind: "master",
    filename: "hgr-000073-engine-000001.jpg",
    contentDigest: "sha256:master",
    photoIdentity: "photo-identity",
    review: { status: "needs-review", serialPolicyRevision: 4 },
    reviewHistory: [{ event: "uploaded", revision: 1 }],
    auditHistory: [{ event: "uploaded", digest: "sha256:master" }],
  };
  const lockedHistory = { reviewHistory: photo.reviewHistory, auditHistory: photo.auditHistory };
  const callUpdateHook = async ({ data, context = { skipCloudStorage: true }, user = { collection: "users", id: 73 }, file, uploadSizes } = {}) => {
    let query = 0;
    const req = {
      context,
      user,
      file,
      payloadUploadSizes: uploadSizes,
      transactionID: Promise.resolve("test-transaction"),
      payload: {
        db: {
          drizzle: {},
          sessions: { "test-transaction": { db: {} } },
          execute: async () => ({ rows: query++ === 0 ? [{ serialVisibilityRevision: 4 }] : [lockedHistory] }),
        },
      },
    };
    return beforeChange({ data, operation: "update", originalDoc: photo, req });
  };

  assert.ok(beforeChange);
  assert.deepEqual(await callUpdateHook({ data: { ...photo } }), photo);
  await assert.rejects(() => callUpdateHook({ data: { ...photo, contentDigest: "sha256:forged" } }), /unchanged staff photo record/);
  await assert.rejects(() => callUpdateHook({ data: { ...photo, filename: "forged.jpg" } }), /unchanged staff photo record/);
  await assert.rejects(() => callUpdateHook({ data: { ...photo }, user: null }), /unchanged staff photo record/);
  await assert.rejects(() => callUpdateHook({ data: { ...photo }, file: { data: Buffer.from("replacement") } }), /unchanged staff photo record/);
  await assert.rejects(() => callUpdateHook({ data: { ...photo }, uploadSizes: { card: {} } }), /unchanged staff photo record/);
  await assert.rejects(() => callUpdateHook({ data: { ...photo, auditHistory: [{ event: "forged" }] } }), /unchanged staff photo record/);
  await assert.rejects(() => callUpdateHook({
    data: { ...photo, review: { status: "approved", serialPolicyRevision: 4 } },
    context: { skipCloudStorage: true, machinePhotoReview: true },
  }), /unchanged staff photo record/);
  await assert.rejects(() => callUpdateHook({ data: { filename: "forged.jpg" }, context: {} }), /Only factual alternative text/);
  const beforeDelete = MachineMedia.hooks?.beforeDelete?.[0];
  assert.ok(beforeDelete);
  assert.throws(() => beforeDelete({}), /deletion is disabled/);
});

test("Payload merged photo updates compare changed fields and accept a recorded sensitive hold", async () => {
  const checklist = Object.fromEntries(media.PHOTO_REVIEW_CHECKLIST.map((key) => [key, "clear"]));
  checklist.personalInformation = "found";
  const original = {
    id: 12, machine: 73, assetKind: "derivative", photoIdentity: "photo-1", revision: 1,
    contentDigest: "sha256:photo", processingStatus: "ready", updatedAt: "2026-11-01T00:00:00.000Z",
    review: { status: "approved", revision: 1, digest: "sha256:photo", serialPolicyRevision: 4, checklist: Object.fromEntries(media.PHOTO_REVIEW_CHECKLIST.map((key) => [key, "clear"])) },
    reviewHistory: [{ event: "approved", revision: 1, reviewer: 73 }],
    auditHistory: [{ event: "approved", actor: 73, at: "2026-11-01T00:00:00.000Z", revision: 1, digest: "sha256:photo" }],
    approvedBy: 73, approvedAt: "2026-11-01T00:00:00.000Z", lastModifiedBy: 73, lastModifiedAt: "2026-11-01T00:00:00.000Z",
  };
  const event = { event: "sensitive-information-found", revision: 1, digest: "sha256:photo", serialPolicyRevision: 4, reviewer: 73, reviewedAt: "2026-11-10T00:00:00.000Z", checklist };
  const auditEvent = { event: event.event, actor: 73, at: event.reviewedAt, revision: 1, digest: "sha256:photo", serialPolicyRevision: 4, checklist };
  const merged = {
    ...original,
    review: { status: "needs-review", revision: 1, digest: "sha256:photo", serialPolicyRevision: 4, reviewedBy: 73, reviewedAt: event.reviewedAt, checklist },
    reviewHistory: [...original.reviewHistory, event],
    auditHistory: [...original.auditHistory, auditEvent],
    approvedBy: null, approvedAt: null, lastModifiedBy: 73, lastModifiedAt: event.reviewedAt,
    updatedAt: "2026-11-10T00:00:00.000Z",
  };
  assert.deepEqual(changedMachineMediaFields(merged, original).sort(), ["approvedAt", "approvedBy", "auditHistory", "lastModifiedAt", "review", "reviewHistory"].sort());
  const hook = MachineMedia.hooks.beforeChange[0];
  let query = 0;
  await hook({
    data: merged, operation: "update", originalDoc: original,
    req: {
      context: { machinePhotoReview: true }, user: { id: 73 }, transactionID: Promise.resolve("test"),
      payload: { db: { drizzle: {}, sessions: { test: { db: {} } }, execute: async () => ({ rows: query++ === 0 ? [{ serialVisibilityRevision: 4 }] : [{ reviewHistory: original.reviewHistory, auditHistory: original.auditHistory }] }) } },
    },
  });
  assert.equal(media.isPublicMachineDerivative(merged, { id: 73, _status: "published", archived: false, serialVisibilityRevision: 4, featuredImage: 12, gallery: [12], currentPhotoRevisions: { "photo-1": 1 } }), false);
});

test("storage echo comparator rejects changed or stale protected fields", () => {
  const photo = {
    filename: "hgr-000073-engine-000001.jpg",
    contentDigest: "sha256:master",
    photoIdentity: "photo-identity",
    _objectKey: "stable-key",
    prefix: "machine-media/hgr-000073",
    review: { status: "needs-review", serialPolicyRevision: 4 },
    reviewHistory: [{ event: "uploaded", revision: 1 }],
    auditHistory: [{ event: "uploaded", digest: "sha256:master" }],
  };
  const lockedHistory = { reviewHistory: photo.reviewHistory, auditHistory: photo.auditHistory };

  assert.equal(isUnchangedStorageMetadataEcho({ ...photo }, photo, lockedHistory), true);
  for (const [field, changedValue] of [
    ["filename", "forged.jpg"],
    ["contentDigest", "sha256:forged"],
    ["photoIdentity", "forged-identity"],
    ["_objectKey", "forged-key"],
    ["prefix", "public/forged"],
    ["review", { status: "approved", serialPolicyRevision: 4 }],
    ["reviewHistory", [{ event: "forged" }]],
    ["auditHistory", [{ event: "forged" }]],
    ["unexpectedField", "forged"],
  ]) {
    assert.equal(isUnchangedStorageMetadataEcho({ ...photo, [field]: changedValue }, photo, lockedHistory), false, field);
  }
  assert.equal(isUnchangedStorageMetadataEcho({ ...photo }, photo, { ...lockedHistory, reviewHistory: [{ event: "newer-review" }] }), false);
});

test("serial visibility changes revoke all existing machine photo reviews", async () => {
  const machines = await readFile(new URL("../src/collections/Machines.ts", import.meta.url), "utf8");
  const mediaSource = await readFile(new URL("../src/lib/machines/media.ts", import.meta.url), "utf8");
  assert.match(machines, /serialVisibilityPolicyChanged/);
  assert.match(machines, /serial-visibility-policy-changed/);
  assert.match(mediaSource, /export function serialVisibilityPolicyChanged/);
  assert.equal(media.isPhotoReviewComplete(Object.fromEntries(media.PHOTO_REVIEW_CHECKLIST.map((key) => [key, "clear"]))), true);
  assert.equal(media.isPhotoReviewComplete(Object.fromEntries(media.PHOTO_REVIEW_CHECKLIST.map((key) => [key, key === "manufacturerSerialNumbers" ? "found" : "clear"]))), false);
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
  const untouched = { ...derivative, review: { status: "needs-review", revision: 1, digest: "sha256:abc", serialPolicyRevision: 1 }, reviewHistory: [] };
  assert.equal(media.isPublicMachineDerivative(untouched, machine), true, "ordinary ready photos need no checklist approval after owner publication");
  assert.equal(media.isPublicMachineDerivative({ ...untouched, reviewHistory: [{ event: "sensitive-information-found", revision: 1 }] }, machine), false);
  assert.equal(media.machinePhotoRequiresHumanReview({ ...untouched, reviewHistory: [{ event: "review-required-carried-forward", revision: 1 }] }), true);
  assert.equal(media.isPublicMachineDerivative({ ...derivative, reviewHistory: [{ event: "review-required-carried-forward", revision: 1 }, { event: "approved", revision: 1 }] }, machine), true, "a fresh clear approval resolves the carried hold for that exact revision");
  assert.equal(media.machinePhotoRequiresHumanReview({ ...untouched, review: { ...untouched.review, checklist: { barcodes: "found" } } }), true);
  assert.equal(media.machinePhotoRequiresHumanReview({ ...derivative, reviewHistory: [{ event: "sensitive-information-found", revision: 1 }, { event: "approved", revision: 1 }] }), false);
  assert.equal(media.isPublicMachineDerivative({ ...derivative, reviewHistory: [{ event: "approved", revision: 1 }, { event: "owner-escalation", revision: 1 }] }, machine), false, "a later sensitive finding overrides earlier approval");
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

test("approved HGR domain watermark defaults render centered white text at 20 percent opacity", async () => {
  const options = image.DEFAULT_WATERMARK_OPTIONS;
  assert.deepEqual(options, {
    mode: "domain-text",
    placement: "center-lower",
    sizePercent: 4,
    opacity: 0.2,
    margin: 24,
    domain: "hgrmachinery.com",
  });
  const source = await sharp({ create: { width: 480, height: 320, channels: 3, background: { r: 30, g: 60, b: 90 } } }).png().toBuffer();
  const before = Buffer.from(source);
  const result = await image.applyWatermark(source, options);
  const { data, info } = await sharp(result).raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 480);
  assert.equal(info.height, 320);
  assert.ok(data.some((value) => value > 90), "white domain text should be rendered into the derivative");
  assert.deepEqual(source, before, "the source master bytes must remain unchanged");
});

test("synthetic watermark rendering preserves resized dimensions and remains visibly localized", async () => {
  const scene = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1600">
    <defs><linearGradient id="sky"><stop stop-color="#6f8794"/><stop offset="1" stop-color="#c2aa76"/></linearGradient></defs>
    <rect width="2400" height="1600" fill="url(#sky)"/>
    <path d="M0 1200h2400v400H0z" fill="#4a4c46"/>
    <path d="M680 1070h600v230H680zM960 850h130v240H960zM1020 880l500-430 70 80-490 430zM1510 450l260 80-35 110-265-80z" fill="#ed861a" stroke="#202522" stroke-width="22"/>
    <circle cx="820" cy="1320" r="125" fill="#252a2a"/><circle cx="1190" cy="1320" r="125" fill="#252a2a"/>
    <path d="M120 1480h2160M260 1380h1900" stroke="#aaa58f" stroke-width="12" opacity=".55"/>
  </svg>`;
  const source = await sharp(Buffer.from(scene)).jpeg({ quality: 92 }).toBuffer();
  const original = Buffer.from(source);
  const resized = await image.createResponsiveMachineImage(source);
  const syntheticLogo = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><rect x="4" y="8" width="392" height="84" rx="12" fill="#ff4a00"/><path d="M35 70h75V40H35zm90 0h70V25h-70z" fill="#ffffff"/></svg>';
  const watermarked = await image.applyWatermark(resized, {
    mode: "hgr-logo", placement: "bottom-right", sizePercent: 16, opacity: 0.9, margin: 24,
    approvedArtwork: true, logoSvg: syntheticLogo,
  });
  const [resizedMetadata, markedMetadata] = await Promise.all([
    sharp(resized).metadata(),
    sharp(watermarked).metadata(),
  ]);
  assert.deepEqual(
    { width: resizedMetadata.width, height: resizedMetadata.height, format: resizedMetadata.format },
    { width: 1600, height: 1067, format: "webp" },
  );
  assert.deepEqual(
    { width: markedMetadata.width, height: markedMetadata.height, format: markedMetadata.format },
    { width: resizedMetadata.width, height: resizedMetadata.height, format: "webp" },
  );

  const [reference, basePixels, markedPixels] = await Promise.all([
    sharp(source).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).raw().toBuffer({ resolveWithObject: true }),
    sharp(resized).raw().toBuffer({ resolveWithObject: true }),
    sharp(watermarked).raw().toBuffer({ resolveWithObject: true }),
  ]);
  let squaredError = 0;
  for (let index = 0; index < reference.data.length; index++) {
    const difference = reference.data[index] - basePixels.data[index];
    squaredError += difference * difference;
  }
  const psnr = 10 * Math.log10((255 * 255) / (squaredError / reference.data.length));
  assert.ok(psnr > 25, `resized image PSNR was ${psnr.toFixed(2)} dB`);

  const markWidth = Math.round(markedPixels.info.width * 0.16);
  const markHeight = Math.round(markWidth * 0.3);
  const markLeft = markedPixels.info.width - markWidth - 24;
  const markTop = markedPixels.info.height - markHeight - 24;
  let insideDifference = 0, insideChannels = 0, outsideDifference = 0, outsideChannels = 0, visiblePixels = 0;
  for (let y = 0; y < markedPixels.info.height; y++) {
    for (let x = 0; x < markedPixels.info.width; x++) {
      const inside = x >= markLeft && x < markLeft + markWidth && y >= markTop && y < markTop + markHeight;
      const offset = (y * markedPixels.info.width + x) * markedPixels.info.channels;
      let pixelDifference = 0;
      for (let channel = 0; channel < 3; channel++) pixelDifference += Math.abs(basePixels.data[offset + channel] - markedPixels.data[offset + channel]);
      if (inside) {
        insideDifference += pixelDifference;
        insideChannels += 3;
        if (pixelDifference > 75) visiblePixels++;
      } else {
        outsideDifference += pixelDifference;
        outsideChannels += 3;
      }
    }
  }
  const insideMeanDifference = insideDifference / insideChannels;
  const outsideMeanDifference = outsideDifference / outsideChannels;
  assert.ok(insideMeanDifference > outsideMeanDifference * 3, "watermark should change its placement region more than the rest of the image");
  assert.ok(visiblePixels > 100, "synthetic watermark should produce clearly changed pixels");
  assert.deepEqual(source, original, "processing must leave the uploaded source bytes unchanged");
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

test("photo processing and review serialize on the machine row and carry unresolved holds", async () => {
  const processor = await readFile(new URL("../src/lib/machines/media-process.ts", import.meta.url), "utf8");
  const review = await readFile(new URL("../src/lib/machines/media-review.ts", import.meta.url), "utf8");
  assert.match(processor, /initTransaction\(transactionReq\)[\s\S]*?SELECT "id" FROM "machines" WHERE "id" = \$\{machineId\} FOR UPDATE/);
  assert.match(review, /SELECT "id" FROM "machines" WHERE "id" = \$\{machineId\} FOR UPDATE/);
  assert.match(processor, /const latest = existing\.docs\[0\][\s\S]*?machinePhotoRequiresHumanReview\(latest\)/);
  assert.match(processor, /event: "review-required-carried-forward"/);
  assert.match(review, /approvedBy: !uncertain && !found \? auth\.user\.id : null/);
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
