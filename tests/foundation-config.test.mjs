import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const fakeEnvironment = {
  DATABASE_URL: "postgresql://localhost/disposable_foundation_test",
  PAYLOAD_SECRET: "synthetic-test-secret-with-at-least-32-characters",
  SERVER_URL: "http://localhost:3000",
  GCS_PROJECT_ID: "synthetic-foundation-test",
  GCS_BUCKET: "synthetic-foundation-test",
  GCS_ENDPOINT: "",
  GOOGLE_APPLICATION_CREDENTIALS: "",
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
       ${assertions}`,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, ...fakeEnvironment, ...overrides },
      timeout: 30000,
    },
  );
}

test("required settings fail closed without printing their values", () => {
  for (const name of [
    "DATABASE_URL",
    "PAYLOAD_SECRET",
    "SERVER_URL",
    "GCS_PROJECT_ID",
    "GCS_BUCKET",
  ]) {
    const result = loadConfig({ [name]: "" });
    assert.notEqual(result.status, 0, `${name} should be required`);
    assert.match(
      result.stderr,
      new RegExp(`Missing required server environment variable: ${name}`),
    );
    assert.ok(!result.stderr.includes(fakeEnvironment.PAYLOAD_SECRET));
  }
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

test("only synthetic records are publicly readable and writes require authentication", () => {
  const result = loadConfig(
    {},
    `
    const fixture = config.collections.find(({ slug }) => slug === 'foundation-fixtures');
    assert.ok(fixture);
    assert.equal(await fixture.access.read({ req: { user: null } }), true);
    for (const operation of ['create', 'update', 'delete']) {
      assert.equal(await fixture.access[operation]({ req: { user: null } }), false);
      assert.equal(await fixture.access[operation]({ req: { user: { id: 'fake-user' } } }), true);
    }
    const users = config.collections.find(({ slug }) => slug === config.admin.user);
    assert.ok(users.auth);
    assert.equal(await users.access.read({ req: { user: null } }), false);
    assert.equal(await users.access.create({ req: { user: null } }), false);
    assert.equal(fixture.upload.disableLocalStorage, true);
    assert.equal(fixture.upload.pasteURL, false);
    assert.deepEqual(fixture.upload.mimeTypes, ['image/png', 'image/jpeg', 'image/webp']);
    assert.equal(fixture.upload.imageSizes[0].width, 640);
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
