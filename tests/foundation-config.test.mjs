import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const fakeEnvironment = {
  DATABASE_URL: "postgresql://localhost/disposable_foundation_test",
  PAYLOAD_SECRET: "synthetic-test-secret-with-at-least-32-characters",
  SERVER_URL: "http://localhost:3000",
  R2_ENDPOINT: "https://synthetic-account.r2.cloudflarestorage.com",
  R2_BUCKET: "synthetic-foundation-test",
  R2_ACCESS_KEY_ID: "synthetic-access-key",
  R2_SECRET_ACCESS_KEY: "synthetic-secret-key-for-tests-only",
  HGR_MACHINE_PHOTO_MAX_FILE_BYTES: "5242880",
  HGR_MACHINE_PHOTO_MAX_BATCH_BYTES: "20971520",
};

function loadConfig(overrides = {}, assertions = "") {
  return spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      `import assert from 'node:assert/strict';
       const { default: pendingConfig } = await import('./src/payload.config.ts');
       const config = await pendingConfig;
       ${assertions}
       process.exit(0);`,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, ...fakeEnvironment, ...overrides },
      timeout: 60000,
    },
  );
}

test("required settings fail closed without printing their values", () => {
  for (const name of [
    "DATABASE_URL",
    "PAYLOAD_SECRET",
    "SERVER_URL",
    "R2_BUCKET",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ]) {
    const result = loadConfig({ [name]: "" });
    assert.notEqual(result.status, 0, `${name} should be required`);
    assert.match(
      result.stderr,
      new RegExp(`Missing required server environment variable: ${name}`),
    );
    assert.ok(!result.stderr.includes(fakeEnvironment.PAYLOAD_SECRET));
  }
  const noEndpoint = loadConfig({ R2_ENDPOINT: "" });
  assert.notEqual(noEndpoint.status, 0);
  assert.match(noEndpoint.stderr, /Missing required server environment variable: R2_ENDPOINT/);
});

test("invalid database, weak secret and unsafe public URL are rejected", () => {
  for (const [overrides, message] of [
    [
      { DATABASE_URL: "mysql://localhost/test" },
      "DATABASE_URL must use PostgreSQL",
    ],
    [
      { PAYLOAD_SECRET: "short" },
      "PAYLOAD_SECRET must contain at least 32 characters",
    ],
    [
      { SERVER_URL: "ftp://localhost" },
      "SERVER_URL must be an HTTP or HTTPS URL without credentials",
    ],
    [
      { SERVER_URL: "http://user:password@localhost" },
      "SERVER_URL must be an HTTP or HTTPS URL without credentials",
    ],
  ]) {
    const result = loadConfig(overrides);
    assert.notEqual(result.status, 0);
    assert.ok(result.stderr.includes(message));
  }
});

test("production config uses R2 for media collections and omits the fixture", () => {
  const result = loadConfig(
    {},
    `
    assert.equal(config.collections.some(({ slug }) => slug === 'foundation-fixtures'), false);
    for (const slug of ['machine-media', 'inventory-media', 'machine-documents']) {
      const collection = config.collections.find(({ slug: candidate }) => candidate === slug);
      assert.ok(collection, slug + ' collection is configured');
      assert.equal(collection.upload.adapter, 's3');
      assert.equal(collection.upload.disableLocalStorage, true);
    }
    const users = config.collections.find(({ slug }) => slug === config.admin.user);
    assert.ok(users.auth);
    assert.equal(await users.access.read({ req: { user: null } }), false);
    assert.equal(await users.access.create({ req: { user: null, payload: { count: async () => ({ totalDocs: 1 }) } } }), false);
    assert.equal(await users.access.create({ req: { user: null, payload: { count: async () => ({ totalDocs: 0 }) } } }), true);
    assert.equal(config.upload.limits.fileSize, 5 * 1024 * 1024);
    assert.equal(config.upload.abortOnLimit, true);
    const image = await config.sharp({ create: { width: 800, height: 600, channels: 3, background: '#f89800' } }).png().toBuffer();
    const resized = await config.sharp(image).resize({ width: 640 }).png().toBuffer();
    const metadata = await config.sharp(resized).metadata();
    assert.equal(metadata.width, 640);
    assert.equal(metadata.height, 480);
  `,
  );
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});

test("foundation GCS fixture is enabled only for guarded loopback smoke", () => {
  const databaseURL = "postgresql://smoke:smoke@127.0.0.1:5432/hgr_foundation_smoke";
  const gcsEndpoint = "http://127.0.0.1:4443";
  const result = loadConfig({
    HGR_SMOKE_DISPOSABLE: "yes",
    DATABASE_URL: databaseURL,
    SMOKE_DATABASE_URL: databaseURL,
    GCS_PROJECT_ID: "hgr-foundation-smoke",
    GCS_BUCKET: "hgr-foundation-smoke",
    GCS_ENDPOINT: gcsEndpoint,
    SMOKE_GCS_BUCKET: "hgr-foundation-smoke",
    SMOKE_GCS_ENDPOINT: gcsEndpoint,
  }, `
    const fixture = config.collections.find(({ slug }) => slug === 'foundation-fixtures');
    assert.ok(fixture);
    assert.equal(fixture.upload.adapter, 'gcs');
    assert.equal(fixture.access.read({ req: { user: null } }), true);
    for (const operation of ['create', 'update', 'delete']) {
      assert.equal(fixture.access[operation]({ req: { user: null } }), false);
      assert.equal(fixture.access[operation]({ req: { user: { id: 'fake-user' } } }), true);
    }
    assert.equal(fixture.upload.disableLocalStorage, true);
    assert.equal(fixture.upload.pasteURL, false);
    assert.deepEqual(fixture.upload.mimeTypes, ['image/png', 'image/jpeg', 'image/webp']);
    assert.equal(fixture.upload.imageSizes[0].width, 640);
  `);
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});
