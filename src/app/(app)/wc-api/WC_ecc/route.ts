import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getServerSideURL } from '@/utilities/getURL'
import { buildVerificationData, getPublicKey, verifyResponse } from '@/payments/ecc/crypto'

export async function POST(request: Request) {
  const payload = await getPayload({ config })

  try {
    const formData = await request.formData()

    const merchantId = formData.get('MerchantID') as string
    const terminalId = formData.get('TerminalID') as string
    const orderId = formData.get('OrderID') as string
    const currency = formData.get('Currency') as string
    const totalAmount = formData.get('TotalAmount') as string
    const xid = formData.get('XID') as string
    const purchaseTime = formData.get('PurchaseTime') as string
    const approvalCode = formData.get('ApprovalCode') as string
    const sd = formData.get('SD') as string
    const tranCode = formData.get('TranCode') as string
    const signature = formData.get('Signature') as string
    const proxyPan = formData.get('ProxyPan') as string
    const rrn = formData.get('Rrn') as string

    // Look up transaction by OrderID (= our transaction ID)
    const transactionId = Number(orderId)
    const transaction = await payload.findByID({
      id: transactionId,
      collection: 'transactions',
      depth: 0,
    })

    if (!transaction) {
      return new NextResponse('Transaction not found', { status: 404 })
    }

    const serverUrl = getServerSideURL()
    const eccData = { tranCode, approvalCode, proxyPan, rrn, xid }

    if (tranCode === '000') {
      // Optionally verify bank signature
      const publicKey = getPublicKey()
      if (publicKey && signature) {
        const verifyData = buildVerificationData({
          merchantId,
          terminalId,
          purchaseTime,
          orderId,
          xid,
          currency,
          totalAmount,
          tranCode,
          approvalCode,
        })

        const isValid = verifyResponse(verifyData, signature, publicKey)
        if (!isValid) {
          payload.logger.warn(`ECC: Invalid signature for transaction ${orderId}`)
        }
      }

      // Create order
      const txn = transaction as Record<string, any>

      const order = await payload.create({
        collection: 'orders',
        data: {
          amount: txn.amount,
          currency: txn.currency,
          ...(txn.customer ? { customer: txn.customer } : { customerEmail: txn.customerEmail }),
          items: txn.items,
          status: 'processing',
          orderStatus: 'processing',
          transactions: [transaction.id],
        },
      })

      const cartID = txn.cart
      if (cartID) {
        await payload.update({
          id: typeof cartID === 'object' ? cartID.id : cartID,
          collection: 'carts',
          data: {
            purchasedAt: new Date().toISOString(),
          },
        })
      }

      await payload.update({
        id: transaction.id,
        collection: 'transactions',
        data: {
          order: order.id,
          status: 'succeeded',
          ecc: eccData,
        } as any,
      })

      const forwardUrl = `${serverUrl}/orders/${order.id}`

      const responseText = [
        `MerchantID=${merchantId}`,
        `TerminalID=${terminalId}`,
        `OrderID=${orderId}`,
        `Currency=${currency}`,
        `TotalAmount=${totalAmount}`,
        `XID=${xid}`,
        `PurchaseTime=${purchaseTime}`,
        `ApprovalCode=${approvalCode}`,
        `SD=${sd}`,
        `TranCode=${tranCode}`,
        `Response.action=approve`,
        `Response.reason=ok`,
        `Response.forwardUrl=${forwardUrl}`,
      ].join('\n')

      return new NextResponse(responseText, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      })
    } else {
      // Payment failed
      await payload.update({
        id: transaction.id,
        collection: 'transactions',
        data: {
          status: 'failed',
          ecc: eccData,
        } as any,
      })

      const forwardUrl = `${serverUrl}/checkout?error=payment_failed`

      const responseText = [
        `MerchantID=${merchantId}`,
        `TerminalID=${terminalId}`,
        `OrderID=${orderId}`,
        `Currency=${currency}`,
        `TotalAmount=${totalAmount}`,
        `XID=${xid}`,
        `PurchaseTime=${purchaseTime}`,
        `ApprovalCode=${approvalCode}`,
        `SD=${sd}`,
        `TranCode=${tranCode}`,
        `Response.action=reverse`,
        `Response.reason=failed`,
        `Response.forwardUrl=${forwardUrl}`,
      ].join('\n')

      return new NextResponse(responseText, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      })
    }
  } catch (err) {
    payload.logger.error(`ECC callback error: ${err instanceof Error ? err.message : String(err)}`)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
