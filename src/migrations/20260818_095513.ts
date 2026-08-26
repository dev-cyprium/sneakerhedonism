import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_lokacija" ALTER COLUMN "heading" SET DEFAULT 'LOKACIJA';
  ALTER TABLE "_pages_v_blocks_lokacija" ALTER COLUMN "heading" SET DEFAULT 'LOKACIJA';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_lokacija" ALTER COLUMN "heading" SET DEFAULT 'POSETI NAS';
  ALTER TABLE "_pages_v_blocks_lokacija" ALTER COLUMN "heading" SET DEFAULT 'POSETI NAS';`)
}
