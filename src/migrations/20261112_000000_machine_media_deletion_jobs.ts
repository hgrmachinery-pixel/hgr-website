import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "machine_media_deletion_jobs" (
      "id" bigserial PRIMARY KEY NOT NULL,
      "bucket" varchar NOT NULL,
      "object_key" varchar NOT NULL,
      "status" varchar DEFAULT 'pending' NOT NULL,
      "attempts" integer DEFAULT 0 NOT NULL,
      "next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
      "lease_token" uuid,
      "lease_until" timestamp with time zone,
      "last_error_code" varchar,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "completed_at" timestamp with time zone,
      CONSTRAINT "machine_media_deletion_jobs_status_check" CHECK ("status" IN ('pending', 'processing', 'completed')),
      CONSTRAINT "machine_media_deletion_jobs_bucket_key_unique" UNIQUE ("bucket", "object_key")
    );
    CREATE INDEX "machine_media_deletion_jobs_ready_idx"
      ON "machine_media_deletion_jobs" USING btree ("status", "next_attempt_at", "created_at");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM "machine_media_deletion_jobs" WHERE "status" <> 'completed') THEN
        RAISE EXCEPTION 'Pending machine photo object cleanup exists; finish or export it before rollback.';
      END IF;
    END $$;
    DROP TABLE "machine_media_deletion_jobs";
  `);
}
