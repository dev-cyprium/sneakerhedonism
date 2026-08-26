import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_banners_text_color" AS ENUM('white', 'cream', 'brandLight', 'brand', 'black');
  CREATE TYPE "public"."enum__pages_v_version_hero_banners_text_color" AS ENUM('white', 'cream', 'brandLight', 'brand', 'black');
  ALTER TABLE "pages_hero_banners" ADD COLUMN "text_color" "enum_pages_hero_banners_text_color" DEFAULT 'white';
  ALTER TABLE "pages_hero_banners" ADD COLUMN "text_scrim" boolean DEFAULT true;
  ALTER TABLE "_pages_v_version_hero_banners" ADD COLUMN "text_color" "enum__pages_v_version_hero_banners_text_color" DEFAULT 'white';
  ALTER TABLE "_pages_v_version_hero_banners" ADD COLUMN "text_scrim" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_hero_banners" DROP COLUMN "text_color";
  ALTER TABLE "pages_hero_banners" DROP COLUMN "text_scrim";
  ALTER TABLE "_pages_v_version_hero_banners" DROP COLUMN "text_color";
  ALTER TABLE "_pages_v_version_hero_banners" DROP COLUMN "text_scrim";
  DROP TYPE "public"."enum_pages_hero_banners_text_color";
  DROP TYPE "public"."enum__pages_v_version_hero_banners_text_color";`)
}
