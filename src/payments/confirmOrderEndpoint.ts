import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import {
  addDataAndFileToRequest,
  APIError,
  initTransaction,
  commitTransaction,
  killTransaction,
  type Endpoint,
} from 'payload'

/** Checkout places a processing order; stock accounting belongs to order confirmation. */
export const confirmOrderEndpoint = (paymentMethod: PaymentAdapter): Endpoint => ({
  path: `/payments/${paymentMethod.name}/confirm-order`,
  method: 'post',
  handler: async (req) => {
    await addDataAndFileToRequest(req)
    const data = req.data ?? {}
    if (!Number.isSafeInteger(Number(data.transactionID)) || Number(data.transactionID) <= 0) {
      throw new APIError('A valid transaction ID is required.', 400)
    }
    const started = await initTransaction(req)
    try {
      const adapter = req.payload.db as unknown as PostgresAdapter
      const transactionID = await req.transactionID
      const db = transactionID
        ? (adapter.sessions[transactionID]?.db as PostgresAdapter['drizzle'])
        : undefined
      if (!db) throw new APIError('Checkout requires a database transaction.', 500)
      await db.execute(sql`SELECT id FROM transactions WHERE id = ${data.transactionID} FOR UPDATE`)
      const transaction = await req.payload.findByID({
        collection: 'transactions',
        id: data.transactionID,
        depth: 0,
        req,
      })
      const customer =
        typeof transaction.customer === 'object' ? transaction.customer?.id : transaction.customer
      if (
        transaction.paymentMethod !== paymentMethod.name ||
        (customer ? req.user?.id !== customer : transaction.customerEmail !== data.customerEmail)
      ) {
        throw new APIError('Transaction does not belong to this customer.', 403)
      }
      const cartID = typeof transaction.cart === 'object' ? transaction.cart?.id : transaction.cart
      if (!cartID) throw new APIError('Transaction has no cart.', 400)
      req.query = { ...req.query, secret: data.secret }
      await req.payload.findByID({ collection: 'carts', id: cartID, overrideAccess: false, req })
      if (transaction.order) {
        if (started) await commitTransaction(req)
        return Response.json({
          orderID: typeof transaction.order === 'object' ? transaction.order.id : transaction.order,
          transactionID: transaction.id,
        })
      }
      const result = await paymentMethod.confirmOrder({
        req,
        data: { ...data, customerEmail: req.user?.email ?? data.customerEmail },
      })
      if (started) await commitTransaction(req)
      return Response.json(result)
    } catch (error) {
      if (started) await killTransaction(req)
      throw error
    }
  },
})
