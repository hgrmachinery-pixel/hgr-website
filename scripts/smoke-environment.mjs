import { randomBytes } from "node:crypto";

/** @returns {never} */
function fail(message) {
  throw new Error(message);
}

function localURL(value, name, protocols) {
  // Check the written host too: URL normalizes 127.1 and numeric IPv4 aliases.
  const writtenHost =
    typeof value === "string"
      ? value.match(/^[a-z]+:\/\/(?:[^/@]*@)?([^/:?#]+):\d+(?:\/|$)/i)?.[1]
      : undefined;
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(`${name} must be a valid loopback URL`);
  }
  // Literal IPv4 loopback prevents localhost DNS/proxy surprises.
  if (
    !protocols.includes(url.protocol) ||
    url.hostname !== "127.0.0.1" ||
    writtenHost !== "127.0.0.1"
  ) {
    fail(`${name} must use 127.0.0.1 and the required protocol`);
  }
  if (url.search || url.hash)
    fail(`${name} must not include query or fragment`);
  return url;
}

export function smokeEnvironment(source = process.env) {
  if (source.HGR_SMOKE_DISPOSABLE !== "yes") {
    fail(
      "Pending: set HGR_SMOKE_DISPOSABLE=yes only for disposable local test services",
    );
  }
  const database = localURL(source.SMOKE_DATABASE_URL, "SMOKE_DATABASE_URL", [
    "postgres:",
    "postgresql:",
  ]);
  if (
    database.pathname !== "/hgr_foundation_smoke" ||
    !database.username ||
    !database.password ||
    !database.port
  ) {
    fail(
      "SMOKE_DATABASE_URL requires credentials, an explicit port and the hgr_foundation_smoke database",
    );
  }
  const storage = localURL(source.SMOKE_GCS_ENDPOINT, "SMOKE_GCS_ENDPOINT", [
    "http:",
  ]);
  if (
    storage.username ||
    storage.password ||
    storage.pathname !== "/" ||
    !storage.port
  ) {
    fail(
      "SMOKE_GCS_ENDPOINT requires an explicit port, no credentials and no path",
    );
  }
  if (source.SMOKE_GCS_BUCKET !== "hgr-foundation-smoke") {
    fail("SMOKE_GCS_BUCKET must be hgr-foundation-smoke");
  }
  if (database.port === storage.port)
    fail("PostgreSQL and GCS services require distinct ports");
  const port = Number(source.SMOKE_APP_PORT);
  if (
    !/^\d+$/.test(source.SMOKE_APP_PORT ?? "") ||
    port < 1024 ||
    port > 65535 ||
    [Number(database.port), Number(storage.port)].includes(port)
  ) {
    fail("SMOKE_APP_PORT must be a distinct port between 1024 and 65535");
  }
  /** @type {NodeJS.ProcessEnv} */
  const child = { NODE_ENV: "production" };
  for (const name of [
    "PATH",
    "Path",
    "SystemRoot",
    "WINDIR",
    "ComSpec",
    "PATHEXT",
    "TEMP",
    "TMP",
    "HOME",
    "USERPROFILE",
  ]) {
    if (source[name]) child[name] = source[name];
  }
  Object.assign(child, {
    DATABASE_URL: database.href,
    PAYLOAD_SECRET: randomBytes(32).toString("hex"),
    SERVER_URL: `http://127.0.0.1:${port}`,
    GCS_PROJECT_ID: "hgr-foundation-smoke",
    GCS_BUCKET: source.SMOKE_GCS_BUCKET,
    GCS_ENDPOINT: storage.origin,
    STORAGE_EMULATOR_HOST: storage.origin,
    GOOGLE_APPLICATION_CREDENTIALS: "",
    GOOGLE_CLOUD_PROJECT: "hgr-foundation-smoke",
    GOOGLE_CLOUD_QUOTA_PROJECT: "",
    // R2 settings are synthetic: this smoke only exercises the local GCS fixture.
    R2_ENDPOINT: "https://local-smoke-account.r2.cloudflarestorage.com",
    R2_BUCKET: "hgr-foundation-smoke-r2-unused",
    R2_ACCESS_KEY_ID: "local-smoke-unused-access-key",
    R2_SECRET_ACCESS_KEY: "local-smoke-unused-secret-key-not-for-cloud",
    CI: "true",
    PAYLOAD_MIGRATING: "true",
    NEXT_TELEMETRY_DISABLED: "1",
    PAYLOAD_CONFIG_PATH: "src/payload.config.ts",
    HGR_SMOKE_DISPOSABLE: "yes",
    SMOKE_DATABASE_URL: database.href,
    SMOKE_GCS_ENDPOINT: storage.origin,
    SMOKE_GCS_BUCKET: source.SMOKE_GCS_BUCKET,
    SMOKE_APP_PORT: String(port),
  });
  return { database, storage, port, child };
}
