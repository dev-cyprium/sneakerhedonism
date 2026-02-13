import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { defaultCountries } from '@payloadcms/plugin-ecommerce/client/react'

import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'
import { codAdapter } from '@/payments/cod-adapter'

import { Page, Post, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { ProductsCollection } from '@/collections/Products'
import { VariantsCollection } from '@/collections/Variants'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'

const generateTitle: GenerateTitle<Product | Page | Post> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Sneaker Hedonism` : 'Sneaker Hedonism'
}

const generateURL: GenerateURL<Product | Page | Post> = ({ doc, collectionSlug }) => {
  const url = getServerSideURL()

  if (!doc?.slug) return url

  if (collectionSlug === 'posts') return `${url}/blog/${doc.slug}`

  return `${url}/${doc.slug}`
}

export const plugins: Plugin[] = [
  s3Storage({
    collections: {
      media: {
        prefix: 'media',
      },
    },
    bucket: process.env.R2_BUCKET!,
    config: {
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      endpoint: process.env.R2_ENDPOINT!,
      region: 'auto',
      forcePathStyle: true,
    },
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        const placeholderField = {
          name: 'placeholder',
          type: 'text' as const,
          label: 'Placeholder',
        }
        const blocksWithPlaceholder = ['text', 'email', 'textarea']

        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          // Add placeholder field to text, email, and textarea blocks
          if ('name' in field && field.name === 'fields' && field.type === 'blocks') {
            return {
              ...field,
              blocks: field.blocks.map((block) => {
                if (blocksWithPlaceholder.includes(block.slug)) {
                  return {
                    ...block,
                    fields: [...block.fields, placeholderField],
                  }
                }
                return block
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    currencies: {
      defaultCurrency: 'RSD',
      supportedCurrencies: [
        {
          code: 'RSD',
          decimals: 0,
          label: 'Serbian Dinar',
          symbol: ' RSD',
        },
      ],
    },
    addresses: {
      supportedCountries: [
        { label: 'Serbia', value: 'RS' },
        ...defaultCountries,
      ],
    },
    customers: {
      slug: 'users',
    },
    payments: {
      paymentMethods: [
        codAdapter(),
        stripeAdapter({
          secretKey: process.env.STRIPE_SECRET_KEY!,
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
        }),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantsCollectionOverride: VariantsCollection,
        variantOptionsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          admin: {
            ...defaultCollection?.admin,
            hidden: true,
            description:
              'Managed via Variant Groups. Add options when editing a variant type (e.g. BROJ, VELICINE).',
          },
        }),
        variantTypesCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          admin: {
            ...defaultCollection?.admin,
            group: 'Ecommerce',
            useAsTitle: 'label',
            description: 'Variant groups (e.g. BROJ, VELICINE). Add options for each group when editing.',
          },
          labels: {
            plural: 'Variant Groups',
            singular: 'Variant Group',
          },
        }),
      },
    },
  }),
]
