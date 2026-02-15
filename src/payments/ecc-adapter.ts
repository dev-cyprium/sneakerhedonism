import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { CollectionSlug } from 'payload'

import {
  buildOutgoingSignData,
  formatPurchaseTime,
  getPrivateKey,
  signRequest,
} from './ecc/crypto'

export const eccAdapter = (): PaymentAdapter => {
  return {
    name: 'ecc',
    label: 'Card Payment (ECC)',
    group: {
      name: 'ecc',
      type: 'group',
      admin: {
        condition: (data) => data?.paymentMethod === 'ecc',
      },
      fields: [
        {
          name: 'tranCode',
          type: 'text',
          label: 'Transaction Code',
        },
        {
          name: 'approvalCode',
          type: 'text',
          label: 'Approval Code',
        },
        {
          name: 'proxyPan',
          type: 'text',
          label: 'Masked Card Number',
        },
        {
          name: 'rrn',
          type: 'text',
          label: 'RRN',
        },
        {
          name: 'xid',
          type: 'text',
          label: 'XID',
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

      // Calculate amount from cart items
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

      // Fetch ECC settings from CMS
      const eccSettings = await payload.findGlobal({
        slug: 'ecc-settings' as any,
      }) as Record<string, any>

      const { merchantId, terminalId, currency: eccCurrency, delay, gatewayUrl, locale } =
        eccSettings

      if (!merchantId || !terminalId || !gatewayUrl) {
        throw new Error('ECC payment gateway is not configured. Please set up ECC Settings in the admin panel.')
      }

      // Create pending transaction
      const transaction = await payload.create({
        collection: transactionsSlug as CollectionSlug,
        data: {
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          amount,
          billingAddress,
          cart: cart.id,
          currency: currency.toUpperCase() as 'RSD',
          items: flattenedCart,
          paymentMethod: 'ecc' as const,
          status: 'pending' as const,
        },
      })

      // Build bank form fields
      const purchaseTime = formatPurchaseTime()
      const orderId = String(transaction.id)
      const bankAmount = String(amount * 100) // Convert to smallest unit (paras)
      const sd = 'aa'

      // Build product description (first 20 chars)
      const productNames = cart.items
        .map((item) => {
          if (typeof item.product === 'object' && item.product) {
            return (item.product as Record<string, any>).title || ''
          }
          return ''
        })
        .filter(Boolean)
        .join(', ')
      const purchaseDesc = productNames.slice(0, 20)

      // Sign the request
      const signData = buildOutgoingSignData({
        merchantId,
        terminalId,
        purchaseTime,
        orderId,
        delay: delay || '1',
        currency: eccCurrency || '941',
        totalAmount: bankAmount,
        sd,
      })

      const privateKey = getPrivateKey()
      const signature = signRequest(signData, privateKey)

      return {
        message: 'ECC payment initiated',
        transactionID: transaction.id,
        gatewayUrl,
        formFields: {
          Version: '1',
          MerchantID: merchantId,
          TerminalID: terminalId,
          TotalAmount: bankAmount,
          AltTotalAmount: bankAmount,
          Currency: eccCurrency || '941',
          AltCurrency: eccCurrency || '941',
          locale: locale || 'sr',
          SD: sd,
          OrderID: orderId,
          Delay: delay || '1',
          PurchaseTime: purchaseTime,
          PurchaseDesc: purchaseDesc,
          Signature: signature,
        },
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
          ...(txn.customer ? { customer: txn.customer } : { customerEmail: customerEmail || txn.customerEmail }),
          items: txn.items,
          ...(data.shippingAddress ? { shippingAddress: data.shippingAddress } : {}),
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

      // Update transaction with ECC-specific data if provided
      const updateData: Record<string, any> = {
        order: order.id,
        status: 'succeeded',
      }

      if (data.eccData) {
        updateData.ecc = data.eccData
      }

      await payload.update({
        id: transaction.id,
        collection: transactionsSlug as CollectionSlug,
        data: updateData as any,
      })

      return {
        message: 'Card payment processed successfully.',
        orderID: order.id,
        transactionID: transaction.id,
      }
    },
  }
}
