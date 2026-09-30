import assert from "node:assert/strict";
import test from "node:test";
import { smokeEnvironment } from "../scripts/smoke-environment.mjs";

const valid = () => ({
  HGR_SMOKE_DISPOSABLE: "yes",
  SMOKE_DATABASE_URL:
    "postgresql://smoke_user:smoke_password@127.0.0.1:5432/hgr_foundation_smoke",
  SMOKE_GCS_ENDPOINT: "http://127.0.0.1:4443/",
  SMOKE_GCS_BUCKET: "hgr-foundation-smoke",
  SMOKE_APP_PORT: "3107",
});

function rejectsSafely(source, secret = "smoke-private-secret-94f2") {
  assert.throws(
    () => smokeEnvironment(source),
    (error) => {
      assert.ok(error instanceof Error);
      assert.ok(
        !error.message.includes(secret),
        "error must not expose supplied secrets",
      );
      assert.ok(
        !error.message.includes(source.SMOKE_DATABASE_URL ?? "\0"),
        "error must not expose database URL",
      );
      assert.ok(
        !error.message.includes(source.SMOKE_GCS_ENDPOINT ?? "\0"),
        "error must not expose storage URL",
      );
      return true;
    },
  );
}

test("accepts explicitly disposable local services and creates an isolated child environment", () => {
  const env = {
    ...valid(),
    PATH: "safe-path",
    SystemRoot: "safe-root",
    DATABASE_URL: "postgres://production:password@db.example.com/prod",
    PAYLOAD_SECRET: "inherited-payload-secret",
    GOOGLE_APPLICATION_CREDENTIALS: "inherited-service-account.json",
    GOOGLE_CLOUD_PROJECT: "production-project",
    GOOGLE_CLOUD_QUOTA_PROJECT: "production-quota",
    STORAGE_EMULATOR_HOST: "production-storage.example.com",
    HTTP_PROXY: "http://proxy.example.com",
    HTTPS_PROXY: "http://proxy.example.com",
    NEXT_PUBLIC_SERVER_URL: "https://production.example.com",
    CI: "false",
    PAYLOAD_MIGRATING: "false",
  };

  const result = smokeEnvironment(env);
  assert.equal(result.database.hostname, "127.0.0.1");
  assert.equal(result.database.pathname, "/hgr_foundation_smoke");
  assert.equal(result.storage.origin, "http://127.0.0.1:4443");
  assert.equal(result.port, 3107);
  assert.equal(result.child.DATABASE_URL, env.SMOKE_DATABASE_URL);
  assert.equal(result.child.GCS_ENDPOINT, "http://127.0.0.1:4443");
  assert.equal(result.child.GCS_BUCKET, "hgr-foundation-smoke");
  assert.equal(result.child.SERVER_URL, "http://127.0.0.1:3107");
  assert.equal(result.child.CI, "true");
  assert.equal(result.child.PAYLOAD_MIGRATING, "true");
  assert.equal(result.child.PATH, "safe-path");
  assert.equal(result.child.SystemRoot, "safe-root");
  assert.notEqual(result.child.PAYLOAD_SECRET, env.PAYLOAD_SECRET);
  assert.equal(result.child.GOOGLE_APPLICATION_CREDENTIALS, "");
  assert.equal(result.child.GOOGLE_CLOUD_PROJECT, "hgr-foundation-smoke");
  assert.equal(result.child.GOOGLE_CLOUD_QUOTA_PROJECT, "");
  for (const name of ["HTTP_PROXY", "HTTPS_PROXY", "NEXT_PUBLIC_SERVER_URL"]) {
    assert.equal(
      result.child[name],
      undefined,
      `${name} must not be inherited`,
    );
  }
});

test("generates a fresh child Payload secret for every environment", () => {
  const first = smokeEnvironment(valid()).child.PAYLOAD_SECRET;
  const second = smokeEnvironment(valid()).child.PAYLOAD_SECRET;
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.match(second, /^[a-f0-9]{64}$/);
  assert.notEqual(first, second);
});

test("rejects missing disposable acknowledgement and inherited production database only", () => {
  const missingAck = valid();
  delete missingAck.HGR_SMOKE_DISPOSABLE;
  rejectsSafely(missingAck);

  const inheritedOnly = {
    DATABASE_URL: "postgres://127.0.0.1/hgr_foundation_smoke",
  };
  rejectsSafely(inheritedOnly);
});

test("rejects non-loopback, non-PostgreSQL, and wrong database URLs", () => {
  for (const databaseUrl of [
    "postgresql://u:smoke-private-secret-94f2@localhost:5432/hgr_foundation_smoke",
    "postgresql://u:smoke-private-secret-94f2@192.168.1.4:5432/hgr_foundation_smoke",
    "postgresql://u:smoke-private-secret-94f2@db.example.com:5432/hgr_foundation_smoke",
    "mysql://u:smoke-private-secret-94f2@127.0.0.1:5432/hgr_foundation_smoke",
    "postgresql://u:smoke-private-secret-94f2@127.0.0.1:5432/production",
    "postgresql://127.0.0.1:5432/hgr_foundation_smoke",
    "postgresql://u@127.0.0.1:5432/hgr_foundation_smoke",
    "postgresql://u:@127.0.0.1:5432/hgr_foundation_smoke",
    "postgresql://u:p@127.0.0.1/hgr_foundation_smoke",
    "postgresql://u:smoke-private-secret-94f2@127.0.0.1:5432/hgr_foundation_smoke?sslmode=require",
    "postgresql://u:smoke-private-secret-94f2@127.0.0.1:5432/hgr_foundation_smoke#fragment",
  ]) {
    const env = valid();
    env.SMOKE_DATABASE_URL = databaseUrl;
    rejectsSafely(env);
  }

  // WHATWG URL parsing normalizes these IPv4 spellings to 127.0.0.1.
  // The smoke boundary requires the literal host spelling as well.
  for (const host of ["2130706433", "0x7f000001", "127.1"]) {
    const env = valid();
    env.SMOKE_DATABASE_URL = `postgresql://u:smoke-private-secret-94f2@${host}:5432/hgr_foundation_smoke`;
    rejectsSafely(env);
  }
});

test("rejects invalid storage endpoint protocol, host, credentials, path, and bucket", () => {
  for (const endpoint of [
    "https://127.0.0.1:4443/",
    "http://localhost:4443/",
    "http://storage.example.com:4443/",
    "http://user:password@127.0.0.1:4443/",
    "http://127.0.0.1/",
    "http://127.0.0.1:4443/storage",
    "http://127.0.0.1:4443/?token=secret",
    "http://127.0.0.1:4443/#fragment",
  ]) {
    const env = valid();
    env.SMOKE_GCS_ENDPOINT = endpoint;
    rejectsSafely(env, "secret");
  }

  for (const host of ["2130706433", "0x7f000001", "127.1"]) {
    const env = valid();
    env.SMOKE_GCS_ENDPOINT = `http://${host}:4443/`;
    rejectsSafely(env, "secret");
  }

  const wrongBucket = valid();
  wrongBucket.SMOKE_GCS_BUCKET = "production-bucket";
  rejectsSafely(wrongBucket);
});

test("rejects database and storage services that share a port", () => {
  const databaseCollision = valid();
  databaseCollision.SMOKE_DATABASE_URL =
    "postgresql://u:smoke-private-secret-94f2@127.0.0.1:4443/hgr_foundation_smoke";
  rejectsSafely(databaseCollision);

  const storageCollision = valid();
  storageCollision.SMOKE_GCS_ENDPOINT = "http://127.0.0.1:5432/";
  rejectsSafely(storageCollision);
});

test("drops runtime options, cloud credentials, and proxy variables from the child environment", () => {
  const env = {
    ...valid(),
    NODE_OPTIONS: "--require=node-hook-secret",
    NODE_EXTRA_CA_CERTS: "private-ca.pem",
    AWS_ACCESS_KEY_ID: "fake-access-key",
    AWS_SECRET_ACCESS_KEY: "fake-secret-key",
    GCLOUD_PROJECT: "unexpected-project",
    GOOGLE_CLOUD_KEYFILE_JSON: "fake-keyfile-json",
    HTTP_PROXY: "http://proxy-user:proxy-secret@example.com:8080",
    HTTPS_PROXY: "http://proxy-user:proxy-secret@example.com:8080",
    ALL_PROXY: "socks5://proxy-user:proxy-secret@example.com:1080",
  };

  const child = smokeEnvironment(env).child;
  for (const name of [
    "NODE_OPTIONS",
    "NODE_EXTRA_CA_CERTS",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "GCLOUD_PROJECT",
    "GOOGLE_CLOUD_KEYFILE_JSON",
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "ALL_PROXY",
  ]) {
    assert.equal(child[name], undefined, `${name} must not be inherited`);
  }
  assert.ok(
    !JSON.stringify(child).includes("proxy-secret"),
    "child environment must not contain supplied credentials",
  );
  assert.ok(
    !JSON.stringify(child).includes("fake-secret-key"),
    "child environment must not contain supplied credentials",
  );
});

test("rejects an invalid, reserved, or service-overlapping application port", () => {
  for (const port of [
    "",
    "abc",
    "80",
    "1023",
    "65536",
    "5432",
    "4443",
    "5432.5",
    " 3107",
  ]) {
    const env = valid();
    env.SMOKE_APP_PORT = port;
    rejectsSafely(env);
  }
});
