import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Keep the original public contact columns untouched; all added fields are nullable.
  await db.execute(sql`
    ALTER TABLE "site_contact"
      ADD COLUMN "company_name" varchar,
      ADD COLUMN "registration_number" varchar,
      ADD COLUMN "support_email" varchar,
      ADD COLUMN "office_address" varchar,
      ADD COLUMN "google_maps_u_r_l" varchar,
      ADD COLUMN "google_maps_embed_u_r_l" varchar,
      ADD COLUMN "appointment_only" boolean DEFAULT false,
      ADD COLUMN "facebook" varchar,
      ADD COLUMN "instagram" varchar,
      ADD COLUMN "linkedin" varchar,
      ADD COLUMN "youtube" varchar,
      ADD COLUMN "tiktok" varchar;

    CREATE TABLE "site_contact_weekly_hours" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "day" varchar NOT NULL,
      "opens" varchar NOT NULL,
      "closes" varchar NOT NULL
    );
    ALTER TABLE "site_contact_weekly_hours"
      ADD CONSTRAINT "site_contact_weekly_hours_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."site_contact"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "site_contact_weekly_hours_order_idx" ON "site_contact_weekly_hours" USING btree ("_order");
    CREATE INDEX "site_contact_weekly_hours_parent_id_idx" ON "site_contact_weekly_hours" USING btree ("_parent_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Refuse rollback when new values have been saved, rather than silently deleting them.
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM "site_contact_weekly_hours") OR EXISTS (
        SELECT 1 FROM "site_contact" WHERE
          "company_name" IS NOT NULL OR "registration_number" IS NOT NULL OR "support_email" IS NOT NULL OR
          "office_address" IS NOT NULL OR "google_maps_u_r_l" IS NOT NULL OR "google_maps_embed_u_r_l" IS NOT NULL OR
          "appointment_only" = true OR "facebook" IS NOT NULL OR "instagram" IS NOT NULL OR "linkedin" IS NOT NULL OR
          "youtube" IS NOT NULL OR "tiktok" IS NOT NULL
      ) THEN
        RAISE EXCEPTION 'Site Contact expansion contains saved data; export or clear it before rolling back.';
      END IF;
    END $$;
    DROP TABLE "site_contact_weekly_hours";
    ALTER TABLE "site_contact"
      DROP COLUMN "company_name", DROP COLUMN "registration_number", DROP COLUMN "support_email",
      DROP COLUMN "office_address", DROP COLUMN "google_maps_u_r_l", DROP COLUMN "google_maps_embed_u_r_l",
      DROP COLUMN "appointment_only", DROP COLUMN "facebook", DROP COLUMN "instagram", DROP COLUMN "linkedin",
      DROP COLUMN "youtube", DROP COLUMN "tiktok";
  `);
}
