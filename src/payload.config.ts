import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { gcsStorage } from "@payloadcms/storage-gcs";
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

const useR2ForInventoryMedia = process.env.INVENTORY_MEDIA_STORAGE === "r2";
function r2Environment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
}
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
  collections: [FoundationFixture, Roles, Users, Machines, MachineMedia, InventoryMedia, SpareParts, Lubricants, MachineDocuments, AssetAuditEvents, Pages],
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
    migrationDir: path.resolve(configDirectory, "migrations"),
  }),
  plugins: [
    gcsStorage({
      collections: { "foundation-fixtures": true, "machine-media": true, ...(!useR2ForInventoryMedia ? { "inventory-media": true } : {}), "machine-documents": true },
      bucket: requiredEnvironment("GCS_BUCKET"),
      // Objects remain private in GCS; every public derivative requires an app authorization check.
      acl: "Private",
      options: {
        projectId: requiredEnvironment("GCS_PROJECT_ID"),
        apiEndpoint: process.env.GCS_ENDPOINT || undefined,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
      },
    }),
    ...(useR2ForInventoryMedia ? [s3Storage({
      collections: { "inventory-media": true },
      bucket: r2Environment("R2_INVENTORY_BUCKET"),
      acl: "private",
      config: {
        credentials: { accessKeyId: r2Environment("R2_ACCESS_KEY_ID"), secretAccessKey: r2Environment("R2_SECRET_ACCESS_KEY") },
        endpoint: r2Endpoint(),
        region: "auto",
        forcePathStyle: true,
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




