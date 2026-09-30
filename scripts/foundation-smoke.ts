import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import net from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { smokeEnvironment } from "./smoke-environment.mjs";

const { storage, port, child: environment } = smokeEnvironment();
Object.assign(process.env, environment);
const marker = `foundation-smoke-${randomUUID()}`;
const title = `SYNTHETIC TEST ONLY — ${marker}`;
function setting(name: string): string {
  const value = environment[name];
  assert.ok(value, `Missing isolated setting: ${name}`);
  return value;
}
const bucket = setting("GCS_BUCKET");
const bucketURL = `${storage.origin}/storage/v1/b/${encodeURIComponent(bucket)}`;
const origin = setting("SERVER_URL");
const secret = setting("PAYLOAD_SECRET");
const databaseURL = setting("DATABASE_URL");
let app: ChildProcess | undefined;
let fixtureID: string | number | undefined;
let payload:
  Awaited<ReturnType<typeof import("payload").getPayload>> | undefined;
let failure: unknown;
let stage = "local-service-setup";

async function localFetch(url: string, init?: RequestInit) {
  const target = new URL(url);
  assert.ok(
    [origin, storage.origin].includes(target.origin),
    "Unexpected delivery origin",
  );
  return fetch(target, {
    ...init,
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
}

async function stopApp() {
  if (!app || app.exitCode !== null) return;
  const current = app;
  await new Promise<void>((resolve) => {
    current.once("exit", () => resolve());
    current.kill();
    setTimeout(() => {
      current.kill("SIGKILL");
      resolve();
    }, 5000).unref();
  });
  app = undefined;
}

async function build() {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "build"],
      { env: environment, stdio: "ignore" },
    );
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, 180000);
    child.once("error", () => {
      clearTimeout(timer);
      reject(new Error("Production build could not start"));
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      code === 0 && !timedOut
        ? resolve()
        : reject(
            new Error(
              timedOut
                ? "Production build timed out"
                : "Production build failed",
            ),
          );
    });
  });
}

async function startApp() {
  app = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    { env: environment, stdio: "ignore" },
  );
  let startupError = false;
  app.once("error", () => {
    startupError = true;
  });
  for (let attempt = 0; attempt < 60; attempt++) {
    if (startupError || app.exitCode !== null)
      throw new Error("Production app failed to start");
    try {
      const response = await localFetch(origin);
      if (response.ok) return;
    } catch {
      /* The local app may still be starting. */
    }
    await delay(500);
  }
  throw new Error("Production app did not become ready");
}

async function externalBytes(filename: string) {
  const response = await localFetch(
    `${bucketURL}/o/${encodeURIComponent(filename)}?alt=media`,
  );
  assert.equal(
    response.status,
    200,
    "Object bytes must come from the external service",
  );
  return Buffer.from(await response.arrayBuffer());
}

async function verifyPublic(imageURL: string, expectedBytes: Buffer) {
  const response = await localFetch(origin);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(
    html.includes(title),
    "Public output must match the persisted synthetic record",
  );
  const delivery = new URL(imageURL, origin);
  assert.ok(
    html.includes(delivery.pathname),
    "Public page must render the processed image URL",
  );
  assert.ok(!html.includes(secret), "Public output leaked a secret");
  assert.ok(
    !html.includes(databaseURL),
    "Public output leaked database configuration",
  );
  assert.ok(
    !html.includes(storage.origin),
    "Private object endpoint must stay server-side",
  );
  const imageResponse = await localFetch(delivery.href);
  assert.equal(imageResponse.status, 200);
  assert.deepEqual(
    Buffer.from(await imageResponse.arrayBuffer()),
    expectedBytes,
  );
}

try {
  // Refuse to accidentally verify some other process already occupying the port.
  await new Promise<void>((resolve, reject) => {
    const server = net.createServer();
    server.once("error", () =>
      reject(new Error("SMOKE_APP_PORT is already occupied")),
    );
    server.listen(port, "127.0.0.1", () => server.close(() => resolve()));
  });
  const bucketResponse = await localFetch(bucketURL);
  if (bucketResponse.status === 404) {
    const created = await localFetch(
      `${storage.origin}/storage/v1/b?project=hgr-foundation-smoke`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: bucket }),
      },
    );
    assert.ok(created.ok, "Local emulator must support bucket creation");
  } else assert.ok(bucketResponse.ok, "Local emulator bucket is unavailable");

  stage = "native-runtime-and-schema";
  const { default: sharp } = await import("sharp");
  const { getPayload } = await import("payload");
  const { default: config } = await import("../src/payload.config.js");
  payload = await getPayload({ config });
  // Bounded deterministic generated pixels, no external/business input.
  const pixels = Buffer.alloc(960 * 600 * 3);
  for (let y = 0; y < 600; y++) {
    for (let x = 0; x < 960; x++) {
      const index = (y * 960 + x) * 3;
      pixels[index] = x % 256;
      pixels[index + 1] = y % 256;
      pixels[index + 2] = (x + y) % 256;
    }
  }
  const png = await sharp(pixels, {
    raw: { width: 960, height: 600, channels: 3 },
  })
    .png()
    .toBuffer();
  assert.ok(png.length < 5 * 1024 * 1024);
  stage = "database-and-external-upload";
  const fixture = await payload.create({
    collection: "foundation-fixtures",
    data: { title },
    overrideAccess: true,
    file: {
      data: png,
      name: `${marker}.png`,
      mimetype: "image/png",
      size: png.length,
    },
  });
  fixtureID = fixture.id;
  const persisted = await payload.findByID({
    collection: "foundation-fixtures",
    id: fixtureID,
    depth: 0,
    overrideAccess: false,
  });
  assert.equal(persisted.title, title);
  const card = persisted.sizes?.card;
  assert.ok(persisted.filename && card?.filename && card.url);
  assert.equal(card.width, 640);
  assert.equal(card.height, 400);
  assert.deepEqual(await externalBytes(persisted.filename), png);
  const processed = await externalBytes(card.filename);
  const metadata = await sharp(processed).metadata();
  assert.equal(metadata.width, 640);
  assert.equal(metadata.height, 400);
  assert.ok(processed.length > 0 && processed.length < png.length);
  console.log(
    `HGR_SMOKE_METRICS: original=${png.length} processed=${processed.length} width=640 height=400`,
  );
  stage = "production-build";
  await build();
  stage = "public-delivery-and-admin";
  await startApp();
  await verifyPublic(card.url, processed);
  let adminURL = `${origin}/admin`;
  let admin = await localFetch(adminURL);
  for (
    let count = 0;
    count < 3 && [301, 302, 303, 307, 308].includes(admin.status);
    count++
  ) {
    const location = admin.headers.get("location");
    assert.ok(location, "Admin redirect has no destination");
    const target = new URL(location, adminURL);
    assert.ok(
      target.origin === origin &&
        target.pathname.startsWith("/admin/") &&
        !target.username &&
        !target.password,
      "Unexpected Admin redirect",
    );
    adminURL = target.href;
    admin = await localFetch(adminURL);
  }
  assert.equal(
    admin.status,
    200,
    "Standard Admin authentication surface must respond",
  );
  const anonymousWrite = await localFetch(
    `${origin}/api/foundation-fixtures/${fixtureID}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "UNAUTHORIZED SYNTHETIC CHANGE" }),
    },
  );
  assert.ok(
    [401, 403].includes(anonymousWrite.status),
    "Anonymous writes must be rejected",
  );
  stage = "restart-and-persistence";
  await stopApp();
  assert.deepEqual(await externalBytes(persisted.filename), png);
  assert.deepEqual(await externalBytes(card.filename), processed);
  await startApp();
  await verifyPublic(card.url, processed);
} catch (error) {
  failure = error;
} finally {
  await stopApp();
  // Always attempt both database and orphan-object cleanup, even after upload failure.
  if (payload) {
    try {
      // An upload hook can fail after record creation, before create returns its ID.
      const { docs } = await payload.find({
        collection: "foundation-fixtures",
        where: { title: { equals: title } },
        limit: 2,
        depth: 0,
        overrideAccess: true,
      });
      assert.ok(docs.length <= 1, "Unexpected duplicate cleanup marker");
      for (const record of docs) {
        assert.equal(record.title, title, "Cleanup marker mismatch");
        if (fixtureID !== undefined)
          assert.equal(record.id, fixtureID, "Cleanup ID mismatch");
        await payload.delete({
          collection: "foundation-fixtures",
          id: record.id,
          overrideAccess: true,
        });
      }
    } catch {
      failure ??= new Error("Exact synthetic fixture cleanup failed");
    }
  }
  try {
    const listing = await localFetch(
      `${bucketURL}/o?prefix=${encodeURIComponent(marker)}`,
    );
    if (listing.ok) {
      const body = await listing.json();
      assert.ok(!body.nextPageToken, "Unexpected large smoke-object result");
      for (const object of body.items ?? []) {
        assert.ok(
          typeof object.name === "string" &&
            object.name.startsWith(`${marker}`) &&
            !object.name.includes("/"),
          "Object cleanup marker mismatch",
        );
        const removed = await localFetch(
          `${bucketURL}/o/${encodeURIComponent(object.name)}`,
          { method: "DELETE" },
        );
        assert.ok(removed.ok || removed.status === 404);
      }
      const remaining = await localFetch(
        `${bucketURL}/o?prefix=${encodeURIComponent(marker)}`,
      );
      assert.ok(remaining.ok);
      assert.equal((await remaining.json()).items?.length ?? 0, 0);
    } else if (listing.status !== 404)
      throw new Error("Object cleanup listing failed");
  } catch {
    failure ??= new Error("Exact synthetic object cleanup failed");
  }
  if (payload) {
    try {
      await payload.destroy();
    } catch {
      failure ??= new Error("Payload connection shutdown failed");
    }
  }
}
if (failure) {
  console.error(`HGR_SMOKE_STAGE_FAILED:${stage}`);
  throw failure;
}
