/**
 * One-time script: mark existing migrations as run so `payload migrate` succeeds
 * when the database was created with dev push (schema already exists).
 *
 * Run: pnpm exec tsx scripts/mark-migrations-run.mts
 * (Ensure .env has PAYLOAD_SECRET and DATABASE_URL.)
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const MIGRATION_NAMES = [
  '20260211_015545_rename_linkType_to_navType',
  '20260215_121709',
] as const

async function main() {
  const payload = await getPayload({ config })
  const { docs: existing } = await payload.find({
    collection: 'payload-migrations',
    where: { batch: { not_equals: -1 } },
    limit: 100,
    sort: '-batch',
  })
  const existingNames = new Set((existing ?? []).map((d: { name: string }) => d.name))
  const latestBatch = existing?.length ? Number(existing[0]?.batch) || 0 : 0
  let nextBatch = latestBatch
  for (const name of MIGRATION_NAMES) {
    if (existingNames.has(name)) {
      console.log(`Migration already recorded: ${name}`)
      continue
    }
    nextBatch += 1
    await payload.create({
      collection: 'payload-migrations',
      data: { name, batch: nextBatch },
    })
    console.log(`Recorded migration: ${name} (batch ${nextBatch})`)
  }
  await payload.db.destroy()
  console.log('Done. You can now run: npx payload migrate')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
