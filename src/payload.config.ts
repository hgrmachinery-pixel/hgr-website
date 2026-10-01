import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { gcsStorage } from "@payloadcms/storage-gcs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";

import { FoundationFixture } from "./collections/FoundationFixture";
import { Machines } from "./collections/Machines";
import { MachineMedia } from "./collections/MachineMedia";
import { Pages } from "./collections/Pages";
import { Users } from "./collections/Users";
import { SiteContact } from "./globals/SiteContact";
import { noDeliveryEmailAdapter } from "./lib/email/noDeliveryAdapter";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

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
  collections: [FoundationFixture, Users, Machines, MachineMedia, Pages],
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
      collections: { "foundation-fixtures": true, "machine-media": true },
      bucket: requiredEnvironment("GCS_BUCKET"),
      // Objects remain private in GCS. Payload serves the public fake collection.
      acl: "Private",
      options: {
        projectId: requiredEnvironment("GCS_PROJECT_ID"),
        apiEndpoint: process.env.GCS_ENDPOINT || undefined,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
      },
    }),
  ],
  upload: {
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
  },
  typescript: {
    outputFile: path.resolve(configDirectory, "payload-types.ts"),
  },
});
