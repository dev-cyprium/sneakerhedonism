import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { CollectionSlug } from 'payload'

import { resolveCheckoutPricing } from '@/lib/checkoutPricing'

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
      const couponCode = (data as Record<string, unknown>).couponCode

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty or not provided.')
      }

      if (!customerEmail || typeof customerEmail !== 'string') {
        throw new Error('A valid customer email is required.')
      }

      const pricing = await resolveCheckoutPricing({
        cartItems: cart.items,
        couponCode: typeof couponCode === 'string' ? couponCode : undefined,
        currency,
        payload,
        req,
        user: req.user ?? null,
      })

      const transaction = await payload.create({
        collection: transactionsSlug as CollectionSlug,
        data: {
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          amount: pricing.totalAmount,
          billingAddress,
          cart: cart.id,
          currency: currency.toUpperCase() as 'RSD',
          items: pricing.flattenedItems,
          paymentMethod: 'cod' as const,
          status: 'pending' as const,
          subtotalBeforeDiscount: pricing.subtotalAmount,
          subtotalAfterDiscount: pricing.discountedSubtotalAmount,
          shippingAmount: pricing.shippingAmount,
          ...(pricing.coupon
            ? {
                coupon: pricing.coupon.id,
                couponCode: pricing.coupon.code,
                couponDiscountPercent: pricing.coupon.discountPercent,
                couponDiscountAmount: pricing.discountAmount,
                couponMinimumSubtotal: pricing.coupon.minimumSubtotal,
              }
            : {}),
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
      const couponID =
        txn.coupon && typeof txn.coupon === 'object' ? txn.coupon.id : txn.coupon

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
          ...(couponID ? { coupon: couponID } : {}),
          ...(txn.couponCode ? { couponCode: txn.couponCode } : {}),
          ...(typeof txn.couponDiscountPercent === 'number'
            ? { couponDiscountPercent: txn.couponDiscountPercent }
            : {}),
          ...(typeof txn.couponDiscountAmount === 'number'
            ? { couponDiscountAmount: txn.couponDiscountAmount }
            : {}),
          ...(typeof txn.couponMinimumSubtotal === 'number'
            ? { couponMinimumSubtotal: txn.couponMinimumSubtotal }
            : {}),
          ...(typeof txn.subtotalBeforeDiscount === 'number'
            ? { subtotalBeforeDiscount: txn.subtotalBeforeDiscount }
            : {}),
          ...(typeof txn.subtotalAfterDiscount === 'number'
            ? { subtotalAfterDiscount: txn.subtotalAfterDiscount }
            : {}),
          ...(typeof txn.shippingAmount === 'number' ? { shippingAmount: txn.shippingAmount } : {}),
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
