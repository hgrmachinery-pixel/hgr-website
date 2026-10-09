import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "machine_media" ADD COLUMN "prefix" varchar DEFAULT 'machine-media';
    ALTER TABLE "inventory_media" ADD COLUMN "prefix" varchar DEFAULT 'inventory-media';
    ALTER TABLE "machine_documents" ADD COLUMN "prefix" varchar DEFAULT 'machine-documents';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "machine_media" DROP COLUMN "prefix";
    ALTER TABLE "inventory_media" DROP COLUMN "prefix";
    ALTER TABLE "machine_documents" DROP COLUMN "prefix";
  `);
}
