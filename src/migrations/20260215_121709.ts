import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_with_media_media_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_content_with_media_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_with_media_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_with_media_media_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_content_with_media_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_with_media_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_size_guides_row_type" AS ENUM('clothes', 'footwear');
  CREATE TYPE "public"."enum_orders_order_status" AS ENUM('processing', 'confirmed', 'shipped', 'delivered', 'cancelled');
  CREATE TYPE "public"."enum_ecc_settings_delay" AS ENUM('1', '0');
  ALTER TYPE "public"."enum_addresses_country" ADD VALUE 'RS' BEFORE 'US';
  CREATE TABLE "users_wishlist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"variant_id" integer
  );
  
  CREATE TABLE "pages_blocks_content_with_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"media_id" integer,
  	"media_position" "enum_pages_blocks_content_with_media_media_position" DEFAULT 'right',
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_with_media_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_with_media_link_appearance" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"expanded" jsonb
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_novo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 8,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pogledaj_ponudu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"label" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "pages_blocks_pogledaj_ponudu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'POGLEDAJ PONUDU',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_popularno" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 8,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_blog_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Blog',
  	"posts_per_page" numeric DEFAULT 50,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_latest_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Najnovije sa bloga',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Sneaker Hedonism Newsletter',
  	"description" varchar DEFAULT 'Zanimaju te najnovije informacije, dropovi i ekskluzivni popusti? Prijavi se!',
  	"form_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_embed_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Instagram',
  	"instagram_url" varchar DEFAULT 'https://www.instagram.com/_sneakerhedonism_/',
  	"embed_code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_with_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"media_id" integer,
  	"media_position" "enum__pages_v_blocks_content_with_media_media_position" DEFAULT 'right',
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_with_media_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_with_media_link_appearance" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"expanded" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_novo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 8,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pogledaj_ponudu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"label" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pogledaj_ponudu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'POGLEDAJ PONUDU',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_popularno" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 8,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_blog_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Blog',
  	"posts_per_page" numeric DEFAULT 50,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_latest_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Najnovije sa bloga',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Sneaker Hedonism Newsletter',
  	"description" varchar DEFAULT 'Zanimaju te najnovije informacije, dropovi i ekskluzivni popusti? Prijavi se!',
  	"form_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_embed_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Instagram',
  	"instagram_url" varchar DEFAULT 'https://www.instagram.com/_sneakerhedonism_/',
  	"embed_code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"featured_image_id" integer,
  	"author_id" integer,
  	"published_on" timestamp(3) with time zone,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_featured_image_id" integer,
  	"version_author_id" integer,
  	"version_published_on" timestamp(3) with time zone,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "size_guides_clothes_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" varchar,
  	"length" numeric,
  	"width" numeric
  );
  
  CREATE TABLE "size_guides_footwear_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eu" numeric,
  	"us" numeric,
  	"cm" numeric
  );
  
  CREATE TABLE "size_guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"row_type" "enum_size_guides_row_type" DEFAULT 'clothes' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "size_guides_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "orders_emails_sent" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" varchar,
  	"to" varchar,
  	"sent_at" timestamp(3) with time zone,
  	"error" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"default_size_guide_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ecc_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Plaćanje karticom',
  	"description" varchar DEFAULT 'Visa, MasterCard, Dina',
  	"merchant_id" varchar NOT NULL,
  	"terminal_id" varchar NOT NULL,
  	"currency" varchar DEFAULT '941' NOT NULL,
  	"delay" "enum_ecc_settings_delay" DEFAULT '1',
  	"gateway_url" varchar NOT NULL,
  	"locale" varchar DEFAULT 'sr',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "email_settings_admin_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "email_settings_carriers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"tracking_url_template" varchar NOT NULL
  );
  
  CREATE TABLE "email_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"store_name" varchar DEFAULT 'Sneaker Hedonism',
  	"from_email" varchar DEFAULT 'info@mail.sneakerhedonism.com',
  	"tracking_url_template" varchar DEFAULT 'https://www.posta.rs/cir/alati/pracenje-posiljke.aspx?broj={{trackingCode}}',
  	"store_url" varchar DEFAULT 'http://localhost:3000',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "variants" RENAME COLUMN "price_in_u_s_d_enabled" TO "price_in_r_s_d_enabled";
  ALTER TABLE "variants" RENAME COLUMN "price_in_u_s_d" TO "price_in_r_s_d";
  ALTER TABLE "_variants_v" RENAME COLUMN "version_price_in_u_s_d_enabled" TO "version_price_in_r_s_d_enabled";
  ALTER TABLE "_variants_v" RENAME COLUMN "version_price_in_u_s_d" TO "version_price_in_r_s_d";
  ALTER TABLE "products" RENAME COLUMN "price_in_u_s_d_enabled" TO "price_in_r_s_d_enabled";
  ALTER TABLE "products" RENAME COLUMN "price_in_u_s_d" TO "price_in_r_s_d";
  ALTER TABLE "_products_v" RENAME COLUMN "version_price_in_u_s_d_enabled" TO "version_price_in_r_s_d_enabled";
  ALTER TABLE "_products_v" RENAME COLUMN "version_price_in_u_s_d" TO "version_price_in_r_s_d";
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'RSD'::text;
  DROP TYPE "public"."enum_carts_currency";
  CREATE TYPE "public"."enum_carts_currency" AS ENUM('RSD');
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'RSD'::"public"."enum_carts_currency";
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_carts_currency" USING "currency"::"public"."enum_carts_currency";
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'RSD'::text;
  DROP TYPE "public"."enum_orders_currency";
  CREATE TYPE "public"."enum_orders_currency" AS ENUM('RSD');
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'RSD'::"public"."enum_orders_currency";
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_orders_currency" USING "currency"::"public"."enum_orders_currency";
  ALTER TABLE "transactions" ALTER COLUMN "payment_method" SET DATA TYPE text;
  DROP TYPE "public"."enum_transactions_payment_method";
  CREATE TYPE "public"."enum_transactions_payment_method" AS ENUM('cod', 'ecc');
  ALTER TABLE "transactions" ALTER COLUMN "payment_method" SET DATA TYPE "public"."enum_transactions_payment_method" USING "payment_method"::"public"."enum_transactions_payment_method";
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'RSD'::text;
  DROP TYPE "public"."enum_transactions_currency";
  CREATE TYPE "public"."enum_transactions_currency" AS ENUM('RSD');
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'RSD'::"public"."enum_transactions_currency";
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_transactions_currency" USING "currency"::"public"."enum_transactions_currency";
  ALTER TABLE "categories" ADD COLUMN "is_new" boolean DEFAULT false;
  ALTER TABLE "forms_blocks_email" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "variants" ADD COLUMN "sale_price_in_r_s_d" numeric;
  ALTER TABLE "_variants_v" ADD COLUMN "version_sale_price_in_r_s_d" numeric;
  ALTER TABLE "products" ADD COLUMN "short_description" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","detail":0,"format":0,"mode":"normal","style":"","text":"NEMA KRATKOG OPISA","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","version":1}],"direction":null,"format":"","indent":0,"version":1}}'::jsonb;
  ALTER TABLE "products" ADD COLUMN "sale_price_in_r_s_d" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_short_description" jsonb DEFAULT '{"root":{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","detail":0,"format":0,"mode":"normal","style":"","text":"NEMA KRATKOG OPISA","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","version":1}],"direction":null,"format":"","indent":0,"version":1}}'::jsonb;
  ALTER TABLE "_products_v" ADD COLUMN "version_sale_price_in_r_s_d" numeric;
  ALTER TABLE "orders" ADD COLUMN "order_status" "enum_orders_order_status" DEFAULT 'processing';
  ALTER TABLE "orders" ADD COLUMN "tracking_code" varchar;
  ALTER TABLE "orders" ADD COLUMN "carrier" varchar;
  ALTER TABLE "transactions" ADD COLUMN "cod_note" varchar;
  ALTER TABLE "transactions" ADD COLUMN "ecc_tran_code" varchar;
  ALTER TABLE "transactions" ADD COLUMN "ecc_approval_code" varchar;
  ALTER TABLE "transactions" ADD COLUMN "ecc_proxy_pan" varchar;
  ALTER TABLE "transactions" ADD COLUMN "ecc_rrn" varchar;
  ALTER TABLE "transactions" ADD COLUMN "ecc_xid" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "size_guides_id" integer;
  ALTER TABLE "users_wishlist" ADD CONSTRAINT "users_wishlist_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_wishlist" ADD CONSTRAINT "users_wishlist_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_wishlist" ADD CONSTRAINT "users_wishlist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_with_media" ADD CONSTRAINT "pages_blocks_content_with_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_with_media" ADD CONSTRAINT "pages_blocks_content_with_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_novo" ADD CONSTRAINT "pages_blocks_novo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pogledaj_ponudu_items" ADD CONSTRAINT "pages_blocks_pogledaj_ponudu_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_pogledaj_ponudu_items" ADD CONSTRAINT "pages_blocks_pogledaj_ponudu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pogledaj_ponudu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pogledaj_ponudu" ADD CONSTRAINT "pages_blocks_pogledaj_ponudu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_popularno" ADD CONSTRAINT "pages_blocks_popularno_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_blog_feed" ADD CONSTRAINT "pages_blocks_blog_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_latest_posts" ADD CONSTRAINT "pages_blocks_latest_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter" ADD CONSTRAINT "pages_blocks_newsletter_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter" ADD CONSTRAINT "pages_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_embed_social" ADD CONSTRAINT "pages_blocks_embed_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_with_media" ADD CONSTRAINT "_pages_v_blocks_content_with_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_with_media" ADD CONSTRAINT "_pages_v_blocks_content_with_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_novo" ADD CONSTRAINT "_pages_v_blocks_novo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pogledaj_ponudu_items" ADD CONSTRAINT "_pages_v_blocks_pogledaj_ponudu_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pogledaj_ponudu_items" ADD CONSTRAINT "_pages_v_blocks_pogledaj_ponudu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pogledaj_ponudu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pogledaj_ponudu" ADD CONSTRAINT "_pages_v_blocks_pogledaj_ponudu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_popularno" ADD CONSTRAINT "_pages_v_blocks_popularno_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_blog_feed" ADD CONSTRAINT "_pages_v_blocks_blog_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_latest_posts" ADD CONSTRAINT "_pages_v_blocks_latest_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter" ADD CONSTRAINT "_pages_v_blocks_newsletter_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter" ADD CONSTRAINT "_pages_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_embed_social" ADD CONSTRAINT "_pages_v_blocks_embed_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "size_guides_clothes_rows" ADD CONSTRAINT "size_guides_clothes_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."size_guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "size_guides_footwear_rows" ADD CONSTRAINT "size_guides_footwear_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."size_guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "size_guides_rels" ADD CONSTRAINT "size_guides_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."size_guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "size_guides_rels" ADD CONSTRAINT "size_guides_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_emails_sent" ADD CONSTRAINT "orders_emails_sent_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_size_guide_id_size_guides_id_fk" FOREIGN KEY ("default_size_guide_id") REFERENCES "public"."size_guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_settings_admin_emails" ADD CONSTRAINT "email_settings_admin_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."email_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "email_settings_carriers" ADD CONSTRAINT "email_settings_carriers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."email_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_wishlist_order_idx" ON "users_wishlist" USING btree ("_order");
  CREATE INDEX "users_wishlist_parent_id_idx" ON "users_wishlist" USING btree ("_parent_id");
  CREATE INDEX "users_wishlist_product_idx" ON "users_wishlist" USING btree ("product_id");
  CREATE INDEX "users_wishlist_variant_idx" ON "users_wishlist" USING btree ("variant_id");
  CREATE INDEX "pages_blocks_content_with_media_order_idx" ON "pages_blocks_content_with_media" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_with_media_parent_id_idx" ON "pages_blocks_content_with_media" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_with_media_path_idx" ON "pages_blocks_content_with_media" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_with_media_media_idx" ON "pages_blocks_content_with_media" USING btree ("media_id");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_novo_order_idx" ON "pages_blocks_novo" USING btree ("_order");
  CREATE INDEX "pages_blocks_novo_parent_id_idx" ON "pages_blocks_novo" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_novo_path_idx" ON "pages_blocks_novo" USING btree ("_path");
  CREATE INDEX "pages_blocks_pogledaj_ponudu_items_order_idx" ON "pages_blocks_pogledaj_ponudu_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_pogledaj_ponudu_items_parent_id_idx" ON "pages_blocks_pogledaj_ponudu_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pogledaj_ponudu_items_image_idx" ON "pages_blocks_pogledaj_ponudu_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_pogledaj_ponudu_order_idx" ON "pages_blocks_pogledaj_ponudu" USING btree ("_order");
  CREATE INDEX "pages_blocks_pogledaj_ponudu_parent_id_idx" ON "pages_blocks_pogledaj_ponudu" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pogledaj_ponudu_path_idx" ON "pages_blocks_pogledaj_ponudu" USING btree ("_path");
  CREATE INDEX "pages_blocks_popularno_order_idx" ON "pages_blocks_popularno" USING btree ("_order");
  CREATE INDEX "pages_blocks_popularno_parent_id_idx" ON "pages_blocks_popularno" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_popularno_path_idx" ON "pages_blocks_popularno" USING btree ("_path");
  CREATE INDEX "pages_blocks_blog_feed_order_idx" ON "pages_blocks_blog_feed" USING btree ("_order");
  CREATE INDEX "pages_blocks_blog_feed_parent_id_idx" ON "pages_blocks_blog_feed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_blog_feed_path_idx" ON "pages_blocks_blog_feed" USING btree ("_path");
  CREATE INDEX "pages_blocks_latest_posts_order_idx" ON "pages_blocks_latest_posts" USING btree ("_order");
  CREATE INDEX "pages_blocks_latest_posts_parent_id_idx" ON "pages_blocks_latest_posts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_latest_posts_path_idx" ON "pages_blocks_latest_posts" USING btree ("_path");
  CREATE INDEX "pages_blocks_newsletter_order_idx" ON "pages_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "pages_blocks_newsletter_parent_id_idx" ON "pages_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_newsletter_path_idx" ON "pages_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "pages_blocks_newsletter_form_idx" ON "pages_blocks_newsletter" USING btree ("form_id");
  CREATE INDEX "pages_blocks_embed_social_order_idx" ON "pages_blocks_embed_social" USING btree ("_order");
  CREATE INDEX "pages_blocks_embed_social_parent_id_idx" ON "pages_blocks_embed_social" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_embed_social_path_idx" ON "pages_blocks_embed_social" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_with_media_order_idx" ON "_pages_v_blocks_content_with_media" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_with_media_parent_id_idx" ON "_pages_v_blocks_content_with_media" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_with_media_path_idx" ON "_pages_v_blocks_content_with_media" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_with_media_media_idx" ON "_pages_v_blocks_content_with_media" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_novo_order_idx" ON "_pages_v_blocks_novo" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_novo_parent_id_idx" ON "_pages_v_blocks_novo" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_novo_path_idx" ON "_pages_v_blocks_novo" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pogledaj_ponudu_items_order_idx" ON "_pages_v_blocks_pogledaj_ponudu_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pogledaj_ponudu_items_parent_id_idx" ON "_pages_v_blocks_pogledaj_ponudu_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pogledaj_ponudu_items_image_idx" ON "_pages_v_blocks_pogledaj_ponudu_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_pogledaj_ponudu_order_idx" ON "_pages_v_blocks_pogledaj_ponudu" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pogledaj_ponudu_parent_id_idx" ON "_pages_v_blocks_pogledaj_ponudu" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pogledaj_ponudu_path_idx" ON "_pages_v_blocks_pogledaj_ponudu" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_popularno_order_idx" ON "_pages_v_blocks_popularno" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_popularno_parent_id_idx" ON "_pages_v_blocks_popularno" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_popularno_path_idx" ON "_pages_v_blocks_popularno" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_blog_feed_order_idx" ON "_pages_v_blocks_blog_feed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_blog_feed_parent_id_idx" ON "_pages_v_blocks_blog_feed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_blog_feed_path_idx" ON "_pages_v_blocks_blog_feed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_latest_posts_order_idx" ON "_pages_v_blocks_latest_posts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_latest_posts_parent_id_idx" ON "_pages_v_blocks_latest_posts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_latest_posts_path_idx" ON "_pages_v_blocks_latest_posts" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_order_idx" ON "_pages_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_newsletter_parent_id_idx" ON "_pages_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_newsletter_path_idx" ON "_pages_v_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_form_idx" ON "_pages_v_blocks_newsletter" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_embed_social_order_idx" ON "_pages_v_blocks_embed_social" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_embed_social_parent_id_idx" ON "_pages_v_blocks_embed_social" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_embed_social_path_idx" ON "_pages_v_blocks_embed_social" USING btree ("_path");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_tags_id_idx" ON "posts_rels" USING btree ("tags_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_featured_image_idx" ON "_posts_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_tags_id_idx" ON "_posts_v_rels" USING btree ("tags_id");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "size_guides_clothes_rows_order_idx" ON "size_guides_clothes_rows" USING btree ("_order");
  CREATE INDEX "size_guides_clothes_rows_parent_id_idx" ON "size_guides_clothes_rows" USING btree ("_parent_id");
  CREATE INDEX "size_guides_footwear_rows_order_idx" ON "size_guides_footwear_rows" USING btree ("_order");
  CREATE INDEX "size_guides_footwear_rows_parent_id_idx" ON "size_guides_footwear_rows" USING btree ("_parent_id");
  CREATE INDEX "size_guides_updated_at_idx" ON "size_guides" USING btree ("updated_at");
  CREATE INDEX "size_guides_created_at_idx" ON "size_guides" USING btree ("created_at");
  CREATE INDEX "size_guides_rels_order_idx" ON "size_guides_rels" USING btree ("order");
  CREATE INDEX "size_guides_rels_parent_idx" ON "size_guides_rels" USING btree ("parent_id");
  CREATE INDEX "size_guides_rels_path_idx" ON "size_guides_rels" USING btree ("path");
  CREATE INDEX "size_guides_rels_categories_id_idx" ON "size_guides_rels" USING btree ("categories_id");
  CREATE INDEX "orders_emails_sent_order_idx" ON "orders_emails_sent" USING btree ("_order");
  CREATE INDEX "orders_emails_sent_parent_id_idx" ON "orders_emails_sent" USING btree ("_parent_id");
  CREATE INDEX "site_settings_default_size_guide_idx" ON "site_settings" USING btree ("default_size_guide_id");
  CREATE INDEX "email_settings_admin_emails_order_idx" ON "email_settings_admin_emails" USING btree ("_order");
  CREATE INDEX "email_settings_admin_emails_parent_id_idx" ON "email_settings_admin_emails" USING btree ("_parent_id");
  CREATE INDEX "email_settings_carriers_order_idx" ON "email_settings_carriers" USING btree ("_order");
  CREATE INDEX "email_settings_carriers_parent_id_idx" ON "email_settings_carriers" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_size_guides_fk" FOREIGN KEY ("size_guides_id") REFERENCES "public"."size_guides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_size_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("size_guides_id");
  ALTER TABLE "transactions" DROP COLUMN "stripe_customer_i_d";
  ALTER TABLE "transactions" DROP COLUMN "stripe_payment_intent_i_d";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_wishlist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_content_with_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_novo" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pogledaj_ponudu_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pogledaj_ponudu" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_popularno" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_blog_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_latest_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_newsletter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_embed_social" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_content_with_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_novo" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pogledaj_ponudu_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pogledaj_ponudu" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_popularno" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_blog_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_latest_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_newsletter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_embed_social" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "size_guides_clothes_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "size_guides_footwear_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "size_guides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "size_guides_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_emails_sent" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ecc_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_settings_admin_emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_settings_carriers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_wishlist" CASCADE;
  DROP TABLE "pages_blocks_content_with_media" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_novo" CASCADE;
  DROP TABLE "pages_blocks_pogledaj_ponudu_items" CASCADE;
  DROP TABLE "pages_blocks_pogledaj_ponudu" CASCADE;
  DROP TABLE "pages_blocks_popularno" CASCADE;
  DROP TABLE "pages_blocks_blog_feed" CASCADE;
  DROP TABLE "pages_blocks_latest_posts" CASCADE;
  DROP TABLE "pages_blocks_newsletter" CASCADE;
  DROP TABLE "pages_blocks_embed_social" CASCADE;
  DROP TABLE "_pages_v_blocks_content_with_media" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_novo" CASCADE;
  DROP TABLE "_pages_v_blocks_pogledaj_ponudu_items" CASCADE;
  DROP TABLE "_pages_v_blocks_pogledaj_ponudu" CASCADE;
  DROP TABLE "_pages_v_blocks_popularno" CASCADE;
  DROP TABLE "_pages_v_blocks_blog_feed" CASCADE;
  DROP TABLE "_pages_v_blocks_latest_posts" CASCADE;
  DROP TABLE "_pages_v_blocks_newsletter" CASCADE;
  DROP TABLE "_pages_v_blocks_embed_social" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "size_guides_clothes_rows" CASCADE;
  DROP TABLE "size_guides_footwear_rows" CASCADE;
  DROP TABLE "size_guides" CASCADE;
  DROP TABLE "size_guides_rels" CASCADE;
  DROP TABLE "orders_emails_sent" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "ecc_settings" CASCADE;
  DROP TABLE "email_settings_admin_emails" CASCADE;
  DROP TABLE "email_settings_carriers" CASCADE;
  DROP TABLE "email_settings" CASCADE;
  ALTER TABLE "variants" RENAME COLUMN "price_in_r_s_d_enabled" TO "price_in_u_s_d_enabled";
  ALTER TABLE "variants" RENAME COLUMN "price_in_r_s_d" TO "price_in_u_s_d";
  ALTER TABLE "_variants_v" RENAME COLUMN "version_price_in_r_s_d_enabled" TO "version_price_in_u_s_d_enabled";
  ALTER TABLE "_variants_v" RENAME COLUMN "version_price_in_r_s_d" TO "version_price_in_u_s_d";
  ALTER TABLE "products" RENAME COLUMN "price_in_r_s_d_enabled" TO "price_in_u_s_d_enabled";
  ALTER TABLE "products" RENAME COLUMN "price_in_r_s_d" TO "price_in_u_s_d";
  ALTER TABLE "_products_v" RENAME COLUMN "version_price_in_r_s_d_enabled" TO "version_price_in_u_s_d_enabled";
  ALTER TABLE "_products_v" RENAME COLUMN "version_price_in_r_s_d" TO "version_price_in_u_s_d";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_posts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_size_guides_fk";
  
  ALTER TABLE "addresses" ALTER COLUMN "country" SET DATA TYPE text;
  DROP TYPE "public"."enum_addresses_country";
  CREATE TYPE "public"."enum_addresses_country" AS ENUM('US', 'GB', 'CA', 'AU', 'AT', 'BE', 'BR', 'BG', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HK', 'HU', 'IN', 'IE', 'IT', 'JP', 'LV', 'LT', 'LU', 'MY', 'MT', 'MX', 'NL', 'NZ', 'NO', 'PL', 'PT', 'RO', 'SG', 'SK', 'SI', 'ES', 'SE', 'CH');
  ALTER TABLE "addresses" ALTER COLUMN "country" SET DATA TYPE "public"."enum_addresses_country" USING "country"::"public"."enum_addresses_country";
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'USD'::text;
  DROP TYPE "public"."enum_carts_currency";
  CREATE TYPE "public"."enum_carts_currency" AS ENUM('USD');
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'USD'::"public"."enum_carts_currency";
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_carts_currency" USING "currency"::"public"."enum_carts_currency";
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'USD'::text;
  DROP TYPE "public"."enum_orders_currency";
  CREATE TYPE "public"."enum_orders_currency" AS ENUM('USD');
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'USD'::"public"."enum_orders_currency";
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_orders_currency" USING "currency"::"public"."enum_orders_currency";
  ALTER TABLE "transactions" ALTER COLUMN "payment_method" SET DATA TYPE text;
  DROP TYPE "public"."enum_transactions_payment_method";
  CREATE TYPE "public"."enum_transactions_payment_method" AS ENUM('stripe');
  ALTER TABLE "transactions" ALTER COLUMN "payment_method" SET DATA TYPE "public"."enum_transactions_payment_method" USING "payment_method"::"public"."enum_transactions_payment_method";
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'USD'::text;
  DROP TYPE "public"."enum_transactions_currency";
  CREATE TYPE "public"."enum_transactions_currency" AS ENUM('USD');
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'USD'::"public"."enum_transactions_currency";
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_transactions_currency" USING "currency"::"public"."enum_transactions_currency";
  DROP INDEX "payload_locked_documents_rels_posts_id_idx";
  DROP INDEX "payload_locked_documents_rels_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_size_guides_id_idx";
  ALTER TABLE "transactions" ADD COLUMN "stripe_customer_i_d" varchar;
  ALTER TABLE "transactions" ADD COLUMN "stripe_payment_intent_i_d" varchar;
  ALTER TABLE "categories" DROP COLUMN "is_new";
  ALTER TABLE "forms_blocks_email" DROP COLUMN "placeholder";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "placeholder";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "placeholder";
  ALTER TABLE "variants" DROP COLUMN "sale_price_in_r_s_d";
  ALTER TABLE "_variants_v" DROP COLUMN "version_sale_price_in_r_s_d";
  ALTER TABLE "products" DROP COLUMN "short_description";
  ALTER TABLE "products" DROP COLUMN "sale_price_in_r_s_d";
  ALTER TABLE "_products_v" DROP COLUMN "version_short_description";
  ALTER TABLE "_products_v" DROP COLUMN "version_sale_price_in_r_s_d";
  ALTER TABLE "orders" DROP COLUMN "order_status";
  ALTER TABLE "orders" DROP COLUMN "tracking_code";
  ALTER TABLE "orders" DROP COLUMN "carrier";
  ALTER TABLE "transactions" DROP COLUMN "cod_note";
  ALTER TABLE "transactions" DROP COLUMN "ecc_tran_code";
  ALTER TABLE "transactions" DROP COLUMN "ecc_approval_code";
  ALTER TABLE "transactions" DROP COLUMN "ecc_proxy_pan";
  ALTER TABLE "transactions" DROP COLUMN "ecc_rrn";
  ALTER TABLE "transactions" DROP COLUMN "ecc_xid";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "size_guides_id";
  DROP TYPE "public"."enum_pages_blocks_content_with_media_media_position";
  DROP TYPE "public"."enum_pages_blocks_content_with_media_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_with_media_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_with_media_media_position";
  DROP TYPE "public"."enum__pages_v_blocks_content_with_media_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_with_media_link_appearance";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_size_guides_row_type";
  DROP TYPE "public"."enum_orders_order_status";
  DROP TYPE "public"."enum_ecc_settings_delay";`)
}
