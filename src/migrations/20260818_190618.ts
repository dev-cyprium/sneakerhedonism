import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_lokacija" ALTER COLUMN "map_embed" SET DEFAULT 'https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1sInternacionalnih+Brigada+11,+Beograd';
  ALTER TABLE "_pages_v_blocks_lokacija" ALTER COLUMN "map_embed" SET DEFAULT 'https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1sInternacionalnih+Brigada+11,+Beograd';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_lokacija" ALTER COLUMN "map_embed" SET DEFAULT 'https://www.google.com/maps?q=Internacionalnih+Brigada+11,+Beograd&output=embed';
  ALTER TABLE "_pages_v_blocks_lokacija" ALTER COLUMN "map_embed" SET DEFAULT 'https://www.google.com/maps?q=Internacionalnih+Brigada+11,+Beograd&output=embed';`)
}
