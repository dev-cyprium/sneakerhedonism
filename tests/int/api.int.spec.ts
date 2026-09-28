import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { up as migrateInventory } from '@/migrations/20260928_160000_order_inventory'
import { inStockWhere } from '@/lib/inStock'
import { getPayload, Payload, createLocalReq } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })

  it('only resumes unfinished carts on login', async () => {
    const customer = await payload.create({
      collection: 'users',
      data: {
        email: `cart-regression-${Date.now()}@test.com`,
        password: 'test-password',
        roles: ['customer'],
      },
    })
    try {
      const active = await payload.create({
        collection: 'carts',
        data: { customer: customer.id, currency: 'RSD', items: [] },
      })
      // Create the completed cart last so it would otherwise be resumed first.
      await payload.create({
        collection: 'carts',
        data: {
          customer: customer.id,
          currency: 'RSD',
          items: [],
          purchasedAt: new Date().toISOString(),
        },
      })
      const user = await payload.findByID({ collection: 'users', id: customer.id, depth: 1 })
      expect(user.cart?.docs?.map((cart) => (typeof cart === 'object' ? cart.id : cart))).toEqual([
        active.id,
      ])
    } finally {
      await payload.delete({ collection: 'carts', where: { customer: { equals: customer.id } } })
      await payload.delete({ collection: 'users', id: customer.id })
    }
  })

  it('accounts for stock only on confirmation, with idempotent cancellation and concurrent protection', async () => {
    const context = { disableRevalidate: true }
    const product = await payload.create({
      collection: 'products',
      context,
      data: {
        title: 'Inventory regression',
        slug: 'inventory-regression',
        inventory: 1,
        priceInRSD: 1000,
        priceInRSDEnabled: true,
        _status: 'published',
      },
    })
    const ids: number[] = []
    const stock = async () =>
      (await payload.findByID({ collection: 'products', id: product.id })).inventory
    const place = async () => {
      const order = await payload.create({
        collection: 'orders',
        context,
        data: {
          items: [{ product: product.id, quantity: 1 }],
          amount: 1000,
          currency: 'RSD',
          customerEmail: 'inventory@test.com',
          orderStatus: 'processing',
        },
      })
      ids.push(order.id)
      return order
    }
    const status = (id: number, orderStatus: 'confirmed' | 'cancelled' | 'shipped') =>
      payload.update({ collection: 'orders', id, context, data: { orderStatus } })
    try {
      const first = await place()
      expect(await stock()).toBe(1)
      await status(first.id, 'cancelled')
      expect(await stock()).toBe(1)
      const a = await place()
      const b = await place()
      await expect(status(a.id, 'shipped')).rejects.toThrow('Confirm the order')
      const outcomes = await Promise.allSettled([
        status(a.id, 'confirmed'),
        status(b.id, 'confirmed'),
      ])
      expect(outcomes.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
      expect(await stock()).toBe(0)
      const winner = outcomes[0].status === 'fulfilled' ? a : b
      await status(winner.id, 'confirmed')
      expect(await stock()).toBe(0)
      const hidden = await payload.find({
        collection: 'products',
        where: { and: [inStockWhere, { id: { equals: product.id } }] },
      })
      expect(hidden.docs).toHaveLength(0)
      await Promise.all([status(winner.id, 'cancelled'), status(winner.id, 'cancelled')])
      expect(await stock()).toBe(1)
      const visible = await payload.find({
        collection: 'products',
        where: { and: [inStockWhere, { id: { equals: product.id } }] },
      })
      expect(visible.docs).toHaveLength(1)
      await expect(status(winner.id, 'confirmed')).rejects.toThrow('cannot be reopened')
    } finally {
      for (const id of ids) await payload.delete({ collection: 'orders', id, context })
      await payload.delete({ collection: 'products', id: product.id, context })
    }
  }, 30000)

  it('deducts variant stock, rolls back a multi-item failure, and restores variants once', async () => {
    const context = { disableRevalidate: true }
    const product = await payload.create({
      collection: 'products',
      context,
      data: {
        title: 'Variant inventory regression',
        slug: 'variant-inventory-regression',
        enableVariants: true,
        inventory: 99,
        _status: 'published',
      },
    })
    const group = await payload.create({
      collection: 'variantTypes',
      context,
      data: { name: 'inventory-test', label: 'Inventory test' },
    })
    const optionIDs: number[] = []
    const variants: { id: number }[] = []
    const orders: number[] = []
    try {
      for (const inventory of [1, 0]) {
        const option = await payload.create({
          collection: 'variantOptions',
          context,
          data: { variantType: group.id, value: String(inventory), label: String(inventory) },
        })
        optionIDs.push(option.id)
        variants.push(
          await payload.create({
            collection: 'variants',
            context,
            data: {
              product: product.id,
              options: [option.id],
              inventory,
              priceInRSD: 1000,
              priceInRSDEnabled: true,
              _status: 'published',
            },
          }),
        )
      }
      const create = async (items: { product: number; variant: number; quantity: number }[]) => {
        const order = await payload.create({
          collection: 'orders',
          context,
          data: {
            items,
            amount: 2000,
            currency: 'RSD',
            customerEmail: 'variants@test.com',
          },
        })
        orders.push(order.id)
        return order
      }
      const failed = await create(
        variants.map((v) => ({ product: product.id, variant: v.id, quantity: 1 })),
      )
      await expect(
        payload.update({
          collection: 'orders',
          id: failed.id,
          context,
          data: { orderStatus: 'confirmed' },
        }),
      ).rejects.toThrow('Insufficient stock')
      expect(
        (await payload.findByID({ collection: 'variants', id: variants[0].id })).inventory,
      ).toBe(1)
      const visible = () =>
        payload.find({
          collection: 'products',
          where: { and: [inStockWhere, { id: { equals: product.id } }] },
        })
      expect((await visible()).docs).toHaveLength(1)
      const order = await create([{ product: product.id, variant: variants[0].id, quantity: 1 }])
      await Promise.all(
        [1, 2].map(() =>
          payload.update({
            collection: 'orders',
            id: order.id,
            context,
            data: { orderStatus: 'confirmed' },
          }),
        ),
      )
      expect(
        (await payload.findByID({ collection: 'variants', id: variants[0].id })).inventory,
      ).toBe(0)
      expect((await visible()).docs).toHaveLength(0)
      await payload.update({
        collection: 'orders',
        id: order.id,
        context,
        data: { orderStatus: 'cancelled' },
      })
      expect(
        (await payload.findByID({ collection: 'variants', id: variants[0].id })).inventory,
      ).toBe(1)
      expect((await payload.findByID({ collection: 'products', id: product.id })).inventory).toBe(
        99,
      )
    } finally {
      for (const id of orders) await payload.delete({ collection: 'orders', id, context })
      for (const variant of variants)
        await payload.delete({ collection: 'variants', id: variant.id, context })
      await payload.delete({ collection: 'products', id: product.id, context })
      for (const id of optionIDs)
        await payload.delete({ collection: 'variantOptions', id, context })
      await payload.delete({ collection: 'variantTypes', id: group.id, context })
    }
  }, 30000)

  it('migrates legacy orders without changing stock or double-deducting them', async () => {
    const adapter = payload.db as unknown as PostgresAdapter
    await adapter.drizzle.transaction(async (db) => {
      // A temporary table shadows orders only on this connection.
      await db.execute(sql`CREATE TEMP TABLE orders (id integer, order_status text) ON COMMIT DROP`)
      await db.execute(
        sql`INSERT INTO orders VALUES (1, 'processing'), (2, 'confirmed'), (3, 'cancelled')`,
      )
      await db.execute(sql`CREATE TEMP TABLE transactions (
        order_id integer, payment_method text, status text
      ) ON COMMIT DROP`)
      await db.execute(sql`INSERT INTO transactions VALUES
        (1, 'cod', 'succeeded'), (2, 'ecc', 'succeeded'), (3, 'cod', 'succeeded')`)
      await migrateInventory({ db, payload, req: await createLocalReq({}, payload) })
      const result = await db.execute(sql`SELECT inventory_deducted FROM orders ORDER BY id`)
      expect(result.rows.map((row) => row.inventory_deducted)).toEqual([true, false, false])
      await db.execute(sql`INSERT INTO orders (id, order_status) VALUES (4, 'processing')`)
      const fresh = await db.execute(sql`SELECT inventory_deducted FROM orders WHERE id = 4`)
      expect(fresh.rows[0].inventory_deducted).toBe(false)
    })
  })

  afterAll(async () => {
    await payload?.destroy()
  })
})
