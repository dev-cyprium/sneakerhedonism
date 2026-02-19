import crypto from 'crypto'

/**
 * Normalize a PEM string: handles escaped newlines, Windows line endings,
 * extra whitespace from multi-line .env values, and re-wraps base64 at 64 chars.
 */
function normalizePem(raw: string): string {
  const cleaned = raw.replace(/\\n/g, '\n')
  const match = cleaned.match(/-----BEGIN ([A-Z ]+)-----([^-]+)-----END \1-----/)
  if (!match) {
    throw new Error('Invalid PEM format')
  }
  const type = match[1]
  const base64 = match[2].replace(/\s/g, '')
  const lines = base64.match(/.{1,64}/g) || []
  return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----\n`
}

/**
 * Sign outgoing request data with SHA1withRSA, return base64 signature.
 */
export function signRequest(data: string, privateKeyPem: string): string {
  const signature = crypto.sign('sha1', Buffer.from(data), privateKeyPem)
  return signature.toString('base64')
}

/**
 * Verify incoming response signature with SHA1withRSA.
 */
export function verifyResponse(data: string, signature: string, publicKeyPem: string): boolean {
  return crypto.verify('sha1', Buffer.from(data), publicKeyPem, Buffer.from(signature, 'base64'))
}

/**
 * Format current time as YYMMDDHHmmss (2-digit year).
 */
export function formatPurchaseTime(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2)
  const MM = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const HH = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yy}${MM}${dd}${HH}${mm}${ss}`
}

/**
 * Build the data string for signing outgoing requests.
 * Format: {merchantId};{terminalId};{purchaseTime};{orderId},{delay};{currency},{altCurrency};{totalAmount},{altTotalAmount};{sd};
 */
export function buildOutgoingSignData(params: {
  merchantId: string
  terminalId: string
  purchaseTime: string
  orderId: string
  delay: string
  currency: string
  totalAmount: string
  sd: string
}): string {
  const { merchantId, terminalId, purchaseTime, orderId, delay, currency, totalAmount, sd } =
    params
  return `${merchantId};${terminalId};${purchaseTime};${orderId},${delay};${currency},${currency};${totalAmount},${totalAmount};${sd};`
}

/**
 * Build the data string for verifying incoming bank response signatures.
 * Format: {merchantId};{terminalId};{purchaseTime};{orderId};{xid};{currency};{totalAmount};;{tranCode};{approvalCode};
 * Note: double semicolons where SD would be.
 */
export function buildVerificationData(params: {
  merchantId: string
  terminalId: string
  purchaseTime: string
  orderId: string
  xid: string
  currency: string
  totalAmount: string
  tranCode: string
  approvalCode: string
}): string {
  const { merchantId, terminalId, purchaseTime, orderId, xid, currency, totalAmount, tranCode, approvalCode } = params
  return `${merchantId};${terminalId};${purchaseTime};${orderId};${xid};${currency};${totalAmount};;${tranCode};${approvalCode};`
}

/**
 * Read private key PEM from environment variable.
 */
export function getPrivateKey(): string {
  const key = process.env.ECC_PRIVATE_KEY
  if (!key) {
    throw new Error('ECC_PRIVATE_KEY environment variable is not set.')
  }
  return normalizePem(key)
}

/**
 * Read public key PEM from environment variable.
 * Returns null if not configured (verification is optional).
 */
export function getPublicKey(): string | null {
  const key = process.env.ECC_PUBLIC_KEY
  if (!key) return null
  return normalizePem(key)
}
