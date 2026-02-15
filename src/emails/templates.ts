type OrderItem = {
  productTitle: string
  variantLabel?: string
  quantity: number
  price: number
}

type OrderData = {
  orderId: number
  orderDate: string
  items: OrderItem[]
  total: number
  currency: string
  shippingAddress?: {
    firstName?: string | null
    lastName?: string | null
    addressLine1?: string | null
    addressLine2?: string | null
    city?: string | null
    postalCode?: string | null
    country?: string | null
    phone?: string | null
  }
  customerName?: string
  customerEmail?: string
  paymentMethod?: string
  storeUrl?: string
  storeName?: string
}

type ShippingData = OrderData & {
  trackingCode?: string
  trackingUrl?: string
  carrierName?: string
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('sr-RS') + ' RSD'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatAddress(addr: OrderData['shippingAddress']): string {
  if (!addr) return ''
  const parts = [
    [addr.firstName, addr.lastName].filter(Boolean).join(' '),
    addr.addressLine1,
    addr.addressLine2,
    [addr.postalCode, addr.city].filter(Boolean).join(' '),
    addr.country,
    addr.phone ? `Tel: ${addr.phone}` : null,
  ].filter(Boolean)
  return parts.join('<br>')
}

function itemsTable(items: OrderItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:14px;">
          ${item.productTitle}${item.variantLabel ? `<br><span style="color:#666;font-size:12px;">${item.variantLabel}</span>` : ''}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-family:Arial,sans-serif;font-size:14px;">
          ${item.quantity}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-family:Arial,sans-serif;font-size:14px;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>`,
    )
    .join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px 12px;text-align:left;font-family:Arial,sans-serif;font-size:13px;color:#666;">Proizvod</th>
          <th style="padding:8px 12px;text-align:center;font-family:Arial,sans-serif;font-size:13px;color:#666;">Kol.</th>
          <th style="padding:8px 12px;text-align:right;font-family:Arial,sans-serif;font-size:13px;color:#666;">Cena</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`
}

function baseLayout(content: string, storeName: string = 'Sneaker Hedonism'): string {
  return `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${storeName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:24px;text-align:center;">
              <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;font-family:Arial,sans-serif;">${storeName.toUpperCase()}</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px 24px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 24px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#999;font-family:Arial,sans-serif;">
                ${storeName} | info@sneakerhedonism.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function orderConfirmationCustomer(data: OrderData): string {
  const paymentLabel =
    data.paymentMethod === 'cod' ? 'Plaćanje pouzećem' : 'Plaćanje karticom'

  const content = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#000;font-family:Arial,sans-serif;">
      Hvala Vam na porudžbini!
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#333;line-height:1.5;font-family:Arial,sans-serif;">
      Vaša porudžbina <strong>#${data.orderId}</strong> je uspešno primljena.
      Obavestićemo Vas kada bude poslata.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-size:13px;color:#666;font-family:Arial,sans-serif;padding:4px 0;">Datum:</td>
        <td style="font-size:14px;color:#333;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">${formatDate(data.orderDate)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#666;font-family:Arial,sans-serif;padding:4px 0;">Način plaćanja:</td>
        <td style="font-size:14px;color:#333;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">${paymentLabel}</td>
      </tr>
    </table>

    ${itemsTable(data.items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="padding:12px;font-size:16px;font-weight:bold;font-family:Arial,sans-serif;text-align:right;border-top:2px solid #000;">
          Ukupno: ${formatCurrency(data.total)}
        </td>
      </tr>
    </table>

    ${
      data.shippingAddress
        ? `
    <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:4px;">
      <p style="margin:0 0 8px;font-size:13px;color:#666;font-weight:bold;font-family:Arial,sans-serif;">ADRESA ZA DOSTAVU</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;font-family:Arial,sans-serif;">
        ${formatAddress(data.shippingAddress)}
      </p>
    </div>`
        : ''
    }
  `

  return baseLayout(content, data.storeName)
}

export function orderNotificationAdmin(data: OrderData): string {
  const content = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#000;font-family:Arial,sans-serif;">
      Nova porudžbina #${data.orderId}
    </h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-size:13px;color:#666;font-family:Arial,sans-serif;padding:4px 0;">Kupac:</td>
        <td style="font-size:14px;color:#333;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">
          ${data.customerName || '—'}
        </td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#666;font-family:Arial,sans-serif;padding:4px 0;">Email:</td>
        <td style="font-size:14px;color:#333;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">
          ${data.customerEmail || '—'}
        </td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#666;font-family:Arial,sans-serif;padding:4px 0;">Datum:</td>
        <td style="font-size:14px;color:#333;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">
          ${formatDate(data.orderDate)}
        </td>
      </tr>
    </table>

    ${itemsTable(data.items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="padding:12px;font-size:16px;font-weight:bold;font-family:Arial,sans-serif;text-align:right;border-top:2px solid #000;">
          Ukupno: ${formatCurrency(data.total)}
        </td>
      </tr>
    </table>

    ${
      data.shippingAddress
        ? `
    <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:4px;">
      <p style="margin:0 0 8px;font-size:13px;color:#666;font-weight:bold;font-family:Arial,sans-serif;">ADRESA ZA DOSTAVU</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;font-family:Arial,sans-serif;">
        ${formatAddress(data.shippingAddress)}
      </p>
    </div>`
        : ''
    }

    <div style="margin-top:24px;text-align:center;">
      <a href="${data.storeUrl}/admin/collections/orders/${data.orderId}"
         style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:4px;font-size:14px;font-family:Arial,sans-serif;">
        Pogledaj porudžbinu
      </a>
    </div>
  `

  return baseLayout(content, data.storeName)
}

export function shippingConfirmationCustomer(data: ShippingData): string {
  const content = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#000;font-family:Arial,sans-serif;">
      Vaša porudžbina je poslata!
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#333;line-height:1.5;font-family:Arial,sans-serif;">
      Porudžbina <strong>#${data.orderId}</strong> je poslata${data.carrierName ? ` putem <strong>${data.carrierName}</strong>` : ''}.
    </p>

    ${
      data.trackingCode
        ? `
    <div style="margin-bottom:24px;padding:20px;background:#f0f7ff;border-radius:4px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#666;font-family:Arial,sans-serif;">BROJ ZA PRAĆENJE</p>
      <p style="margin:0 0 16px;font-size:18px;font-weight:bold;color:#000;font-family:Arial,sans-serif;letter-spacing:1px;">
        ${data.trackingCode}
      </p>
      ${
        data.trackingUrl
          ? `
      <a href="${data.trackingUrl}"
         style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:4px;font-size:14px;font-family:Arial,sans-serif;">
        Pratite pošiljku
      </a>`
          : ''
      }
    </div>`
        : ''
    }

    ${itemsTable(data.items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="padding:12px;font-size:16px;font-weight:bold;font-family:Arial,sans-serif;text-align:right;border-top:2px solid #000;">
          Ukupno: ${formatCurrency(data.total)}
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#666;line-height:1.5;font-family:Arial,sans-serif;">
      Za sva pitanja kontaktirajte nas na info@sneakerhedonism.com
    </p>
  `

  return baseLayout(content, data.storeName)
}

export function shippingNotificationAdmin(data: ShippingData): string {
  const content = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#000;font-family:Arial,sans-serif;">
      Porudžbina #${data.orderId} je poslata
    </h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-size:13px;color:#666;font-family:Arial,sans-serif;padding:4px 0;">Kupac:</td>
        <td style="font-size:14px;color:#333;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">
          ${data.customerName || '—'}
        </td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#666;font-family:Arial,sans-serif;padding:4px 0;">Email:</td>
        <td style="font-size:14px;color:#333;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">
          ${data.customerEmail || '—'}
        </td>
      </tr>
      ${
        data.carrierName
          ? `
      <tr>
        <td style="font-size:13px;color:#666;font-family:Arial,sans-serif;padding:4px 0;">Kurir:</td>
        <td style="font-size:14px;color:#333;font-family:Arial,sans-serif;padding:4px 0;text-align:right;">
          ${data.carrierName}
        </td>
      </tr>`
          : ''
      }
    </table>

    <div style="margin-top:24px;text-align:center;">
      <a href="${data.storeUrl}/admin/collections/orders/${data.orderId}"
         style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:4px;font-size:14px;font-family:Arial,sans-serif;">
        Pogledaj porudžbinu
      </a>
    </div>
  `

  return baseLayout(content, data.storeName)
}
