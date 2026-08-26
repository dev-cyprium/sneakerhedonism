import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_banners_cta_type" AS ENUM('category', 'page', 'url');
  CREATE TYPE "public"."enum_pages_hero_banners_text_position" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_version_hero_banners_cta_type" AS ENUM('category', 'page', 'url');
  CREATE TYPE "public"."enum__pages_v_version_hero_banners_text_position" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_footer_social_strip_links_platform" AS ENUM('instagram', 'tiktok');
  ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'bannerHero' BEFORE 'highImpact';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'bannerHero' BEFORE 'highImpact';
  CREATE TABLE "pages_hero_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"mobile_image_id" integer,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"cta_label" varchar,
  	"cta_type" "enum_pages_hero_banners_cta_type" DEFAULT 'category',
  	"cta_category_id" integer,
  	"cta_page_id" integer,
  	"cta_url" varchar,
  	"new_tab" boolean,
  	"text_position" "enum_pages_hero_banners_text_position" DEFAULT 'left',
  	"overlay_opacity" numeric DEFAULT 40
  );
  
  CREATE TABLE "_pages_v_version_hero_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"mobile_image_id" integer,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"cta_label" varchar,
  	"cta_type" "enum__pages_v_version_hero_banners_cta_type" DEFAULT 'category',
  	"cta_category_id" integer,
  	"cta_page_id" integer,
  	"cta_url" varchar,
  	"new_tab" boolean,
  	"text_position" "enum__pages_v_version_hero_banners_text_position" DEFAULT 'left',
  	"overlay_opacity" numeric DEFAULT 40,
  	"_uuid" varchar
  );
  
  CREATE TABLE "footer_social_strip_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_footer_social_strip_links_platform" DEFAULT 'instagram' NOT NULL,
  	"url" varchar NOT NULL,
  	"new_tab" boolean DEFAULT true,
  	"aria_label" varchar
  );
  
  ALTER TABLE "footer" ADD COLUMN "social_strip_enabled" boolean DEFAULT true;
  ALTER TABLE "footer" ADD COLUMN "social_strip_heading" varchar DEFAULT 'Pratite nas';
  ALTER TABLE "pages_hero_banners" ADD CONSTRAINT "pages_hero_banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_hero_banners" ADD CONSTRAINT "pages_hero_banners_mobile_image_id_media_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_hero_banners" ADD CONSTRAINT "pages_hero_banners_cta_category_id_categories_id_fk" FOREIGN KEY ("cta_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_hero_banners" ADD CONSTRAINT "pages_hero_banners_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_hero_banners" ADD CONSTRAINT "pages_hero_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_banners" ADD CONSTRAINT "_pages_v_version_hero_banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_banners" ADD CONSTRAINT "_pages_v_version_hero_banners_mobile_image_id_media_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_banners" ADD CONSTRAINT "_pages_v_version_hero_banners_cta_category_id_categories_id_fk" FOREIGN KEY ("cta_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_banners" ADD CONSTRAINT "_pages_v_version_hero_banners_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_banners" ADD CONSTRAINT "_pages_v_version_hero_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_strip_links" ADD CONSTRAINT "footer_social_strip_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_banners_order_idx" ON "pages_hero_banners" USING btree ("_order");
  CREATE INDEX "pages_hero_banners_parent_id_idx" ON "pages_hero_banners" USING btree ("_parent_id");
  CREATE INDEX "pages_hero_banners_image_idx" ON "pages_hero_banners" USING btree ("image_id");
  CREATE INDEX "pages_hero_banners_mobile_image_idx" ON "pages_hero_banners" USING btree ("mobile_image_id");
  CREATE INDEX "pages_hero_banners_cta_category_idx" ON "pages_hero_banners" USING btree ("cta_category_id");
  CREATE INDEX "pages_hero_banners_cta_page_idx" ON "pages_hero_banners" USING btree ("cta_page_id");
  CREATE INDEX "_pages_v_version_hero_banners_order_idx" ON "_pages_v_version_hero_banners" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_banners_parent_id_idx" ON "_pages_v_version_hero_banners" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_hero_banners_image_idx" ON "_pages_v_version_hero_banners" USING btree ("image_id");
  CREATE INDEX "_pages_v_version_hero_banners_mobile_image_idx" ON "_pages_v_version_hero_banners" USING btree ("mobile_image_id");
  CREATE INDEX "_pages_v_version_hero_banners_cta_category_idx" ON "_pages_v_version_hero_banners" USING btree ("cta_category_id");
  CREATE INDEX "_pages_v_version_hero_banners_cta_page_idx" ON "_pages_v_version_hero_banners" USING btree ("cta_page_id");
  CREATE INDEX "footer_social_strip_links_order_idx" ON "footer_social_strip_links" USING btree ("_order");
  CREATE INDEX "footer_social_strip_links_parent_id_idx" ON "footer_social_strip_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_hero_banners" CASCADE;
  DROP TABLE "_pages_v_version_hero_banners" CASCADE;
  DROP TABLE "footer_social_strip_links" CASCADE;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_pages_hero_type";
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'videoHero', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_pages_hero_type";
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_pages_hero_type" USING "hero_type"::"public"."enum_pages_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'videoHero', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__pages_v_version_hero_type" USING "version_hero_type"::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "footer" DROP COLUMN "social_strip_enabled";
  ALTER TABLE "footer" DROP COLUMN "social_strip_heading";
  DROP TYPE "public"."enum_pages_hero_banners_cta_type";
  DROP TYPE "public"."enum_pages_hero_banners_text_position";
  DROP TYPE "public"."enum__pages_v_version_hero_banners_cta_type";
  DROP TYPE "public"."enum__pages_v_version_hero_banners_text_position";
  DROP TYPE "public"."enum_footer_social_strip_links_platform";`)
}
