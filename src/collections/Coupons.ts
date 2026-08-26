import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { checkRole } from '@/access/utilities'

const normalizeCouponCode = (value: unknown): string => {
  if (typeof value !== 'string') return ''

  return value.trim().toUpperCase()
}

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  access: {
    admin: ({ req: { user } }) => Boolean(user && checkRole(['admin'], user)),
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'Ecommerce',
    useAsTitle: 'code',
    defaultColumns: [
      'code',
      'discountPercent',
      'appliesTo',
      'minimumSubtotal',
      'expiresAt',
      'unlimitedUsage',
      'usageLimit',
      'active',
    ],
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        if (typeof data.code === 'string') {
          data.code = normalizeCouponCode(data.code)
        }

        if (data.unlimitedUsage === true) {
          data.usageLimit = null
        }

        // A cart-wide coupon must not keep a stale category list around: it
        // would look scoped in the admin while discounting everything.
        if (data.appliesTo !== 'categories') {
          data.categories = []
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Coupon code customers enter at checkout (stored uppercase).',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'discountPercent',
      type: 'number',
      min: 1,
      max: 100,
      required: true,
      admin: {
        description: 'Percentage discount applied to cart subtotal (1-100).',
      },
    },
    {
      name: 'appliesTo',
      type: 'select',
      defaultValue: 'all',
      required: true,
      options: [
        {
          label: 'Entire cart',
          value: 'all',
        },
        {
          label: 'Selected categories / brands only',
          value: 'categories',
        },
      ],
      admin: {
        description:
          'Whether the discount covers the whole cart or only items from certain categories.',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        condition: (data) => data?.appliesTo === 'categories',
        description:
          'Only items in these categories are discounted. Picking a top-level category (e.g. Odeća) also covers the brands under it.',
      },
      validate: (
        value: unknown,
        { data }: { data?: { appliesTo?: string } },
      ): string | true => {
        if (data?.appliesTo !== 'categories') return true

        if (!Array.isArray(value) || value.length === 0) {
          return 'Pick at least one category, or set "Applies to" back to the entire cart.'
        }

        return true
      },
    },
    {
      name: 'minimumSubtotal',
      type: 'number',
      min: 0,
      defaultValue: 0,
      required: true,
      admin: {
        description:
          'Minimum subtotal required to use this coupon. For a category coupon this is measured against the discounted items only.',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'Coupon cannot be used after this date/time.',
      },
    },
    {
      name: 'unlimitedUsage',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'If enabled, coupon can be redeemed unlimited times (guests cannot use these).',
      },
    },
    {
      name: 'usageLimit',
      type: 'number',
      min: 1,
      admin: {
        description: 'Maximum redemptions when unlimited usage is disabled.',
        condition: (data) => !data?.unlimitedUsage,
      },
      validate: (
        value: null | number | undefined,
        { data }: { data?: { unlimitedUsage?: boolean } },
      ) => {
        if (data?.unlimitedUsage) return true

        if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
          return 'Usage limit is required when unlimited usage is disabled.'
        }

        return true
      },
    },
    {
      name: 'orders',
      type: 'join',
      collection: 'orders',
      on: 'coupon',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'customer', 'customerEmail', 'createdAt', 'amount'],
      },
    },
  ],
}
