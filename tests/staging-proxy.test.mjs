import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createStagingProxy } from "../src/lib/stagingBasicAuth.ts";

const environmentKeys = [
  "RAILWAY_PROJECT_ID",
  "RAILWAY_ENVIRONMENT_NAME",
  "RAILWAY_GIT_BRANCH",
  "HGR_STAGING_BASIC_AUTH_USERNAME",
  "HGR_STAGING_BASIC_AUTH_PASSWORD",
];

async function withEnvironment(values, run) {
  const previous = new Map(environmentKeys.map((key) => [key, process.env[key]]));
  for (const key of environmentKeys) {
    if (Object.hasOwn(values, key)) {
      const value = values[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    } else {
      delete process.env[key];
    }
  }
  try {
    await run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function request(path, credentials) {
  const headers = credentials
    ? { authorization: `Basic ${Buffer.from(credentials).toString("base64")}` }
    : undefined;
  return new Request(`https://hgr-staging.example${path}`, { headers });
}

const stagingEnvironment = {
  RAILWAY_PROJECT_ID: "synthetic-project",
  RAILWAY_ENVIRONMENT_NAME: "staging",
  HGR_STAGING_BASIC_AUTH_USERNAME: "staging-owner",
  HGR_STAGING_BASIC_AUTH_PASSWORD: "synthetic-test-password",
};

function stagingProxy() {
  return createStagingProxy(
    () => new Response(null, { headers: { "x-middleware-next": "1" } }),
    () => process.env,
  );
}

test("authorized staging credentials pass through without enabling shared caching", async () => {
  await withEnvironment(stagingEnvironment, async () => {
    const response = stagingProxy()(request("/admin", "staging-owner:synthetic-test-password"));
    assert.equal(response.headers.get("x-middleware-next"), "1");
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.match(response.headers.get("vary") ?? "", /Authorization/i);
  });
});

test("unauthorized requests are denied on public, admin, API, media and asset routes", async () => {
  await withEnvironment(stagingEnvironment, async () => {
    for (const path of [
      "/",
      "/admin",
      "/api/machine-media/process",
      "/api/machine-media/file/123",
      "/_next/static/chunk.js",
      "/robots.txt",
    ]) {
      const response = stagingProxy()(request(path));
      assert.equal(response.status, 401, `${path} should require staging credentials`);
      assert.match(response.headers.get("www-authenticate") ?? "", /^Basic realm=/);
      assert.equal(response.headers.get("cache-control"), "no-store");
    }

    const invalid = stagingProxy()(request("/api", "staging-owner:wrong-password"));
    assert.equal(invalid.status, 401);

  });
});

test("staging fails closed when either credential is missing", async () => {
  for (const credentials of [
    { HGR_STAGING_BASIC_AUTH_USERNAME: undefined },
    { HGR_STAGING_BASIC_AUTH_PASSWORD: undefined },
  ]) {
    await withEnvironment({ ...stagingEnvironment, ...credentials }, async () => {
      const response = stagingProxy()(request("/"));
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("www-authenticate"), null);
      assert.equal(response.headers.get("cache-control"), "no-store");
    });
  }
});

test("production behavior remains unchanged and misnamed Railway environments fail closed", async () => {
  await withEnvironment({
    RAILWAY_PROJECT_ID: "synthetic-project",
    RAILWAY_ENVIRONMENT_NAME: "production",
    RAILWAY_GIT_BRANCH: "main",
  }, async () => {
    const response = stagingProxy()(request("/admin"));
    assert.equal(response.headers.get("x-middleware-next"), "1");
    assert.equal(response.headers.get("cache-control"), null);
  });

  await withEnvironment({
    RAILWAY_PROJECT_ID: "synthetic-project",
    RAILWAY_ENVIRONMENT_NAME: "preview",
    RAILWAY_GIT_BRANCH: "staging",
  }, async () => {
    const response = stagingProxy()(request("/"));
    assert.equal(response.status, 503);
  });
});

test("Next proxy has no matcher exclusions, so it runs before every route", async () => {
  const source = await readFile(new URL("../src/proxy.ts", import.meta.url), "utf8");
  assert.match(source, /export function proxy\(/);
  assert.doesNotMatch(source, /export\s+const\s+config\s*=/);
});
