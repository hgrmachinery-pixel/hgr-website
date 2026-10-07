import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE SEQUENCE "hgr_spare_part_id_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE NO CYCLE CACHE 1;
  CREATE SEQUENCE "hgr_lubricant_id_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE NO CYCLE CACHE 1;
   CREATE TYPE "public"."enum_inventory_media_owner_type" AS ENUM('spare-part', 'lubricant');
  CREATE TYPE "public"."enum_inventory_media_category" AS ENUM('featured', 'item', 'label-details', 'other');
  CREATE TYPE "public"."enum_inventory_media_asset_kind" AS ENUM('master', 'derivative');
  CREATE TYPE "public"."enum_inventory_media_review_status" AS ENUM('needs-review', 'approved', 'rejected');
  CREATE TYPE "public"."enum_spare_parts_condition" AS ENUM('new', 'used', 'reconditioned');
  CREATE TYPE "public"."enum_spare_parts_availability" AS ENUM('available', 'reserved', 'sold', 'unavailable');
  CREATE TYPE "public"."enum_spare_parts_price_mode" AS ENUM('contact', 'public');
  CREATE TYPE "public"."enum_spare_parts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__spare_parts_v_version_condition" AS ENUM('new', 'used', 'reconditioned');
  CREATE TYPE "public"."enum__spare_parts_v_version_availability" AS ENUM('available', 'reserved', 'sold', 'unavailable');
  CREATE TYPE "public"."enum__spare_parts_v_version_price_mode" AS ENUM('contact', 'public');
  CREATE TYPE "public"."enum__spare_parts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_lubricants_availability" AS ENUM('available', 'unavailable', 'enquiry-only');
  CREATE TYPE "public"."enum_lubricants_price_mode" AS ENUM('contact', 'public');
  CREATE TYPE "public"."enum_lubricants_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lubricants_v_version_availability" AS ENUM('available', 'unavailable', 'enquiry-only');
  CREATE TYPE "public"."enum__lubricants_v_version_price_mode" AS ENUM('contact', 'public');
  CREATE TYPE "public"."enum__lubricants_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "inventory_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_type" "enum_inventory_media_owner_type" NOT NULL,
	"owner_id" varchar NOT NULL,
	"category" "enum_inventory_media_category" NOT NULL,
	"asset_kind" "enum_inventory_media_asset_kind" DEFAULT 'master' NOT NULL,
	"review_status" "enum_inventory_media_review_status" DEFAULT 'needs-review' NOT NULL,
	"review_history" jsonb DEFAULT '[]'::jsonb,
	"audit_history" jsonb DEFAULT '[]'::jsonb,
	"source_master_id" integer,
	"alt_text" varchar,
	"order" numeric DEFAULT 0,
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
	"focal_x" numeric DEFAULT 50,
	"focal_y" numeric DEFAULT 50,
	"sizes_thumbnail_url" varchar,
	"sizes_thumbnail_width" numeric,
	"sizes_thumbnail_height" numeric,
	"sizes_thumbnail_mime_type" varchar,
	"sizes_thumbnail_filesize" numeric,
	"sizes_thumbnail_filename" varchar,
	"sizes_card_url" varchar,
	"sizes_card_width" numeric,
	"sizes_card_height" numeric,
	"sizes_card_mime_type" varchar,
	"sizes_card_filesize" numeric,
	"sizes_card_filename" varchar,
	"sizes_large_url" varchar,
	"sizes_large_width" numeric,
	"sizes_large_height" numeric,
	"sizes_large_mime_type" varchar,
	"sizes_large_filesize" numeric,
	"sizes_large_filename" varchar
  );

  CREATE TABLE "spare_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_number" varchar,
	"slug" varchar,
	"name" varchar,
	"brand" varchar,
	"reference_prefix" varchar DEFAULT 'PART',
	"category" varchar,
	"manufacturer_part_number" varchar,
	"compatible_machine_brand" varchar,
	"compatible_machine_model" varchar,
	"compatibility_confirmed" boolean DEFAULT false,
	"condition" "enum_spare_parts_condition",
	"short_description" varchar,
	"description" varchar,
	"availability" "enum_spare_parts_availability" DEFAULT 'available',
	"price_mode" "enum_spare_parts_price_mode" DEFAULT 'contact',
	"price" numeric,
	"archived" boolean DEFAULT false,
	"featured_image_id" integer,
	"seo_title" varchar,
	"seo_description" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_spare_parts_status" DEFAULT 'draft'
  );

  CREATE TABLE "spare_parts_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"inventory_media_id" integer
  );

  CREATE TABLE "_spare_parts_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_reference_number" varchar,
	"version_slug" varchar,
	"version_name" varchar,
	"version_brand" varchar,
	"version_reference_prefix" varchar DEFAULT 'PART',
	"version_category" varchar,
	"version_manufacturer_part_number" varchar,
	"version_compatible_machine_brand" varchar,
	"version_compatible_machine_model" varchar,
	"version_compatibility_confirmed" boolean DEFAULT false,
	"version_condition" "enum__spare_parts_v_version_condition",
	"version_short_description" varchar,
	"version_description" varchar,
	"version_availability" "enum__spare_parts_v_version_availability" DEFAULT 'available',
	"version_price_mode" "enum__spare_parts_v_version_price_mode" DEFAULT 'contact',
	"version_price" numeric,
	"version_archived" boolean DEFAULT false,
	"version_featured_image_id" integer,
	"version_seo_title" varchar,
	"version_seo_description" varchar,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__spare_parts_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"latest" boolean
  );

  CREATE TABLE "_spare_parts_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"inventory_media_id" integer
  );

  CREATE TABLE "lubricants" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_number" varchar,
	"slug" varchar,
	"name" varchar,
	"brand" varchar,
	"reference_prefix" varchar DEFAULT 'LUBE',
	"product_code" varchar,
	"product_type" varchar,
	"grade" varchar,
	"pack_size" varchar,
	"compatible_machine_brand" varchar,
	"compatible_machine_model" varchar,
	"compatibility_confirmed" boolean DEFAULT false,
	"short_description" varchar,
	"description" varchar,
	"availability" "enum_lubricants_availability" DEFAULT 'available',
	"price_mode" "enum_lubricants_price_mode" DEFAULT 'contact',
	"price" numeric,
	"archived" boolean DEFAULT false,
	"featured_image_id" integer,
	"seo_title" varchar,
	"seo_description" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_lubricants_status" DEFAULT 'draft'
  );

  CREATE TABLE "lubricants_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"inventory_media_id" integer
  );

  CREATE TABLE "_lubricants_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_reference_number" varchar,
	"version_slug" varchar,
	"version_name" varchar,
	"version_brand" varchar,
	"version_reference_prefix" varchar DEFAULT 'LUBE',
	"version_product_code" varchar,
	"version_product_type" varchar,
	"version_grade" varchar,
	"version_pack_size" varchar,
	"version_compatible_machine_brand" varchar,
	"version_compatible_machine_model" varchar,
	"version_compatibility_confirmed" boolean DEFAULT false,
	"version_short_description" varchar,
	"version_description" varchar,
	"version_availability" "enum__lubricants_v_version_availability" DEFAULT 'available',
	"version_price_mode" "enum__lubricants_v_version_price_mode" DEFAULT 'contact',
	"version_price" numeric,
	"version_archived" boolean DEFAULT false,
	"version_featured_image_id" integer,
	"version_seo_title" varchar,
	"version_seo_description" varchar,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__lubricants_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"latest" boolean
  );

  CREATE TABLE "_lubricants_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"inventory_media_id" integer
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inventory_media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "spare_parts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lubricants_id" integer;
  ALTER TABLE "inventory_media" ADD CONSTRAINT "inventory_media_source_master_id_inventory_media_id_fk" FOREIGN KEY ("source_master_id") REFERENCES "public"."inventory_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "spare_parts" ADD CONSTRAINT "spare_parts_featured_image_id_inventory_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."inventory_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "spare_parts_rels" ADD CONSTRAINT "spare_parts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."spare_parts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spare_parts_rels" ADD CONSTRAINT "spare_parts_rels_inventory_media_fk" FOREIGN KEY ("inventory_media_id") REFERENCES "public"."inventory_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_spare_parts_v" ADD CONSTRAINT "_spare_parts_v_parent_id_spare_parts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."spare_parts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_spare_parts_v" ADD CONSTRAINT "_spare_parts_v_version_featured_image_id_inventory_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."inventory_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_spare_parts_v_rels" ADD CONSTRAINT "_spare_parts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_spare_parts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_spare_parts_v_rels" ADD CONSTRAINT "_spare_parts_v_rels_inventory_media_fk" FOREIGN KEY ("inventory_media_id") REFERENCES "public"."inventory_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lubricants" ADD CONSTRAINT "lubricants_featured_image_id_inventory_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."inventory_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lubricants_rels" ADD CONSTRAINT "lubricants_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lubricants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lubricants_rels" ADD CONSTRAINT "lubricants_rels_inventory_media_fk" FOREIGN KEY ("inventory_media_id") REFERENCES "public"."inventory_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lubricants_v" ADD CONSTRAINT "_lubricants_v_parent_id_lubricants_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lubricants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lubricants_v" ADD CONSTRAINT "_lubricants_v_version_featured_image_id_inventory_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."inventory_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lubricants_v_rels" ADD CONSTRAINT "_lubricants_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_lubricants_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lubricants_v_rels" ADD CONSTRAINT "_lubricants_v_rels_inventory_media_fk" FOREIGN KEY ("inventory_media_id") REFERENCES "public"."inventory_media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "inventory_media_owner_id_idx" ON "inventory_media" USING btree ("owner_id");
  CREATE INDEX "inventory_media_source_master_idx" ON "inventory_media" USING btree ("source_master_id");
  CREATE INDEX "inventory_media_updated_at_idx" ON "inventory_media" USING btree ("updated_at");
  CREATE INDEX "inventory_media_created_at_idx" ON "inventory_media" USING btree ("created_at");
  CREATE UNIQUE INDEX "inventory_media_filename_idx" ON "inventory_media" USING btree ("filename");
  CREATE INDEX "inventory_media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "inventory_media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "inventory_media_sizes_card_sizes_card_filename_idx" ON "inventory_media" USING btree ("sizes_card_filename");
  CREATE INDEX "inventory_media_sizes_large_sizes_large_filename_idx" ON "inventory_media" USING btree ("sizes_large_filename");
  CREATE UNIQUE INDEX "spare_parts_reference_number_idx" ON "spare_parts" USING btree ("reference_number");
  CREATE UNIQUE INDEX "spare_parts_slug_idx" ON "spare_parts" USING btree ("slug");
  CREATE INDEX "spare_parts_name_idx" ON "spare_parts" USING btree ("name");
  CREATE INDEX "spare_parts_brand_idx" ON "spare_parts" USING btree ("brand");
  CREATE INDEX "spare_parts_featured_image_idx" ON "spare_parts" USING btree ("featured_image_id");
  CREATE INDEX "spare_parts_updated_at_idx" ON "spare_parts" USING btree ("updated_at");
  CREATE INDEX "spare_parts_created_at_idx" ON "spare_parts" USING btree ("created_at");
  CREATE INDEX "spare_parts__status_idx" ON "spare_parts" USING btree ("_status");
  CREATE INDEX "spare_parts_rels_order_idx" ON "spare_parts_rels" USING btree ("order");
  CREATE INDEX "spare_parts_rels_parent_idx" ON "spare_parts_rels" USING btree ("parent_id");
  CREATE INDEX "spare_parts_rels_path_idx" ON "spare_parts_rels" USING btree ("path");
  CREATE INDEX "spare_parts_rels_inventory_media_id_idx" ON "spare_parts_rels" USING btree ("inventory_media_id");
  CREATE INDEX "_spare_parts_v_parent_idx" ON "_spare_parts_v" USING btree ("parent_id");
  CREATE INDEX "_spare_parts_v_version_version_reference_number_idx" ON "_spare_parts_v" USING btree ("version_reference_number");
  CREATE INDEX "_spare_parts_v_version_version_slug_idx" ON "_spare_parts_v" USING btree ("version_slug");
  CREATE INDEX "_spare_parts_v_version_version_name_idx" ON "_spare_parts_v" USING btree ("version_name");
  CREATE INDEX "_spare_parts_v_version_version_brand_idx" ON "_spare_parts_v" USING btree ("version_brand");
  CREATE INDEX "_spare_parts_v_version_version_featured_image_idx" ON "_spare_parts_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_spare_parts_v_version_version_updated_at_idx" ON "_spare_parts_v" USING btree ("version_updated_at");
  CREATE INDEX "_spare_parts_v_version_version_created_at_idx" ON "_spare_parts_v" USING btree ("version_created_at");
  CREATE INDEX "_spare_parts_v_version_version__status_idx" ON "_spare_parts_v" USING btree ("version__status");
  CREATE INDEX "_spare_parts_v_created_at_idx" ON "_spare_parts_v" USING btree ("created_at");
  CREATE INDEX "_spare_parts_v_updated_at_idx" ON "_spare_parts_v" USING btree ("updated_at");
  CREATE INDEX "_spare_parts_v_latest_idx" ON "_spare_parts_v" USING btree ("latest");
  CREATE INDEX "_spare_parts_v_rels_order_idx" ON "_spare_parts_v_rels" USING btree ("order");
  CREATE INDEX "_spare_parts_v_rels_parent_idx" ON "_spare_parts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_spare_parts_v_rels_path_idx" ON "_spare_parts_v_rels" USING btree ("path");
  CREATE INDEX "_spare_parts_v_rels_inventory_media_id_idx" ON "_spare_parts_v_rels" USING btree ("inventory_media_id");
  CREATE UNIQUE INDEX "lubricants_reference_number_idx" ON "lubricants" USING btree ("reference_number");
  CREATE UNIQUE INDEX "lubricants_slug_idx" ON "lubricants" USING btree ("slug");
  CREATE INDEX "lubricants_name_idx" ON "lubricants" USING btree ("name");
  CREATE INDEX "lubricants_brand_idx" ON "lubricants" USING btree ("brand");
  CREATE INDEX "lubricants_featured_image_idx" ON "lubricants" USING btree ("featured_image_id");
  CREATE INDEX "lubricants_updated_at_idx" ON "lubricants" USING btree ("updated_at");
  CREATE INDEX "lubricants_created_at_idx" ON "lubricants" USING btree ("created_at");
  CREATE INDEX "lubricants__status_idx" ON "lubricants" USING btree ("_status");
  CREATE INDEX "lubricants_rels_order_idx" ON "lubricants_rels" USING btree ("order");
  CREATE INDEX "lubricants_rels_parent_idx" ON "lubricants_rels" USING btree ("parent_id");
  CREATE INDEX "lubricants_rels_path_idx" ON "lubricants_rels" USING btree ("path");
  CREATE INDEX "lubricants_rels_inventory_media_id_idx" ON "lubricants_rels" USING btree ("inventory_media_id");
  CREATE INDEX "_lubricants_v_parent_idx" ON "_lubricants_v" USING btree ("parent_id");
  CREATE INDEX "_lubricants_v_version_version_reference_number_idx" ON "_lubricants_v" USING btree ("version_reference_number");
  CREATE INDEX "_lubricants_v_version_version_slug_idx" ON "_lubricants_v" USING btree ("version_slug");
  CREATE INDEX "_lubricants_v_version_version_name_idx" ON "_lubricants_v" USING btree ("version_name");
  CREATE INDEX "_lubricants_v_version_version_brand_idx" ON "_lubricants_v" USING btree ("version_brand");
  CREATE INDEX "_lubricants_v_version_version_featured_image_idx" ON "_lubricants_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_lubricants_v_version_version_updated_at_idx" ON "_lubricants_v" USING btree ("version_updated_at");
  CREATE INDEX "_lubricants_v_version_version_created_at_idx" ON "_lubricants_v" USING btree ("version_created_at");
  CREATE INDEX "_lubricants_v_version_version__status_idx" ON "_lubricants_v" USING btree ("version__status");
  CREATE INDEX "_lubricants_v_created_at_idx" ON "_lubricants_v" USING btree ("created_at");
  CREATE INDEX "_lubricants_v_updated_at_idx" ON "_lubricants_v" USING btree ("updated_at");
  CREATE INDEX "_lubricants_v_latest_idx" ON "_lubricants_v" USING btree ("latest");
  CREATE INDEX "_lubricants_v_rels_order_idx" ON "_lubricants_v_rels" USING btree ("order");
  CREATE INDEX "_lubricants_v_rels_parent_idx" ON "_lubricants_v_rels" USING btree ("parent_id");
  CREATE INDEX "_lubricants_v_rels_path_idx" ON "_lubricants_v_rels" USING btree ("path");
  CREATE INDEX "_lubricants_v_rels_inventory_media_id_idx" ON "_lubricants_v_rels" USING btree ("inventory_media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inventory_media_fk" FOREIGN KEY ("inventory_media_id") REFERENCES "public"."inventory_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_spare_parts_fk" FOREIGN KEY ("spare_parts_id") REFERENCES "public"."spare_parts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lubricants_fk" FOREIGN KEY ("lubricants_id") REFERENCES "public"."lubricants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_inventory_media_id_idx" ON "payload_locked_documents_rels" USING btree ("inventory_media_id");
  CREATE INDEX "payload_locked_documents_rels_spare_parts_id_idx" ON "payload_locked_documents_rels" USING btree ("spare_parts_id");
  CREATE INDEX "payload_locked_documents_rels_lubricants_id_idx" ON "payload_locked_documents_rels" USING btree ("lubricants_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inventory_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "spare_parts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "spare_parts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_spare_parts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_spare_parts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lubricants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lubricants_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lubricants_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lubricants_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "inventory_media" CASCADE;
  DROP TABLE "spare_parts" CASCADE;
  DROP TABLE "spare_parts_rels" CASCADE;
  DROP TABLE "_spare_parts_v" CASCADE;
  DROP TABLE "_spare_parts_v_rels" CASCADE;
  DROP TABLE "lubricants" CASCADE;
  DROP TABLE "lubricants_rels" CASCADE;
  DROP TABLE "_lubricants_v" CASCADE;
  DROP TABLE "_lubricants_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inventory_media_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_spare_parts_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lubricants_fk";

  DROP INDEX "payload_locked_documents_rels_inventory_media_id_idx";
  DROP INDEX "payload_locked_documents_rels_spare_parts_id_idx";
  DROP INDEX "payload_locked_documents_rels_lubricants_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inventory_media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "spare_parts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lubricants_id";
  DROP SEQUENCE "hgr_lubricant_id_seq";
  DROP SEQUENCE "hgr_spare_part_id_seq";
  DROP TYPE "public"."enum_inventory_media_owner_type";
  DROP TYPE "public"."enum_inventory_media_category";
  DROP TYPE "public"."enum_inventory_media_asset_kind";
  DROP TYPE "public"."enum_inventory_media_review_status";
  DROP TYPE "public"."enum_spare_parts_condition";
  DROP TYPE "public"."enum_spare_parts_availability";
  DROP TYPE "public"."enum_spare_parts_price_mode";
  DROP TYPE "public"."enum_spare_parts_status";
  DROP TYPE "public"."enum__spare_parts_v_version_condition";
  DROP TYPE "public"."enum__spare_parts_v_version_availability";
  DROP TYPE "public"."enum__spare_parts_v_version_price_mode";
  DROP TYPE "public"."enum__spare_parts_v_version_status";
  DROP TYPE "public"."enum_lubricants_availability";
  DROP TYPE "public"."enum_lubricants_price_mode";
  DROP TYPE "public"."enum_lubricants_status";
  DROP TYPE "public"."enum__lubricants_v_version_availability";
  DROP TYPE "public"."enum__lubricants_v_version_price_mode";
  DROP TYPE "public"."enum__lubricants_v_version_status";`)
}
