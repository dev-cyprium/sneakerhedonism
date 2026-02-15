import type { CollectionAfterChangeHook } from 'payload'

import {
  orderConfirmationCustomer,
  orderNotificationAdmin,
  shippingConfirmationCustomer,
  shippingNotificationAdmin,
} from '@/emails/templates'

type EmailLogEntry = {
  type: string
  to: string
  sentAt: string
  error?: string
}

export const sendOrderEmails: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const { payload } = req

  // Load email settings (overrideAccess: server hook needs to read settings for emails)
  let emailSettings: Record<string, any>
  try {
    emailSettings = await payload.findGlobal({
      slug: 'email-settings' as any,
      overrideAccess: true,
    })
  } catch {
    payload.logger.warn('Email settings not found — skipping order emails.')
    return doc
  }

  const storeName = emailSettings.storeName || 'Sneaker Hedonism'
  const fromEmail = emailSettings.fromEmail || 'info@mail.sneakerhedonism.com'
  const storeUrl =
    emailSettings.storeUrl || process.env.NEXT_PUBLIC_SERVER_URL || 'https://sneakerhedonism.com'
  const adminEmails: string[] = (emailSettings.adminEmails || [])
    .map((entry: { email?: string }) => entry?.email)
    .filter(Boolean)

  const existingLogs: EmailLogEntry[] = doc.emailsSent || []

  // Helper: check if email of this type was already sent
  const alreadySent = (type: string) => existingLogs.some((entry: EmailLogEntry) => entry.type === type)

  // Helper: send email and log result
  const sendAndLog = async (
    type: string,
    to: string,
    subject: string,
    html: string,
  ): Promise<EmailLogEntry> => {
    try {
      await payload.sendEmail({
        from: `${storeName} <${fromEmail}>`,
        to,
        subject,
        html,
      })
      return { type, to, sentAt: new Date().toISOString() }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      payload.logger.warn(`Failed to send ${type} email to ${to}: ${errorMsg}`)
      return { type, to, sentAt: new Date().toISOString(), error: errorMsg }
    }
  }

  // Resolve customer email
  const customerEmail: string | undefined =
    doc.customerEmail ||
    (typeof doc.customer === 'object' && doc.customer?.email) ||
    undefined

  // Build order data for templates. Use doc (and resolve relations by ID) so we
  // never re-fetch the order we just created, which can 404 inside the same create transaction.
  const buildOrderData = async () => {
    const order = doc as Record<string, any>
    const itemsRaw = order.items || []

    const items = await Promise.all(
      itemsRaw.map(async (item: Record<string, any>) => {
        const product =
          typeof item.product === 'object'
            ? item.product
            : item.product != null
              ? await payload
                  .findByID({
                    id: item.product,
                    collection: 'products',
                    depth: 0,
                    req,
                    overrideAccess: true,
                  })
                  .catch(() => null)
              : null
        const variant =
          typeof item.variant === 'object'
            ? item.variant
            : item.variant != null
              ? await payload
                  .findByID({
                    id: item.variant,
                    collection: 'variants',
                    depth: 0,
                    req,
                    overrideAccess: true,
                  })
                  .catch(() => null)
              : null

        return {
          productTitle: product?.title || `Proizvod #${item.product}`,
          variantLabel: variant?.title || (variant as Record<string, any>)?.label || undefined,
          quantity: item.quantity || 1,
          price:
            (variant as Record<string, any>)?.priceInRSD ??
            (product as Record<string, any>)?.priceInRSD ??
            0,
        }
      }),
    )

    // Determine payment method from linked transaction
    let paymentMethod: string | undefined
    const txnRef = Array.isArray(order.transactions) ? order.transactions[0] : undefined
    if (txnRef != null) {
      const txn =
        typeof txnRef === 'object'
          ? txnRef
          : await payload
              .findByID({
                id: txnRef,
                collection: 'transactions',
                depth: 0,
                req,
                overrideAccess: true,
              })
              .catch(() => null)
      paymentMethod = (txn as Record<string, any>)?.paymentMethod
    }

    const addr = order.shippingAddress
    const customerName =
      addr && typeof addr === 'object'
        ? [addr.firstName, addr.lastName].filter(Boolean).join(' ')
        : undefined

    return {
      orderId: doc.id,
      orderDate: doc.createdAt,
      items,
      total: doc.amount || 0,
      currency: doc.currency || 'RSD',
      shippingAddress: order.shippingAddress,
      customerName,
      customerEmail,
      paymentMethod,
      storeUrl,
      storeName,
    }
  }

  const newLogs: EmailLogEntry[] = []

  // ── Trigger 1: Order Created ──
  if (operation === 'create') {
    const orderData = await buildOrderData()

    // Send customer confirmation
    if (customerEmail && !alreadySent('orderConfirmationCustomer')) {
      const html = orderConfirmationCustomer(orderData)
      const log = await sendAndLog(
        'orderConfirmationCustomer',
        customerEmail,
        `Potvrda porudžbine #${doc.id} — ${storeName}`,
        html,
      )
      newLogs.push(log)
    }

    // Send admin notification
    if (adminEmails.length > 0 && !alreadySent('orderNotificationAdmin')) {
      const html = orderNotificationAdmin(orderData)
      for (const adminEmail of adminEmails) {
        const log = await sendAndLog(
          'orderNotificationAdmin',
          adminEmail,
          `Nova porudžbina #${doc.id}`,
          html,
        )
        newLogs.push(log)
      }
    } else if (adminEmails.length === 0) {
      payload.logger.warn('No admin emails configured — skipping admin order notification.')
    }
  }

  // ── Trigger 2: Status Changed to Shipped ──
  if (
    operation === 'update' &&
    doc.orderStatus === 'shipped' &&
    previousDoc.orderStatus !== 'shipped'
  ) {
    if (!doc.trackingCode) {
      payload.logger.warn(
        `Order #${doc.id} marked as shipped without tracking code — shipping emails skipped.`,
      )
    } else {
      const orderData = await buildOrderData()

      // Build tracking URL
      let trackingUrl: string | undefined
      const carrierName = doc.carrier || undefined

      if (carrierName && emailSettings.carriers?.length) {
        const match = emailSettings.carriers.find(
          (c: { name?: string; trackingUrlTemplate?: string }) =>
            c.name?.toLowerCase() === carrierName.toLowerCase(),
        )
        if (match?.trackingUrlTemplate) {
          trackingUrl = match.trackingUrlTemplate.replace('{{trackingCode}}', doc.trackingCode)
        }
      }
      if (!trackingUrl && emailSettings.trackingUrlTemplate) {
        trackingUrl = emailSettings.trackingUrlTemplate.replace(
          '{{trackingCode}}',
          doc.trackingCode,
        )
      }

      const shippingData = {
        ...orderData,
        trackingCode: doc.trackingCode,
        trackingUrl,
        carrierName,
      }

      // Send customer shipping confirmation (WITH tracking)
      if (customerEmail && !alreadySent('shippingConfirmationCustomer')) {
        const html = shippingConfirmationCustomer(shippingData)
        const log = await sendAndLog(
          'shippingConfirmationCustomer',
          customerEmail,
          `Vaša porudžbina #${doc.id} je poslata — ${storeName}`,
          html,
        )
        newLogs.push(log)
      }

      // Send admin shipping notification (WITHOUT tracking code)
      if (adminEmails.length > 0 && !alreadySent('shippingNotificationAdmin')) {
        const html = shippingNotificationAdmin(shippingData)
        for (const adminEmail of adminEmails) {
          const log = await sendAndLog(
            'shippingNotificationAdmin',
            adminEmail,
            `Porudžbina #${doc.id} je poslata`,
            html,
          )
          newLogs.push(log)
        }
      }
    }
  }

  // Persist email logs
  if (newLogs.length > 0) {
    try {
      await payload.update({
        id: doc.id,
        collection: 'orders',
        data: {
          emailsSent: [...existingLogs, ...newLogs],
        } as any,
        req,
        overrideAccess: true,
      })
    } catch (err) {
      payload.logger.warn(
        `Failed to update emailsSent log for order #${doc.id}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  return doc
}
