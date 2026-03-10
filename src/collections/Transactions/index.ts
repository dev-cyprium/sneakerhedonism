import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

export const TransactionsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  fields: [
    ...(defaultCollection.fields ?? []),
    {
      name: 'coupon',
      type: 'relationship',
      relationTo: 'coupons',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => Boolean(data?.coupon || data?.couponCode),
      },
    },
    {
      name: 'couponCode',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => Boolean(data?.couponCode),
      },
    },
    {
      name: 'couponDiscountPercent',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => Boolean(data?.couponCode),
      },
    },
    {
      name: 'couponDiscountAmount',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => Boolean(data?.couponCode),
      },
    },
    {
      name: 'couponMinimumSubtotal',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => Boolean(data?.couponCode),
      },
    },
    {
      name: 'subtotalBeforeDiscount',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => Boolean(data?.couponCode),
      },
    },
    {
      name: 'subtotalAfterDiscount',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => Boolean(data?.couponCode),
      },
    },
    {
      name: 'shippingAmount',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  admin: {
    ...defaultCollection?.admin,
    group: 'Ecommerce',
    defaultColumns: ['id', 'createdAt', 'status', 'amount', 'paymentMethod', 'couponCode', 'customer'],
  },
})
