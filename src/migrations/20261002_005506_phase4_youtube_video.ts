import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machines" ADD COLUMN "video_url" varchar;
  ALTER TABLE "_machines_v" ADD COLUMN "version_video_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   LOCK TABLE public.machines, public._machines_v IN ACCESS EXCLUSIVE MODE;
   DO $$ BEGIN
     IF EXISTS (SELECT 1 FROM public.machines WHERE "video_url" IS NOT NULL)
       OR EXISTS (SELECT 1 FROM public._machines_v WHERE "version_video_url" IS NOT NULL) THEN
       RAISE EXCEPTION 'Phase 4 rollback refused: YouTube video URLs exist and require preservation or an explicit data migration';
     END IF;
   END $$;
   ALTER TABLE "machines" DROP COLUMN "video_url";
  ALTER TABLE "_machines_v" DROP COLUMN "version_video_url";`)
}
