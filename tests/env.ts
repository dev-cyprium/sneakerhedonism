import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'

// Never inherit application credentials when running tests or their web server.
const env = parseEnv(readFileSync('test.env', 'utf8'))
if (!env.DATABASE_URL) throw new Error('Missing test database URL.')
const database = new URL(env.DATABASE_URL)
if (
  !['localhost', '127.0.0.1', '[::1]'].includes(database.hostname) ||
  !database.pathname.endsWith('_test')
) {
  throw new Error('Tests require a local database whose name ends in _test.')
}
Object.assign(process.env, env)
for (const key of Object.keys(process.env)) {
  if (/^(R2_|STRIPE_|NEXT_PUBLIC_STRIPE_|ECC_)/.test(key) || key === 'RESEND_API_KEY') {
    // Keep the key defined so a later dotenv load cannot restore a live credential.
    process.env[key] = ''
  }
}
