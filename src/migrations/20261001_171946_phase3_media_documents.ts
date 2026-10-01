import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Lock legacy rows so role mapping and the empty-media precondition cannot race.
  await db.execute(sql`LOCK TABLE public.users, public.machine_media IN ACCESS EXCLUSIVE MODE`)
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM public.users
        WHERE "role"::text NOT IN ('owner', 'website-administrator')
      ) THEN
        RAISE EXCEPTION 'Phase 3 migration stopped: an unrecognized legacy staff role requires manual review';
      END IF;
      IF EXISTS (SELECT 1 FROM public.machine_media) THEN
        RAISE EXCEPTION 'Phase 3 migration stopped: existing photos need reviewed identity, digest, and human-review backfill';
      END IF;
    END $$;
  `)
  await db.execute(sql`
   CREATE SEQUENCE public.hgr_machine_photo_seq START WITH 1;
   CREATE TYPE "public"."enum_machine_media_asset_kind" AS ENUM('master', 'derivative');
  CREATE TYPE "public"."enum_machine_media_category" AS ENUM('general-exterior', 'side-view-1', 'side-view-2', 'front-view', 'rear-view', 'cabin-interior', 'hour-meter', 'chassis-serial-number', 'engine', 'undercarriage-tracks', 'boom-arm-bucket', 'other-details');
  CREATE TYPE "public"."enum_machine_media_processing_status" AS ENUM('master', 'processing', 'ready', 'failed');
  CREATE TYPE "public"."enum_machine_media_review_status" AS ENUM('needs-review', 'approved');
  CREATE TYPE "public"."enum_machine_documents_document_kind" AS ENUM('original', 'redacted-copy');
  CREATE TYPE "public"."enum_machine_documents_workflow_status" AS ENUM('draft', 'submitted', 'published');
  CREATE TYPE "public"."enum_asset_audit_events_entity_type" AS ENUM('photo', 'document');
  CREATE TYPE "public"."enum_asset_audit_events_event_type" AS ENUM('uploaded', 'redacted', 'modified', 'submitted', 'approved', 'published', 'unpublished');
  CREATE TABLE "roles_permissions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  INSERT INTO "roles" ("name", "key") VALUES
    ('Owner', 'owner'),
    ('Website Administrator', 'website-administrator');
  INSERT INTO "roles_permissions" ("_order", "_parent_id", "id", "name")
    SELECT 1, "id", 'phase3-owner-approve-public-documents-v1', 'Approve Public Documents'
    FROM "roles" WHERE "key" = 'owner';
  
  CREATE TABLE "machine_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"machine_id" integer NOT NULL,
  	"document_kind" "enum_machine_documents_document_kind" NOT NULL,
  	"source_document_id" integer,
  	"latest_redacted_revision_id" integer,
  	"revision_i_d" varchar NOT NULL,
  	"content_digest" varchar NOT NULL,
  	"workflow_status" "enum_machine_documents_workflow_status" DEFAULT 'draft' NOT NULL,
  	"owner_review_revision_i_d" varchar,
  	"owner_review_digest" varchar,
  	"owner_review_reviewer" varchar,
  	"owner_review_reviewed_at" timestamp(3) with time zone,
  	"owner_review_human_attested" boolean,
  	"owner_review_checklist" jsonb,
  	"submitted_by_id" integer,
  	"submitted_at" timestamp(3) with time zone,
  	"uploaded_by_id" integer,
  	"uploaded_at" timestamp(3) with time zone,
  	"redacted_by_id" integer,
  	"redacted_at" timestamp(3) with time zone,
  	"approved_by_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"published_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"last_modified_by_id" integer,
  	"last_modified_at" timestamp(3) with time zone,
  	"audit_history" jsonb DEFAULT '[]'::jsonb,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "asset_audit_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_key" varchar NOT NULL,
  	"entity_type" "enum_asset_audit_events_entity_type" NOT NULL,
  	"entity_i_d" varchar NOT NULL,
  	"revision_i_d" varchar NOT NULL,
  	"digest" varchar NOT NULL,
  	"event_type" "enum_asset_audit_events_event_type" NOT NULL,
  	"actor_i_d" varchar NOT NULL,
  	"occurred_at" timestamp(3) with time zone NOT NULL,
  	"uploaded_by" varchar,
  	"uploaded_at" timestamp(3) with time zone,
  	"redacted_by" varchar,
  	"redacted_at" timestamp(3) with time zone,
  	"approved_by" varchar,
  	"approved_at" timestamp(3) with time zone,
  	"published_by" varchar,
  	"published_at" timestamp(3) with time zone,
  	"last_modified_by" varchar,
  	"last_modified_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "users_role_idx";
  ALTER TABLE "machine_media" ALTER COLUMN "machine_id" SET NOT NULL;
  ALTER TABLE "machine_media" ALTER COLUMN "focal_x" SET DEFAULT 50;
  ALTER TABLE "machine_media" ALTER COLUMN "focal_y" SET DEFAULT 50;
  ALTER TABLE "users" ADD COLUMN "role_id" integer;
  UPDATE "users" AS u SET "role_id" = r."id"
    FROM "roles" AS r
    WHERE r."key" = CASE u."role"::text
      WHEN 'owner' THEN 'owner'
      WHEN 'website-administrator' THEN 'website-administrator'
    END;
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE "role_id" IS NULL) THEN
      RAISE EXCEPTION 'Phase 3 migration stopped: a legacy user could not be mapped to an approved staff role';
    END IF;
  END $$;
  ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;
  ALTER TABLE "machines" ADD COLUMN "serial_visibility_revision" numeric DEFAULT 1;
  ALTER TABLE "machines" ADD COLUMN "current_photo_revisions" jsonb DEFAULT '{}'::jsonb;
  ALTER TABLE "_machines_v" ADD COLUMN "version_serial_visibility_revision" numeric DEFAULT 1;
  ALTER TABLE "_machines_v" ADD COLUMN "version_current_photo_revisions" jsonb DEFAULT '{}'::jsonb;
  ALTER TABLE "machine_media" ADD COLUMN "asset_kind" "enum_machine_media_asset_kind" DEFAULT 'master' NOT NULL;
  ALTER TABLE "machine_media" ADD COLUMN "machine_reference" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "photo_identity" varchar NOT NULL;
  ALTER TABLE "machine_media" ADD COLUMN "photo_sequence" numeric NOT NULL;
  ALTER TABLE "machine_media" ADD COLUMN "category" "enum_machine_media_category" NOT NULL;
  ALTER TABLE "machine_media" ADD COLUMN "revision" numeric NOT NULL;
  ALTER TABLE "machine_media" ADD COLUMN "source_master_id" integer;
  ALTER TABLE "machine_media" ADD COLUMN "processing_status" "enum_machine_media_processing_status" DEFAULT 'master' NOT NULL;
  ALTER TABLE "machine_media" ADD COLUMN "content_digest" varchar NOT NULL;
  ALTER TABLE "machine_media" ADD COLUMN "source_digest" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "redaction_digest" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "review_status" "enum_machine_media_review_status" DEFAULT 'needs-review' NOT NULL;
  ALTER TABLE "machine_media" ADD COLUMN "review_revision" numeric NOT NULL;
  ALTER TABLE "machine_media" ADD COLUMN "review_digest" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "review_serial_policy_revision" numeric DEFAULT 1 NOT NULL;
  ALTER TABLE "machine_media" ADD COLUMN "review_reviewed_by_id" integer;
  ALTER TABLE "machine_media" ADD COLUMN "review_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "machine_media" ADD COLUMN "review_checklist" jsonb;
  ALTER TABLE "machine_media" ADD COLUMN "review_history" jsonb DEFAULT '[]'::jsonb;
  ALTER TABLE "machine_media" ADD COLUMN "audit_history" jsonb DEFAULT '[]'::jsonb;
  ALTER TABLE "machine_media" ADD COLUMN "uploaded_by_id" integer;
  ALTER TABLE "machine_media" ADD COLUMN "uploaded_at" timestamp(3) with time zone;
  ALTER TABLE "machine_media" ADD COLUMN "redacted_by_id" integer;
  ALTER TABLE "machine_media" ADD COLUMN "redacted_at" timestamp(3) with time zone;
  ALTER TABLE "machine_media" ADD COLUMN "approved_by_id" integer;
  ALTER TABLE "machine_media" ADD COLUMN "approved_at" timestamp(3) with time zone;
  ALTER TABLE "machine_media" ADD COLUMN "published_by_id" integer;
  ALTER TABLE "machine_media" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "machine_media" ADD COLUMN "last_modified_by_id" integer;
  ALTER TABLE "machine_media" ADD COLUMN "last_modified_at" timestamp(3) with time zone;
  ALTER TABLE "machine_media" ADD COLUMN "order" numeric DEFAULT 0;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_thumbnail_url" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_thumbnail_width" numeric;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_thumbnail_height" numeric;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_thumbnail_mime_type" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_thumbnail_filesize" numeric;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_thumbnail_filename" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_card_url" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_card_width" numeric;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_card_height" numeric;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_card_mime_type" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_card_filesize" numeric;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_card_filename" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_large_url" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_large_width" numeric;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_large_height" numeric;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_large_mime_type" varchar;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_large_filesize" numeric;
  ALTER TABLE "machine_media" ADD COLUMN "sizes_large_filename" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "roles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "machine_documents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "asset_audit_events_id" integer;
  ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machine_documents" ADD CONSTRAINT "machine_documents_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "machine_documents" ADD CONSTRAINT "machine_documents_source_document_id_machine_documents_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."machine_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_documents" ADD CONSTRAINT "machine_documents_latest_redacted_revision_id_machine_documents_id_fk" FOREIGN KEY ("latest_redacted_revision_id") REFERENCES "public"."machine_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_documents" ADD CONSTRAINT "machine_documents_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_documents" ADD CONSTRAINT "machine_documents_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_documents" ADD CONSTRAINT "machine_documents_redacted_by_id_users_id_fk" FOREIGN KEY ("redacted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_documents" ADD CONSTRAINT "machine_documents_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_documents" ADD CONSTRAINT "machine_documents_published_by_id_users_id_fk" FOREIGN KEY ("published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_documents" ADD CONSTRAINT "machine_documents_last_modified_by_id_users_id_fk" FOREIGN KEY ("last_modified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "roles_permissions_order_idx" ON "roles_permissions" USING btree ("_order");
  CREATE INDEX "roles_permissions_parent_id_idx" ON "roles_permissions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "roles_key_idx" ON "roles" USING btree ("key");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE INDEX "machine_documents_machine_idx" ON "machine_documents" USING btree ("machine_id");
  CREATE INDEX "machine_documents_source_document_idx" ON "machine_documents" USING btree ("source_document_id");
  CREATE INDEX "machine_documents_latest_redacted_revision_idx" ON "machine_documents" USING btree ("latest_redacted_revision_id");
  CREATE UNIQUE INDEX "machine_documents_revision_i_d_idx" ON "machine_documents" USING btree ("revision_i_d");
  CREATE INDEX "machine_documents_content_digest_idx" ON "machine_documents" USING btree ("content_digest");
  CREATE INDEX "machine_documents_submitted_by_idx" ON "machine_documents" USING btree ("submitted_by_id");
  CREATE INDEX "machine_documents_uploaded_by_idx" ON "machine_documents" USING btree ("uploaded_by_id");
  CREATE INDEX "machine_documents_redacted_by_idx" ON "machine_documents" USING btree ("redacted_by_id");
  CREATE INDEX "machine_documents_approved_by_idx" ON "machine_documents" USING btree ("approved_by_id");
  CREATE INDEX "machine_documents_published_by_idx" ON "machine_documents" USING btree ("published_by_id");
  CREATE INDEX "machine_documents_last_modified_by_idx" ON "machine_documents" USING btree ("last_modified_by_id");
  CREATE INDEX "machine_documents_updated_at_idx" ON "machine_documents" USING btree ("updated_at");
  CREATE INDEX "machine_documents_created_at_idx" ON "machine_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "machine_documents_filename_idx" ON "machine_documents" USING btree ("filename");
  CREATE UNIQUE INDEX "asset_audit_events_event_key_idx" ON "asset_audit_events" USING btree ("event_key");
  CREATE INDEX "asset_audit_events_entity_i_d_idx" ON "asset_audit_events" USING btree ("entity_i_d");
  CREATE INDEX "asset_audit_events_revision_i_d_idx" ON "asset_audit_events" USING btree ("revision_i_d");
  CREATE INDEX "asset_audit_events_updated_at_idx" ON "asset_audit_events" USING btree ("updated_at");
  CREATE INDEX "asset_audit_events_created_at_idx" ON "asset_audit_events" USING btree ("created_at");
  ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "machine_media" DROP CONSTRAINT "machine_media_machine_id_machines_id_fk";
  ALTER TABLE "machine_media" ADD CONSTRAINT "machine_media_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "machine_media" ADD CONSTRAINT "machine_media_source_master_id_machine_media_id_fk" FOREIGN KEY ("source_master_id") REFERENCES "public"."machine_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_media" ADD CONSTRAINT "machine_media_review_reviewed_by_id_users_id_fk" FOREIGN KEY ("review_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_media" ADD CONSTRAINT "machine_media_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_media" ADD CONSTRAINT "machine_media_redacted_by_id_users_id_fk" FOREIGN KEY ("redacted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_media" ADD CONSTRAINT "machine_media_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_media" ADD CONSTRAINT "machine_media_published_by_id_users_id_fk" FOREIGN KEY ("published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_media" ADD CONSTRAINT "machine_media_last_modified_by_id_users_id_fk" FOREIGN KEY ("last_modified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_machine_documents_fk" FOREIGN KEY ("machine_documents_id") REFERENCES "public"."machine_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_asset_audit_events_fk" FOREIGN KEY ("asset_audit_events_id") REFERENCES "public"."asset_audit_events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "machine_media_photo_identity_idx" ON "machine_media" USING btree ("photo_identity");
  CREATE INDEX "machine_media_source_master_idx" ON "machine_media" USING btree ("source_master_id");
  CREATE INDEX "machine_media_content_digest_idx" ON "machine_media" USING btree ("content_digest");
  CREATE INDEX "machine_media_review_review_reviewed_by_idx" ON "machine_media" USING btree ("review_reviewed_by_id");
  CREATE INDEX "machine_media_uploaded_by_idx" ON "machine_media" USING btree ("uploaded_by_id");
  CREATE INDEX "machine_media_redacted_by_idx" ON "machine_media" USING btree ("redacted_by_id");
  CREATE INDEX "machine_media_approved_by_idx" ON "machine_media" USING btree ("approved_by_id");
  CREATE INDEX "machine_media_published_by_idx" ON "machine_media" USING btree ("published_by_id");
  CREATE INDEX "machine_media_last_modified_by_idx" ON "machine_media" USING btree ("last_modified_by_id");
  CREATE INDEX "machine_media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "machine_media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "machine_media_sizes_card_sizes_card_filename_idx" ON "machine_media" USING btree ("sizes_card_filename");
  CREATE INDEX "machine_media_sizes_large_sizes_large_filename_idx" ON "machine_media" USING btree ("sizes_large_filename");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX "payload_locked_documents_rels_machine_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("machine_documents_id");
  CREATE INDEX "payload_locked_documents_rels_asset_audit_events_id_idx" ON "payload_locked_documents_rels" USING btree ("asset_audit_events_id");
  CREATE INDEX "users_role_idx" ON "users" USING btree ("role_id");
  ALTER TABLE "users" DROP COLUMN "role";
  DROP TYPE "public"."enum_users_role";

  CREATE OR REPLACE FUNCTION public.reject_asset_audit_event_mutation()
  RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN
    RAISE EXCEPTION 'asset_audit_events is append-only';
  END;
  $$;
  CREATE TRIGGER asset_audit_events_append_only
    BEFORE UPDATE OR DELETE ON public.asset_audit_events
    FOR EACH ROW EXECUTE FUNCTION public.reject_asset_audit_event_mutation();
  CREATE TRIGGER asset_audit_events_no_truncate
    BEFORE TRUNCATE ON public.asset_audit_events
    FOR EACH STATEMENT EXECUTE FUNCTION public.reject_asset_audit_event_mutation();`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Payload invokes down migrations inside one transaction. These locks and all
  // subsequent checks/drops therefore remain atomic through commit/rollback.
  await db.execute(sql`LOCK TABLE public.asset_audit_events, public.machine_documents, public.machine_media, public.machines, public._machines_v, public.roles_permissions, public.roles, public.users, public.payload_locked_documents_rels IN ACCESS EXCLUSIVE MODE`)
  await db.execute(sql`
    DO $$
    DECLARE owner_id integer; admin_id integer;
    BEGIN
      IF EXISTS (SELECT 1 FROM public.asset_audit_events) THEN
        RAISE EXCEPTION 'Phase 3 rollback refused: permanent asset audit history is populated';
      END IF;
      IF EXISTS (SELECT 1 FROM public.machine_documents) THEN
        RAISE EXCEPTION 'Phase 3 rollback refused: private or redacted document revisions exist';
      END IF;
      IF EXISTS (SELECT 1 FROM public.machine_media) THEN
        RAISE EXCEPTION 'Phase 3 rollback refused: photo records or revisions would lose identity/review state';
      END IF;
      IF EXISTS (
        SELECT 1 FROM public.machines
        WHERE COALESCE("serial_visibility_revision", 1) <> 1
          OR COALESCE("current_photo_revisions", '{}'::jsonb) <> '{}'::jsonb
      ) OR EXISTS (
        SELECT 1 FROM public."_machines_v"
        WHERE COALESCE("version_serial_visibility_revision", 1) <> 1
          OR COALESCE("version_current_photo_revisions", '{}'::jsonb) <> '{}'::jsonb
      ) THEN
        RAISE EXCEPTION 'Phase 3 rollback refused: machine photo-review policy state would be lost';
      END IF;
      IF EXISTS (
        SELECT 1 FROM public.machine_media
        WHERE CASE WHEN jsonb_typeof("audit_history") = 'array' THEN jsonb_array_length("audit_history") > 0 ELSE false END
           OR CASE WHEN jsonb_typeof("review_history") = 'array' THEN jsonb_array_length("review_history") > 0 ELSE false END
      ) OR EXISTS (
        SELECT 1 FROM public.machine_documents
        WHERE CASE WHEN jsonb_typeof("audit_history") = 'array' THEN jsonb_array_length("audit_history") > 0 ELSE false END
      ) THEN
        RAISE EXCEPTION 'Phase 3 rollback refused: embedded lifecycle history is populated';
      END IF;
      IF EXISTS (
        SELECT 1 FROM public.payload_locked_documents_rels
        WHERE "roles_id" IS NOT NULL OR "machine_documents_id" IS NOT NULL OR "asset_audit_events_id" IS NOT NULL
      ) THEN
        RAISE EXCEPTION 'Phase 3 rollback refused: Payload lock references would be discarded';
      END IF;

      SELECT id INTO owner_id FROM public.roles WHERE "key" = 'owner' AND "name" = 'Owner';
      SELECT id INTO admin_id FROM public.roles WHERE "key" = 'website-administrator' AND "name" = 'Website Administrator';
      IF (SELECT count(*) FROM public.roles) <> 2 OR owner_id IS NULL OR admin_id IS NULL THEN
        RAISE EXCEPTION 'Phase 3 rollback refused: custom or modified roles cannot be represented by the legacy role field';
      END IF;
      IF (SELECT count(*) FROM public.roles_permissions) <> 1
         OR NOT EXISTS (SELECT 1 FROM public.roles_permissions WHERE "_parent_id" = owner_id AND "name" = 'Approve Public Documents') THEN
        RAISE EXCEPTION 'Phase 3 rollback refused: additional or changed role permissions cannot be represented';
      END IF;
      IF EXISTS (
        SELECT 1 FROM public.users u LEFT JOIN public.roles r ON r.id = u."role_id"
        WHERE r."key" NOT IN ('owner', 'website-administrator') OR r."key" IS NULL
      ) THEN
        RAISE EXCEPTION 'Phase 3 rollback refused: a user has an unmapped role';
      END IF;
      IF EXISTS (SELECT 1 FROM public.users GROUP BY "role_id" HAVING count(*) > 1) THEN
        RAISE EXCEPTION 'Phase 3 rollback refused: multiple users share a role that was unique in the legacy schema';
      END IF;
    END $$;
  `)
  // MachineMedia allocates every new photo identity from this sequence. Remove
  // it only after the locked empty-history and representability preflight.
  await db.execute(sql`DROP SEQUENCE public.hgr_machine_photo_seq`)
  await db.execute(sql`DROP TRIGGER asset_audit_events_append_only ON public.asset_audit_events`)
  await db.execute(sql`DROP TRIGGER asset_audit_events_no_truncate ON public.asset_audit_events`)
  await db.execute(sql`DROP FUNCTION public.reject_asset_audit_event_mutation()`)
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'website-administrator');
  ALTER TABLE "roles_permissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machine_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "asset_audit_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fk";
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role";
  UPDATE "users" AS u SET "role" = CASE r."key"
    WHEN 'owner' THEN 'owner'::"enum_users_role"
    WHEN 'website-administrator' THEN 'website-administrator'::"enum_users_role"
  END FROM "roles" AS r WHERE r."id" = u."role_id";
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE "role" IS NULL) THEN
      RAISE EXCEPTION 'Phase 3 rollback refused: a user role could not be restored';
    END IF;
  END $$;
  ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;
  DROP INDEX "users_role_idx";
  CREATE UNIQUE INDEX "users_role_idx" ON "users" USING btree ("role");
  ALTER TABLE "users" DROP COLUMN "role_id";
  
  ALTER TABLE "machine_media" DROP CONSTRAINT "machine_media_source_master_id_machine_media_id_fk";
  
  ALTER TABLE "machine_media" DROP CONSTRAINT "machine_media_review_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "machine_media" DROP CONSTRAINT "machine_media_uploaded_by_id_users_id_fk";
  
  ALTER TABLE "machine_media" DROP CONSTRAINT "machine_media_redacted_by_id_users_id_fk";
  
  ALTER TABLE "machine_media" DROP CONSTRAINT "machine_media_approved_by_id_users_id_fk";
  
  ALTER TABLE "machine_media" DROP CONSTRAINT "machine_media_published_by_id_users_id_fk";
  
  ALTER TABLE "machine_media" DROP CONSTRAINT "machine_media_last_modified_by_id_users_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_roles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_machine_documents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_asset_audit_events_fk";

  DROP INDEX "machine_media_photo_identity_idx";
  DROP INDEX "machine_media_source_master_idx";
  DROP INDEX "machine_media_content_digest_idx";
  DROP INDEX "machine_media_review_review_reviewed_by_idx";
  DROP INDEX "machine_media_uploaded_by_idx";
  DROP INDEX "machine_media_redacted_by_idx";
  DROP INDEX "machine_media_approved_by_idx";
  DROP INDEX "machine_media_published_by_idx";
  DROP INDEX "machine_media_last_modified_by_idx";
  DROP INDEX "machine_media_sizes_thumbnail_sizes_thumbnail_filename_idx";
  DROP INDEX "machine_media_sizes_card_sizes_card_filename_idx";
  DROP INDEX "machine_media_sizes_large_sizes_large_filename_idx";
  DROP INDEX "payload_locked_documents_rels_roles_id_idx";
  DROP INDEX "payload_locked_documents_rels_machine_documents_id_idx";
  DROP INDEX "payload_locked_documents_rels_asset_audit_events_id_idx";
  DROP TABLE "roles_permissions";
  DROP TABLE "roles";
  DROP TABLE "machine_documents";
  DROP TABLE "asset_audit_events";
  ALTER TABLE "machine_media" ALTER COLUMN "machine_id" DROP NOT NULL;
  ALTER TABLE "machine_media" ALTER COLUMN "focal_x" DROP DEFAULT;
  ALTER TABLE "machine_media" ALTER COLUMN "focal_y" DROP DEFAULT;
  ALTER TABLE "machine_media" DROP CONSTRAINT "machine_media_machine_id_machines_id_fk";
  ALTER TABLE "machine_media" ADD CONSTRAINT "machine_media_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines" DROP COLUMN "serial_visibility_revision";
  ALTER TABLE "machines" DROP COLUMN "current_photo_revisions";
  ALTER TABLE "_machines_v" DROP COLUMN "version_serial_visibility_revision";
  ALTER TABLE "_machines_v" DROP COLUMN "version_current_photo_revisions";
  ALTER TABLE "machine_media" DROP COLUMN "asset_kind";
  ALTER TABLE "machine_media" DROP COLUMN "machine_reference";
  ALTER TABLE "machine_media" DROP COLUMN "photo_identity";
  ALTER TABLE "machine_media" DROP COLUMN "photo_sequence";
  ALTER TABLE "machine_media" DROP COLUMN "category";
  ALTER TABLE "machine_media" DROP COLUMN "revision";
  ALTER TABLE "machine_media" DROP COLUMN "source_master_id";
  ALTER TABLE "machine_media" DROP COLUMN "processing_status";
  ALTER TABLE "machine_media" DROP COLUMN "content_digest";
  ALTER TABLE "machine_media" DROP COLUMN "source_digest";
  ALTER TABLE "machine_media" DROP COLUMN "redaction_digest";
  ALTER TABLE "machine_media" DROP COLUMN "review_status";
  ALTER TABLE "machine_media" DROP COLUMN "review_revision";
  ALTER TABLE "machine_media" DROP COLUMN "review_digest";
  ALTER TABLE "machine_media" DROP COLUMN "review_serial_policy_revision";
  ALTER TABLE "machine_media" DROP COLUMN "review_reviewed_by_id";
  ALTER TABLE "machine_media" DROP COLUMN "review_reviewed_at";
  ALTER TABLE "machine_media" DROP COLUMN "review_checklist";
  ALTER TABLE "machine_media" DROP COLUMN "review_history";
  ALTER TABLE "machine_media" DROP COLUMN "audit_history";
  ALTER TABLE "machine_media" DROP COLUMN "uploaded_by_id";
  ALTER TABLE "machine_media" DROP COLUMN "uploaded_at";
  ALTER TABLE "machine_media" DROP COLUMN "redacted_by_id";
  ALTER TABLE "machine_media" DROP COLUMN "redacted_at";
  ALTER TABLE "machine_media" DROP COLUMN "approved_by_id";
  ALTER TABLE "machine_media" DROP COLUMN "approved_at";
  ALTER TABLE "machine_media" DROP COLUMN "published_by_id";
  ALTER TABLE "machine_media" DROP COLUMN "published_at";
  ALTER TABLE "machine_media" DROP COLUMN "last_modified_by_id";
  ALTER TABLE "machine_media" DROP COLUMN "last_modified_at";
  ALTER TABLE "machine_media" DROP COLUMN "order";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_thumbnail_url";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_thumbnail_width";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_thumbnail_height";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_thumbnail_mime_type";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_thumbnail_filesize";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_thumbnail_filename";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_card_url";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_card_width";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_card_height";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_card_mime_type";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_card_filesize";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_card_filename";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_large_url";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_large_width";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_large_height";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_large_mime_type";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_large_filesize";
  ALTER TABLE "machine_media" DROP COLUMN "sizes_large_filename";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "roles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "machine_documents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "asset_audit_events_id";
  DROP TYPE "public"."enum_machine_media_asset_kind";
  DROP TYPE "public"."enum_machine_media_category";
  DROP TYPE "public"."enum_machine_media_processing_status";
  DROP TYPE "public"."enum_machine_media_review_status";
  DROP TYPE "public"."enum_machine_documents_document_kind";
  DROP TYPE "public"."enum_machine_documents_workflow_status";
  DROP TYPE "public"."enum_asset_audit_events_entity_type";
  DROP TYPE "public"."enum_asset_audit_events_event_type";`)
}
