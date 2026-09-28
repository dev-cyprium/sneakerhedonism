import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE orders ADD COLUMN inventory_deducted boolean DEFAULT false;
    -- COD used the plugin checkout endpoint, which deducted at placement.
    -- The ECC bank callback created orders directly and did not deduct stock.
    -- Cancelled/manual/card orders require a separate physical-stock audit.
    UPDATE orders SET inventory_deducted = true
      WHERE order_status IS DISTINCT FROM 'cancelled'
        AND EXISTS (
          SELECT 1 FROM transactions
          WHERE transactions.order_id = orders.id
            AND transactions.payment_method = 'cod'
            AND transactions.status = 'succeeded'
        );
  `)
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE orders DROP COLUMN inventory_deducted;`)
}
