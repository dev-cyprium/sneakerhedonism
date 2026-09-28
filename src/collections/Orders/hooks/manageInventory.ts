import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { APIError, type CollectionBeforeChangeHook } from 'payload'
import type { Order } from '@/payload-types'

const idOf = (value: number | { id: number } | null | undefined) =>
  typeof value === 'object' ? value?.id : value

function quantities(items: Order['items']) {
  const result = new Map<
    string,
    { collection: 'products' | 'variants'; id: number; quantity: number }
  >()
  for (const item of items ?? []) {
    const variant = idOf(item.variant)
    const id = variant ?? idOf(item.product)
    if (!id || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new APIError('Order items require a product and a positive integer quantity.', 400)
    }
    const collection = variant ? 'variants' : 'products'
    const key = `${collection}:${id}`
    const previous = result.get(key)
    result.set(key, { collection, id, quantity: (previous?.quantity ?? 0) + item.quantity })
  }
  return [...result.values()].sort(
    (a, b) => a.collection.localeCompare(b.collection) || a.id - b.id,
  )
}

/** Lock order and stock rows in the same transaction as the order status change. */
export const manageInventory: CollectionBeforeChangeHook<Order> = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const transactionID = await req.transactionID
  const adapter = req.payload.db as unknown as PostgresAdapter
  const db = transactionID
    ? (adapter.sessions[transactionID]?.db as PostgresAdapter['drizzle'] | undefined)
    : undefined
  if (!db) throw new APIError('Inventory changes require a database transaction.', 500)

  let previous = operation === 'update' ? originalDoc : undefined
  if (operation === 'update' && originalDoc) {
    await db.execute(sql`SELECT id FROM orders WHERE id = ${originalDoc.id} FOR UPDATE`)
    previous = await req.payload.findByID({
      collection: 'orders',
      id: originalDoc.id,
      depth: 0,
      req,
    })
  }
  const status = data.orderStatus ?? previous?.orderStatus ?? 'processing'
  const deducted = previous?.inventoryDeducted ?? false
  // The accounting marker is server-owned, including Local API writes.
  data.inventoryDeducted = deducted
  const items = data.items ?? previous?.items
  if (
    previous &&
    JSON.stringify(quantities(items)) !== JSON.stringify(quantities(previous.items))
  ) {
    throw new APIError(
      'Order items cannot be changed after placement. Cancel and create a new order.',
      400,
    )
  }
  if (previous?.orderStatus === 'cancelled' && status !== 'cancelled') {
    throw new APIError('Cancelled orders cannot be reopened. Create a new order.', 400)
  }
  if ((status === 'shipped' || status === 'delivered') && !deducted) {
    throw new APIError('Confirm the order before shipping or delivering it.', 400)
  }
  if (deducted && status === 'processing' && previous?.orderStatus !== 'processing') {
    throw new APIError(
      'A confirmed order cannot return to processing. Cancel it to release stock.',
      400,
    )
  }
  const direction =
    status === 'cancelled' && deducted ? 1 : status === 'confirmed' && !deducted ? -1 : 0
  if (!direction) return data

  const lines = quantities(items)
  if (!lines.length) throw new APIError('Cannot confirm an empty order.', 400)
  // Variant hooks also update the parent product's effective price. Lock parents
  // first so concurrent orders touching different variants cannot deadlock.
  const parents = [
    ...new Set(
      (items ?? [])
        .map((item) => idOf(item.product))
        .filter((id): id is number => typeof id === 'number'),
    ),
  ].sort((a, b) => a - b)
  for (const id of parents) {
    await db.execute(sql`SELECT id FROM products WHERE id = ${id} FOR UPDATE`)
  }
  for (const line of lines) {
    await db.execute(
      sql`SELECT id FROM ${sql.identifier(line.collection)} WHERE id = ${line.id} FOR UPDATE`,
    )
    const product = await req.payload.findByID({
      collection: line.collection,
      id: line.id,
      depth: 0,
      req,
    })
    const inventory = product.inventory ?? 0
    if (direction < 0 && inventory < line.quantity) {
      throw new APIError(`Insufficient stock for ${product.title}. Available: ${inventory}.`, 400)
    }
    await req.payload.update({
      collection: line.collection,
      id: line.id,
      data: { inventory: inventory + direction * line.quantity },
      req,
    })
  }
  data.inventoryDeducted = direction < 0
  return data
}
