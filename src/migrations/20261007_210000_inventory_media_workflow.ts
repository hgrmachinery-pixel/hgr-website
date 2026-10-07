import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_inventory_media_processing_status" AS ENUM('master', 'ready', 'failed');
    CREATE TYPE "public"."enum_inventory_media_storage_provider" AS ENUM('gcs', 'r2');
    ALTER TABLE "inventory_media"
      ADD COLUMN "revision" numeric DEFAULT 1 NOT NULL,
      ADD COLUMN "content_digest" varchar,
      ADD COLUMN "source_digest" varchar,
      ADD COLUMN "processing_status" "enum_inventory_media_processing_status",
      ADD COLUMN "storage_provider" "enum_inventory_media_storage_provider",
      ADD COLUMN "uploaded_by" varchar,
      ADD COLUMN "uploaded_at" timestamp(3) with time zone,
      ADD COLUMN "processed_by" varchar,
      ADD COLUMN "processed_at" timestamp(3) with time zone,
      ADD COLUMN "approved_by" varchar,
      ADD COLUMN "approved_at" timestamp(3) with time zone;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "inventory_media"
      DROP COLUMN "revision",
      DROP COLUMN "content_digest",
      DROP COLUMN "source_digest",
      DROP COLUMN "processing_status",
      DROP COLUMN "storage_provider",
      DROP COLUMN "uploaded_by",
      DROP COLUMN "uploaded_at",
      DROP COLUMN "processed_by",
      DROP COLUMN "processed_at",
      DROP COLUMN "approved_by",
      DROP COLUMN "approved_at";
    DROP TYPE "public"."enum_inventory_media_processing_status";
    DROP TYPE "public"."enum_inventory_media_storage_provider";
  `);
}
