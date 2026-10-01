import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM "users") THEN
      RAISE EXCEPTION 'Phase 2 staff roles require confirming existing users before migration';
    END IF;
  END $$;
  CREATE SEQUENCE "hgr_machine_id_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE NO CYCLE CACHE 1;
   CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'website-administrator');
  CREATE TYPE "public"."enum_machines_category" AS ENUM('excavator');
  CREATE TYPE "public"."enum_machines_condition" AS ENUM('excellent', 'very-good', 'good', 'fair');
  CREATE TYPE "public"."enum_machines_stock_status" AS ENUM('available', 'reserved', 'sold');
  CREATE TYPE "public"."enum_machines_price_mode" AS ENUM('unset', 'contact', 'public');
  CREATE TYPE "public"."enum_machines_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__machines_v_version_category" AS ENUM('excavator');
  CREATE TYPE "public"."enum__machines_v_version_condition" AS ENUM('excellent', 'very-good', 'good', 'fair');
  CREATE TYPE "public"."enum__machines_v_version_stock_status" AS ENUM('available', 'reserved', 'sold');
  CREATE TYPE "public"."enum__machines_v_version_price_mode" AS ENUM('unset', 'contact', 'public');
  CREATE TYPE "public"."enum__machines_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "machines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hgr_id" varchar,
  	"slug" varchar,
  	"previous_slugs" jsonb,
  	"category" "enum_machines_category",
  	"brand" varchar,
  	"model" varchar,
  	"year" numeric,
  	"hours" numeric,
  	"engine" varchar,
  	"operating_weight" varchar,
  	"condition" "enum_machines_condition",
  	"country_of_origin" varchar,
  	"machine_origin_status" varchar,
  	"registration_date" timestamp(3) with time zone,
  	"description" varchar,
  	"stock_status" "enum_machines_stock_status",
  	"price_mode" "enum_machines_price_mode" DEFAULT 'unset',
  	"price" numeric,
  	"serial_number" varchar,
  	"show_serial_publicly" boolean DEFAULT false,
  	"featured_image_id" integer,
  	"archived" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_machines_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "machines_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"machine_media_id" integer
  );
  
  CREATE TABLE "_machines_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_hgr_id" varchar,
  	"version_slug" varchar,
  	"version_previous_slugs" jsonb,
  	"version_category" "enum__machines_v_version_category",
  	"version_brand" varchar,
  	"version_model" varchar,
  	"version_year" numeric,
  	"version_hours" numeric,
  	"version_engine" varchar,
  	"version_operating_weight" varchar,
  	"version_condition" "enum__machines_v_version_condition",
  	"version_country_of_origin" varchar,
  	"version_machine_origin_status" varchar,
  	"version_registration_date" timestamp(3) with time zone,
  	"version_description" varchar,
  	"version_stock_status" "enum__machines_v_version_stock_status",
  	"version_price_mode" "enum__machines_v_version_price_mode" DEFAULT 'unset',
  	"version_price" numeric,
  	"version_serial_number" varchar,
  	"version_show_serial_publicly" boolean DEFAULT false,
  	"version_featured_image_id" integer,
  	"version_archived" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__machines_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_machines_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"machine_media_id" integer
  );
  
  CREATE TABLE "machine_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"machine_id" integer,
  	"alt_text" varchar,
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
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_body" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "site_contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar,
  	"whats_app" varchar,
  	"email" varchar,
  	"yard_location" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "machines_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "machine_media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "machines" ADD CONSTRAINT "machines_featured_image_id_machine_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."machine_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines_rels" ADD CONSTRAINT "machines_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_rels" ADD CONSTRAINT "machines_rels_machine_media_fk" FOREIGN KEY ("machine_media_id") REFERENCES "public"."machine_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v" ADD CONSTRAINT "_machines_v_parent_id_machines_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."machines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v" ADD CONSTRAINT "_machines_v_version_featured_image_id_machine_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."machine_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v_rels" ADD CONSTRAINT "_machines_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_rels" ADD CONSTRAINT "_machines_v_rels_machine_media_fk" FOREIGN KEY ("machine_media_id") REFERENCES "public"."machine_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machine_media" ADD CONSTRAINT "machine_media_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "machines_hgr_id_idx" ON "machines" USING btree ("hgr_id");
  CREATE UNIQUE INDEX "machines_slug_idx" ON "machines" USING btree ("slug");
  CREATE INDEX "machines_brand_idx" ON "machines" USING btree ("brand");
  CREATE INDEX "machines_model_idx" ON "machines" USING btree ("model");
  CREATE INDEX "machines_featured_image_idx" ON "machines" USING btree ("featured_image_id");
  CREATE INDEX "machines_updated_at_idx" ON "machines" USING btree ("updated_at");
  CREATE INDEX "machines_created_at_idx" ON "machines" USING btree ("created_at");
  CREATE INDEX "machines__status_idx" ON "machines" USING btree ("_status");
  CREATE INDEX "machines_rels_order_idx" ON "machines_rels" USING btree ("order");
  CREATE INDEX "machines_rels_parent_idx" ON "machines_rels" USING btree ("parent_id");
  CREATE INDEX "machines_rels_path_idx" ON "machines_rels" USING btree ("path");
  CREATE INDEX "machines_rels_machine_media_id_idx" ON "machines_rels" USING btree ("machine_media_id");
  CREATE INDEX "_machines_v_parent_idx" ON "_machines_v" USING btree ("parent_id");
  CREATE INDEX "_machines_v_version_version_hgr_id_idx" ON "_machines_v" USING btree ("version_hgr_id");
  CREATE INDEX "_machines_v_version_version_slug_idx" ON "_machines_v" USING btree ("version_slug");
  CREATE INDEX "_machines_v_version_version_brand_idx" ON "_machines_v" USING btree ("version_brand");
  CREATE INDEX "_machines_v_version_version_model_idx" ON "_machines_v" USING btree ("version_model");
  CREATE INDEX "_machines_v_version_version_featured_image_idx" ON "_machines_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_machines_v_version_version_updated_at_idx" ON "_machines_v" USING btree ("version_updated_at");
  CREATE INDEX "_machines_v_version_version_created_at_idx" ON "_machines_v" USING btree ("version_created_at");
  CREATE INDEX "_machines_v_version_version__status_idx" ON "_machines_v" USING btree ("version__status");
  CREATE INDEX "_machines_v_created_at_idx" ON "_machines_v" USING btree ("created_at");
  CREATE INDEX "_machines_v_updated_at_idx" ON "_machines_v" USING btree ("updated_at");
  CREATE INDEX "_machines_v_latest_idx" ON "_machines_v" USING btree ("latest");
  CREATE INDEX "_machines_v_rels_order_idx" ON "_machines_v_rels" USING btree ("order");
  CREATE INDEX "_machines_v_rels_parent_idx" ON "_machines_v_rels" USING btree ("parent_id");
  CREATE INDEX "_machines_v_rels_path_idx" ON "_machines_v_rels" USING btree ("path");
  CREATE INDEX "_machines_v_rels_machine_media_id_idx" ON "_machines_v_rels" USING btree ("machine_media_id");
  CREATE INDEX "machine_media_machine_idx" ON "machine_media" USING btree ("machine_id");
  CREATE INDEX "machine_media_updated_at_idx" ON "machine_media" USING btree ("updated_at");
  CREATE INDEX "machine_media_created_at_idx" ON "machine_media" USING btree ("created_at");
  CREATE UNIQUE INDEX "machine_media_filename_idx" ON "machine_media" USING btree ("filename");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_machines_fk" FOREIGN KEY ("machines_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_machine_media_fk" FOREIGN KEY ("machine_media_id") REFERENCES "public"."machine_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "users_role_idx" ON "users" USING btree ("role");
  CREATE INDEX "payload_locked_documents_rels_machines_id_idx" ON "payload_locked_documents_rels" USING btree ("machines_id");
  CREATE INDEX "payload_locked_documents_rels_machine_media_id_idx" ON "payload_locked_documents_rels" USING btree ("machine_media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_machines_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_machine_media_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  DROP INDEX "users_role_idx";
  DROP INDEX "payload_locked_documents_rels_machines_id_idx";
  DROP INDEX "payload_locked_documents_rels_machine_media_id_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP SEQUENCE "hgr_machine_id_seq";
   ALTER TABLE "machines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machine_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_contact" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "machines" CASCADE;
  DROP TABLE "machines_rels" CASCADE;
  DROP TABLE "_machines_v" CASCADE;
  DROP TABLE "_machines_v_rels" CASCADE;
  DROP TABLE "machine_media" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "site_contact" CASCADE;
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "machines_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "machine_media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_machines_category";
  DROP TYPE "public"."enum_machines_condition";
  DROP TYPE "public"."enum_machines_stock_status";
  DROP TYPE "public"."enum_machines_price_mode";
  DROP TYPE "public"."enum_machines_status";
  DROP TYPE "public"."enum__machines_v_version_category";
  DROP TYPE "public"."enum__machines_v_version_condition";
  DROP TYPE "public"."enum__machines_v_version_stock_status";
  DROP TYPE "public"."enum__machines_v_version_price_mode";
  DROP TYPE "public"."enum__machines_v_version_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";`)
}
