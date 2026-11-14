import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "machines" ADD COLUMN "ever_published" boolean;

    -- Existing draft records are unknown: Payload can replace the latest
    -- published version during unpublish and prunes older versions. Leave
    -- those records NULL so they remain ineligible for permanent deletion.
    UPDATE "machines" machine
    SET "ever_published" = TRUE
    WHERE machine."_status" = 'published'
      OR EXISTS (
        SELECT 1 FROM "_machines_v" version
        WHERE version."parent_id" = machine."id"
          AND version."version__status" = 'published'
      );

    CREATE FUNCTION public.hgr_mark_machine_ever_published()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        NEW."ever_published" := (NEW."_status" = 'published');
      ELSIF OLD."ever_published" IS NULL THEN
        -- Unknown legacy history remains unknown, unless this row is now
        -- visibly published, in which case it becomes permanently protected.
        NEW."ever_published" := CASE WHEN NEW."_status" = 'published' THEN TRUE ELSE NULL END;
      ELSE
        NEW."ever_published" := OLD."ever_published" OR NEW."_status" = 'published';
      END IF;
      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER "machines_ever_published_guard"
    BEFORE INSERT OR UPDATE OF "_status", "ever_published" ON "machines"
    FOR EACH ROW EXECUTE FUNCTION public.hgr_mark_machine_ever_published();
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM "machines"
        WHERE "ever_published" IS DISTINCT FROM FALSE
      ) OR EXISTS (
        SELECT 1 FROM "_machines_v" WHERE "version__status" = 'published'
      ) THEN
        RAISE EXCEPTION 'Machine publication history is protected by this column; do not roll back while protected or unknown machine history exists.';
      END IF;
    END $$;

    DROP TRIGGER "machines_ever_published_guard" ON "machines";
    DROP FUNCTION public.hgr_mark_machine_ever_published();
    ALTER TABLE "machines" DROP COLUMN "ever_published";
  `);
}
