import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { gcsStorage, type GcsStorageOptions } from "@payloadcms/storage-gcs";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";

import { FoundationFixture } from "./collections/FoundationFixture";
import { AssetAuditEvents } from "./collections/AssetAuditEvents";
import { Roles } from "./collections/Roles";
import { MachineDocuments } from "./collections/MachineDocuments";
import { Machines } from "./collections/Machines";
import { MachineMedia } from "./collections/MachineMedia";
import { SpareParts } from "./collections/SpareParts";
import { Lubricants } from "./collections/Lubricants";
import { InventoryMedia } from "./collections/InventoryMedia";
import { Pages } from "./collections/Pages";
import { Users } from "./collections/Users";
import { SiteContact } from "./globals/SiteContact";
import { noDeliveryEmailAdapter } from "./lib/email/noDeliveryAdapter";
import { configuredImageLimits } from "./lib/machines/media.ts";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

function r2Environment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
}

function hasLoopbackSmokeDatabase(): boolean {
  const value = process.env.DATABASE_URL;
  if (!value || value !== process.env.SMOKE_DATABASE_URL) return false;
  try {
    const url = new URL(value);
    return ["postgres:", "postgresql:"].includes(url.protocol) &&
      url.hostname === "127.0.0.1" && Boolean(url.port) && Boolean(url.username) && Boolean(url.password) &&
      url.pathname === "/hgr_foundation_smoke" && !url.search && !url.hash;
  } catch {
    return false;
  }
}

function hasLoopbackSmokeStorage(): boolean {
  const endpoint = process.env.GCS_ENDPOINT;
  if (!endpoint || endpoint !== process.env.SMOKE_GCS_ENDPOINT || process.env.GCS_BUCKET !== "hgr-foundation-smoke" ||
    process.env.SMOKE_GCS_BUCKET !== "hgr-foundation-smoke" || process.env.GCS_PROJECT_ID !== "hgr-foundation-smoke") return false;
  try {
    const url = new URL(endpoint);
    return url.protocol === "http:" && url.hostname === "127.0.0.1" && Boolean(url.port) &&
      url.pathname === "/" && !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}

// The foundation fixture exists only inside the guarded, disposable local smoke
// process. The smoke coordinator independently validates loopback targets.
const useFoundationSmokeFixture = process.env.HGR_SMOKE_DISPOSABLE === "yes" &&
  hasLoopbackSmokeDatabase() && hasLoopbackSmokeStorage();
function r2Endpoint(): string {
  const value = r2Environment("R2_ENDPOINT");
  let endpoint: URL;
  try { endpoint = new URL(value); } catch { throw new Error("R2_ENDPOINT must be a valid HTTPS URL"); }
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) throw new Error("R2_ENDPOINT must be a valid HTTPS URL without credentials");
  return endpoint.origin;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

const databaseURL = requiredEnvironment("DATABASE_URL");
if (!/^postgres(?:ql)?:\/\//i.test(databaseURL)) {
  throw new Error("DATABASE_URL must use PostgreSQL");
}

const secret = requiredEnvironment("PAYLOAD_SECRET");
if (secret.length < 32) {
  throw new Error("PAYLOAD_SECRET must contain at least 32 characters");
}

const serverURL = requiredEnvironment("SERVER_URL");
let origin: URL;
try {
  origin = new URL(serverURL);
} catch {
  throw new Error(
    "SERVER_URL must be an HTTP or HTTPS URL without credentials",
  );
}
if (
  !["http:", "https:"].includes(origin.protocol) ||
  origin.username ||
  origin.password
) {
  throw new Error(
    "SERVER_URL must be an HTTP or HTTPS URL without credentials",
  );
}

export default buildConfig({
  editor: lexicalEditor({}),
  serverURL: origin.origin,
  csrf: [origin.origin],
  collections: [...(useFoundationSmokeFixture ? [FoundationFixture] : []), Roles, Users, Machines, MachineMedia, InventoryMedia, SpareParts, Lubricants, MachineDocuments, AssetAuditEvents, Pages],
  globals: [SiteContact],
  email: noDeliveryEmailAdapter,
  admin: { user: "users" },
  secret,
  sharp,
  db: postgresAdapter({
    pool: { connectionString: databaseURL },
    disableCreateDatabase: true,
    // Schema changes are explicit migrations in every environment.
    push: false,
    migrationDir: path.resolve(
      configDirectory,
      process.env.NODE_ENV === "production" ? "migrations-compiled" : "migrations",
    ),
  }),
  plugins: [
    s3Storage({
      collections: {
        "machine-media": { prefix: "machine-media" },
        "inventory-media": { prefix: "inventory-media" },
        "machine-documents": { prefix: "machine-documents" },
      },
      bucket: r2Environment("R2_BUCKET"),
      // R2 does not support x-amz-acl. Keep the bucket private and serve files
      // only through the existing Payload and application authorization paths.
      config: {
        credentials: { accessKeyId: r2Environment("R2_ACCESS_KEY_ID"), secretAccessKey: r2Environment("R2_SECRET_ACCESS_KEY") },
        endpoint: r2Endpoint(),
        region: "auto",
        forcePathStyle: true,
      },
    }),
    ...(useFoundationSmokeFixture ? [gcsStorage({
      // This collection is registered only in the guarded smoke config, so it
      // is intentionally absent from the generated production collection types.
      collections: { "foundation-fixtures": true } as GcsStorageOptions["collections"],
      bucket: requiredEnvironment("GCS_BUCKET"),
      acl: "Private",
      options: {
        projectId: requiredEnvironment("GCS_PROJECT_ID"),
        apiEndpoint: process.env.GCS_ENDPOINT,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
      },
    })] : []),
  ],
  upload: {
    limits: { fileSize: configuredImageLimits().perFileBytes ?? 1 },
    abortOnLimit: true,
  },
  typescript: {
    outputFile: path.resolve(configDirectory, "payload-types.ts"),
  },
});




