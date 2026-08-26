import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_lokacija_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_lokacija_image_position" AS ENUM('left', 'right');
  CREATE TABLE "pages_blocks_lokacija" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'POSETI NAS',
  	"image_id" integer,
  	"image_position" "enum_pages_blocks_lokacija_image_position" DEFAULT 'left',
  	"map_embed" varchar DEFAULT 'https://www.google.com/maps?q=Internacionalnih+Brigada+11,+Beograd&output=embed',
  	"address" varchar DEFAULT 'Internacionalnih Brigada 11',
  	"city" varchar DEFAULT 'Beograd',
  	"hours" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_lokacija" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'POSETI NAS',
  	"image_id" integer,
  	"image_position" "enum__pages_v_blocks_lokacija_image_position" DEFAULT 'left',
  	"map_embed" varchar DEFAULT 'https://www.google.com/maps?q=Internacionalnih+Brigada+11,+Beograd&output=embed',
  	"address" varchar DEFAULT 'Internacionalnih Brigada 11',
  	"city" varchar DEFAULT 'Beograd',
  	"hours" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_lokacija" ADD CONSTRAINT "pages_blocks_lokacija_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_lokacija" ADD CONSTRAINT "pages_blocks_lokacija_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lokacija" ADD CONSTRAINT "_pages_v_blocks_lokacija_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lokacija" ADD CONSTRAINT "_pages_v_blocks_lokacija_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_lokacija_order_idx" ON "pages_blocks_lokacija" USING btree ("_order");
  CREATE INDEX "pages_blocks_lokacija_parent_id_idx" ON "pages_blocks_lokacija" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_lokacija_path_idx" ON "pages_blocks_lokacija" USING btree ("_path");
  CREATE INDEX "pages_blocks_lokacija_image_idx" ON "pages_blocks_lokacija" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_lokacija_order_idx" ON "_pages_v_blocks_lokacija" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_lokacija_parent_id_idx" ON "_pages_v_blocks_lokacija" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_lokacija_path_idx" ON "_pages_v_blocks_lokacija" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_lokacija_image_idx" ON "_pages_v_blocks_lokacija" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_lokacija" CASCADE;
  DROP TABLE "_pages_v_blocks_lokacija" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_lokacija_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_lokacija_image_position";`)
}
