import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { CollectionSlug } from 'payload'

export const codAdapter = (): PaymentAdapter => {
  return {
    name: 'cod',
    label: 'Pay on Delivery',
    group: {
      name: 'cod',
      type: 'group',
      admin: {
        condition: (data) => data?.paymentMethod === 'cod',
      },
      fields: [
        {
          name: 'note',
          type: 'text',
          label: 'COD Note',
        },
      ],
    },
    initiatePayment: async ({ data, req, transactionsSlug }) => {
      const payload = req.payload
      const { cart, currency, customerEmail, billingAddress } = data

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty or not provided.')
      }

      if (!customerEmail || typeof customerEmail !== 'string') {
        throw new Error('A valid customer email is required.')
      }

      // Calculate amount from cart items since subtotal may be 0
      const priceField = `priceIn${currency.toUpperCase()}`
      const saleField = `salePriceIn${currency.toUpperCase()}`
      let amount = 0

      for (const item of cart.items) {
        const quantity = item.quantity || 1
        const productId = typeof item.product === 'object' ? item.product.id : item.product

        if (item.variant) {
          const variantId = typeof item.variant === 'object' ? item.variant.id : item.variant
          const variant = await payload.findByID({
            id: variantId,
            collection: 'variants' as CollectionSlug,
            depth: 0,
            select: { [priceField]: true, [saleField]: true },
          })
          const product = await payload.findByID({
            id: productId,
            collection: 'products' as CollectionSlug,
            depth: 0,
            select: { [priceField]: true, [saleField]: true },
          })
          const v = variant as Record<string, any>
          const p = product as Record<string, any>
          // Prefer any sale price over any regular price (discount always wins)
          const price =
            v[saleField] ?? p[saleField] ?? v[priceField] ?? p[priceField] ?? 0
          amount += price * quantity
        } else if (item.product) {
          const product = await payload.findByID({
            id: productId,
            collection: 'products' as CollectionSlug,
            depth: 0,
            select: { [priceField]: true, [saleField]: true },
          })
          const p = product as Record<string, any>
          const price = p[saleField] ?? p[priceField] ?? 0
          amount += price * quantity
        }
      }

      const flattenedCart = cart.items.map((item) => {
        const productID = typeof item.product === 'object' ? item.product.id : item.product
        const variantID = item.variant
          ? typeof item.variant === 'object'
            ? item.variant.id
            : item.variant
          : undefined
        return {
          product: productID,
          quantity: item.quantity,
          ...(variantID ? { variant: variantID } : {}),
        }
      })

      const transaction = await payload.create({
        collection: transactionsSlug as CollectionSlug,
        data: {
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          amount,
          billingAddress,
          cart: cart.id,
          currency: currency.toUpperCase() as 'RSD',
          items: flattenedCart,
          paymentMethod: 'cod' as const,
          status: 'pending' as const,
        },
      })

      return {
        message: 'COD order initiated',
        transactionID: transaction.id,
      }
    },
    confirmOrder: async ({
      cartsSlug = 'carts',
      data,
      ordersSlug = 'orders',
      req,
      transactionsSlug = 'transactions',
    }) => {
      const payload = req.payload
      const customerEmail = data.customerEmail
      const transactionID = data.transactionID
      const shippingAddress = data.shippingAddress

      if (!transactionID) {
        throw new Error('Transaction ID is required.')
      }

      const transaction = await payload.findByID({
        id: transactionID as number,
        collection: transactionsSlug as CollectionSlug,
        depth: 0,
      })

      if (!transaction) {
        throw new Error('Transaction not found.')
      }

      const txn = transaction as Record<string, any>

      const order = await payload.create({
        collection: ordersSlug as CollectionSlug,
        data: {
          amount: txn.amount,
          currency: txn.currency,
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          items: txn.items,
          ...(shippingAddress ? { shippingAddress } : {}),
          status: 'processing',
          orderStatus: 'processing',
          transactions: [transaction.id],
        },
      })

      const cartID = txn.cart
      if (cartID) {
        await payload.update({
          id: typeof cartID === 'object' ? cartID.id : cartID,
          collection: cartsSlug as CollectionSlug,
          data: {
            purchasedAt: new Date().toISOString(),
          },
        })
      }

      await payload.update({
        id: transaction.id,
        collection: transactionsSlug as CollectionSlug,
        data: {
          order: order.id,
          status: 'succeeded',
        } as any,
      })

      return {
        message: 'Order placed successfully. Payment on delivery.',
        orderID: order.id,
        transactionID: transaction.id,
      }
    },
  }
}
