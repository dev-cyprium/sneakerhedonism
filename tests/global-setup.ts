import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import {
  ADMIN_USER,
  CUSTOMER_USER,
  SIMPLE_PRODUCT,
  VARIANT_PRODUCT,
  NO_INVENTORY_PRODUCT,
  VARIANT_TYPE,
  VARIANT_OPTIONS,
  TEST_ADDRESS,
} from './helpers/constants'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function globalSetup() {
  process.env.PAYLOAD_MIGRATING = 'true'
  const payload = await getPayload({ config })

  // Running outside Next.js — disable revalidatePath hooks
  const ctx = { disableRevalidate: true }

  // ─── Cleanup ──────────────────────────────────────────────────

  // Delete products by known slugs (includes runtime-created ones)
  const productSlugs = [
    SIMPLE_PRODUCT.slug,
    VARIANT_PRODUCT.slug,
    NO_INVENTORY_PRODUCT.slug,
    'new-product-with-variants', // created by admin create-product test
  ]
  for (const slug of productSlugs) {
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      overrideAccess: true,
      limit: 10,
    })
    for (const doc of existing.docs) {
      await payload
        .delete({
          collection: 'variants',
          where: { product: { equals: doc.id } },
          overrideAccess: true,
          context: ctx,
        })
        .catch(() => {})
      await payload
        .delete({ collection: 'products', id: doc.id, overrideAccess: true, context: ctx })
        .catch(() => {})
    }
  }

  // Delete variant options and types
  await payload
    .delete({
      collection: 'variantOptions',
      where: { value: { in: [VARIANT_OPTIONS.alpha.value, VARIANT_OPTIONS.beta.value] } },
      overrideAccess: true,
      context: ctx,
    })
    .catch(() => {})
  await payload
    .delete({
      collection: 'variantTypes',
      where: { name: { equals: VARIANT_TYPE.name } },
      overrideAccess: true,
      context: ctx,
    })
    .catch(() => {})

  // Clean up variant type/options created by admin create-product test
  await payload
    .delete({
      collection: 'variantOptions',
      where: { value: { equals: 'striped' } },
      overrideAccess: true,
      context: ctx,
    })
    .catch(() => {})
  await payload
    .delete({
      collection: 'variantTypes',
      where: { name: { equals: 'Pattern' } },
      overrideAccess: true,
      context: ctx,
    })
    .catch(() => {})

  // Delete test users and their associated data
  const testEmails = [ADMIN_USER.email, CUSTOMER_USER.email, 'guest@test.com', 'dev@payloadcms.com']
  for (const email of testEmails) {
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      overrideAccess: true,
      limit: 1,
    })
    for (const user of users.docs) {
      await payload
        .delete({
          collection: 'addresses',
          where: { customer: { equals: user.id } },
          overrideAccess: true,
          context: ctx,
        })
        .catch(() => {})
      await payload
        .delete({
          collection: 'carts',
          where: { customer: { equals: user.id } },
          overrideAccess: true,
          context: ctx,
        })
        .catch(() => {})
    }
  }
  await payload
    .delete({
      collection: 'users',
      where: { email: { in: testEmails } },
      overrideAccess: true,
      context: ctx,
    })
    .catch(() => {})

  // Clean up signup test users (email pattern: test-*@test.com)
  const signupUsers = await payload.find({
    collection: 'users',
    where: { email: { like: 'test-%@test.com' } },
    overrideAccess: true,
    limit: 100,
  })
  for (const user of signupUsers.docs) {
    await payload
      .delete({ collection: 'users', id: user.id, overrideAccess: true, context: ctx })
      .catch(() => {})
  }

  // Delete old test media
  await payload
    .delete({
      collection: 'media',
      where: { alt: { equals: 'E2E Test Image' } },
      overrideAccess: true,
      context: ctx,
    })
    .catch(() => {})

  // ─── Create users ─────────────────────────────────────────────

  const adminUser = await payload.create({
    collection: 'users',
    data: {
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      roles: ['admin'],
    },
    overrideAccess: true,
    context: ctx,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: CUSTOMER_USER.email,
      password: CUSTOMER_USER.password,
      roles: ['customer'],
    },
    overrideAccess: true,
    context: ctx,
  })

  // ─── Upload media ─────────────────────────────────────────────

  const imagePath = path.resolve(__dirname, '../src/endpoints/seed/tshirt-black.png')
  const imageBuffer = fs.readFileSync(imagePath)
  const imageStats = fs.statSync(imagePath)

  const media = await payload.create({
    collection: 'media',
    data: { alt: 'E2E Test Image' },
    file: {
      name: 'e2e-tshirt-black.png',
      data: imageBuffer,
      mimetype: 'image/png',
      size: imageStats.size,
    },
    overrideAccess: true,
    context: ctx,
  })

  // ─── Create variant type and options ──────────────────────────

  const variantType = await payload.create({
    collection: 'variantTypes',
    data: {
      name: VARIANT_TYPE.name,
      label: VARIANT_TYPE.label,
    },
    overrideAccess: true,
    context: ctx,
  })

  const alphaOption = await payload.create({
    collection: 'variantOptions',
    data: {
      ...VARIANT_OPTIONS.alpha,
      variantType: variantType.id,
    },
    overrideAccess: true,
    context: ctx,
  })

  const betaOption = await payload.create({
    collection: 'variantOptions',
    data: {
      ...VARIANT_OPTIONS.beta,
      variantType: variantType.id,
    },
    overrideAccess: true,
    context: ctx,
  })

  // ─── Create products ──────────────────────────────────────────

  // Simple product
  await payload.create({
    collection: 'products',
    data: {
      title: SIMPLE_PRODUCT.title,
      slug: SIMPLE_PRODUCT.slug,
      inventory: SIMPLE_PRODUCT.inventory,
      priceInRSDEnabled: true,
      priceInRSD: SIMPLE_PRODUCT.priceInRSD,
      _status: 'published',
      layout: [],
      gallery: [{ image: media.id }],
    },
    overrideAccess: true,
    context: ctx,
  })

  // Variant product
  const variantProduct = await payload.create({
    collection: 'products',
    data: {
      title: VARIANT_PRODUCT.title,
      slug: VARIANT_PRODUCT.slug,
      enableVariants: true,
      variantTypes: [variantType.id],
      inventory: 100,
      _status: 'published',
      layout: [],
      gallery: [{ image: media.id }],
    },
    overrideAccess: true,
    context: ctx,
  })

  await payload.create({
    collection: 'variants',
    data: {
      product: variantProduct.id,
      options: [alphaOption.id],
      priceInRSDEnabled: true,
      priceInRSD: VARIANT_PRODUCT.priceInRSD,
      inventory: 50,
      _status: 'published',
    },
    overrideAccess: true,
    context: ctx,
  })

  await payload.create({
    collection: 'variants',
    data: {
      product: variantProduct.id,
      options: [betaOption.id],
      priceInRSDEnabled: true,
      priceInRSD: VARIANT_PRODUCT.priceInRSD,
      inventory: 50,
      _status: 'published',
    },
    overrideAccess: true,
    context: ctx,
  })

  // No inventory product
  await payload.create({
    collection: 'products',
    data: {
      title: NO_INVENTORY_PRODUCT.title,
      slug: NO_INVENTORY_PRODUCT.slug,
      inventory: NO_INVENTORY_PRODUCT.inventory,
      priceInRSDEnabled: true,
      priceInRSD: 1000,
      _status: 'published',
      layout: [],
      gallery: [{ image: media.id }],
    },
    overrideAccess: true,
    context: ctx,
  })

  // ─── Create address for admin user ────────────────────────────

  await payload.create({
    collection: 'addresses',
    data: {
      ...TEST_ADDRESS,
      customer: adminUser.id,
    },
    overrideAccess: true,
    context: ctx,
  })
}
