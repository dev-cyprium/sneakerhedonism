import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "effective_price" numeric;
  ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_effective_price" numeric;
  ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "serbian_post_tracking_code" varchar;
  CREATE INDEX IF NOT EXISTS "products_effective_price_idx" ON "products" USING btree ("effective_price");
  CREATE INDEX IF NOT EXISTS "_products_v_version_version_effective_price_idx" ON "_products_v" USING btree ("version_effective_price");

  UPDATE "products" p
  SET "effective_price" = COALESCE(
    (SELECT MIN(COALESCE(NULLIF(v."sale_price_in_r_s_d", 0), v."price_in_r_s_d"))
     FROM "variants" v WHERE v."product_id" = p."id"
       AND COALESCE(NULLIF(v."sale_price_in_r_s_d", 0), v."price_in_r_s_d") > 0),
    NULLIF(p."sale_price_in_r_s_d", 0),
    p."price_in_r_s_d",
    0
  );

  UPDATE "_products_v"
  SET "version_effective_price" = COALESCE(NULLIF("version_sale_price_in_r_s_d", 0), "version_price_in_r_s_d", 0);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "products_effective_price_idx";
  DROP INDEX "_products_v_version_version_effective_price_idx";
  ALTER TABLE "products" DROP COLUMN "effective_price";
  ALTER TABLE "_products_v" DROP COLUMN "version_effective_price";
  ALTER TABLE "orders" DROP COLUMN "serbian_post_tracking_code";`)
}
