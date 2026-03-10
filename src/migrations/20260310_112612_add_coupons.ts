import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "coupons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"discount_percent" numeric NOT NULL,
  	"minimum_subtotal" numeric DEFAULT 0 NOT NULL,
  	"expires_at" timestamp(3) with time zone,
  	"unlimited_usage" boolean DEFAULT false,
  	"usage_limit" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "orders" ADD COLUMN "coupon_id" integer;
  ALTER TABLE "orders" ADD COLUMN "coupon_code" varchar;
  ALTER TABLE "orders" ADD COLUMN "coupon_discount_percent" numeric;
  ALTER TABLE "orders" ADD COLUMN "coupon_discount_amount" numeric;
  ALTER TABLE "orders" ADD COLUMN "coupon_minimum_subtotal" numeric;
  ALTER TABLE "orders" ADD COLUMN "subtotal_before_discount" numeric;
  ALTER TABLE "orders" ADD COLUMN "subtotal_after_discount" numeric;
  ALTER TABLE "orders" ADD COLUMN "shipping_amount" numeric;
  ALTER TABLE "transactions" ADD COLUMN "coupon_id" integer;
  ALTER TABLE "transactions" ADD COLUMN "coupon_code" varchar;
  ALTER TABLE "transactions" ADD COLUMN "coupon_discount_percent" numeric;
  ALTER TABLE "transactions" ADD COLUMN "coupon_discount_amount" numeric;
  ALTER TABLE "transactions" ADD COLUMN "coupon_minimum_subtotal" numeric;
  ALTER TABLE "transactions" ADD COLUMN "subtotal_before_discount" numeric;
  ALTER TABLE "transactions" ADD COLUMN "subtotal_after_discount" numeric;
  ALTER TABLE "transactions" ADD COLUMN "shipping_amount" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "coupons_id" integer;
  CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");
  CREATE INDEX "coupons_updated_at_idx" ON "coupons" USING btree ("updated_at");
  CREATE INDEX "coupons_created_at_idx" ON "coupons" USING btree ("created_at");
  ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coupons_fk" FOREIGN KEY ("coupons_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_coupon_idx" ON "orders" USING btree ("coupon_id");
  CREATE INDEX "transactions_coupon_idx" ON "transactions" USING btree ("coupon_id");
  CREATE INDEX "payload_locked_documents_rels_coupons_id_idx" ON "payload_locked_documents_rels" USING btree ("coupons_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_coupon_id_coupons_id_fk";
  ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_coupon_id_coupons_id_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_coupons_fk";
  DROP INDEX IF EXISTS "orders_coupon_idx";
  DROP INDEX IF EXISTS "transactions_coupon_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_coupons_id_idx";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "coupon_id";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "coupon_code";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "coupon_discount_percent";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "coupon_discount_amount";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "coupon_minimum_subtotal";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "subtotal_before_discount";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "subtotal_after_discount";
  ALTER TABLE "orders" DROP COLUMN IF EXISTS "shipping_amount";
  ALTER TABLE "transactions" DROP COLUMN IF EXISTS "coupon_id";
  ALTER TABLE "transactions" DROP COLUMN IF EXISTS "coupon_code";
  ALTER TABLE "transactions" DROP COLUMN IF EXISTS "coupon_discount_percent";
  ALTER TABLE "transactions" DROP COLUMN IF EXISTS "coupon_discount_amount";
  ALTER TABLE "transactions" DROP COLUMN IF EXISTS "coupon_minimum_subtotal";
  ALTER TABLE "transactions" DROP COLUMN IF EXISTS "subtotal_before_discount";
  ALTER TABLE "transactions" DROP COLUMN IF EXISTS "subtotal_after_discount";
  ALTER TABLE "transactions" DROP COLUMN IF EXISTS "shipping_amount";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "coupons_id";
  DROP INDEX IF EXISTS "coupons_code_idx";
  DROP INDEX IF EXISTS "coupons_updated_at_idx";
  DROP INDEX IF EXISTS "coupons_created_at_idx";
  DROP TABLE IF EXISTS "coupons" CASCADE;`)
}
