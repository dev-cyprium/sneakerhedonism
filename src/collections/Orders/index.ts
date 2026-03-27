import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { Field } from 'payload'

import {
  revalidateStorefrontAfterChange,
  revalidateStorefrontAfterDelete,
} from '@/collections/hooks/revalidateStorefront'
import { sendOrderEmails } from './hooks/sendOrderEmails'

export const OrdersCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  fields: [
    ...(defaultCollection.fields ?? []).map((field): Field => {
      // Hide the plugin's default `status` field from admin — we use `orderStatus` instead
      if ('name' in field && field.name === 'status') {
        return {
          ...field,
          admin: {
            ...(field as any).admin,
            hidden: true,
          },
        } as Field
      }
      return field
    }),
    {
      name: 'orderStatus',
      type: 'select',
      label: 'Order Status',
      defaultValue: 'processing',
      options: [
        { label: 'Processing', value: 'processing' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'serbianPostTrackingCode',
      type: 'text',
      label: 'Posta Srbije Tracking Code',
      admin: {
        position: 'sidebar',
        description:
          'Enter the Posta Srbije tracking code. The tracking link will be generated automatically in emails.',
        condition: (data) =>
          data?.orderStatus === 'shipped' ||
          data?.orderStatus === 'delivered' ||
          Boolean(data?.serbianPostTrackingCode) ||
          Boolean(data?.trackingCode),
      },
    },
    {
      name: 'trackingCode',
      type: 'text',
      label: 'Tracking Code (legacy)',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) =>
          data?.orderStatus === 'shipped' ||
          data?.orderStatus === 'delivered' ||
          Boolean(data?.trackingCode) ||
          Boolean(data?.serbianPostTrackingCode),
      },
    },
    {
      name: 'carrier',
      type: 'text',
      label: 'Carrier',
      admin: {
        position: 'sidebar',
        condition: (data) =>
          data?.orderStatus === 'shipped' ||
          data?.orderStatus === 'delivered' ||
          Boolean(data?.trackingCode) ||
          Boolean(data?.serbianPostTrackingCode),
      },
    },
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
    {
      name: 'emailsSent',
      type: 'array',
      label: 'Emails Sent',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => Boolean(data?.emailsSent?.length),
      },
      fields: [
        { name: 'type', type: 'text' },
        { name: 'to', type: 'text' },
        { name: 'sentAt', type: 'date' },
        { name: 'error', type: 'text' },
      ],
    },
  ],
  hooks: {
    ...(defaultCollection.hooks ?? {}),
    beforeChange: [
      ...(defaultCollection.hooks?.beforeChange ?? []),
      ({ data, operation, originalDoc }) => {
        if (!data) return data

        const hasSerbianTrackingCode = Object.prototype.hasOwnProperty.call(
          data,
          'serbianPostTrackingCode',
        )

        if (hasSerbianTrackingCode) {
          const normalizedTrackingCode =
            typeof data.serbianPostTrackingCode === 'string'
              ? data.serbianPostTrackingCode.trim()
              : ''

          data.serbianPostTrackingCode = normalizedTrackingCode
          data.trackingCode = normalizedTrackingCode

          if (normalizedTrackingCode) {
            data.carrier = 'Pošta Srbije'
          } else if (
            operation === 'update' &&
            typeof originalDoc?.carrier === 'string' &&
            originalDoc.carrier === 'Pošta Srbije'
          ) {
            data.carrier = ''
          }
        }

        const hasLegacyTrackingCode = Object.prototype.hasOwnProperty.call(data, 'trackingCode')

        if (!hasSerbianTrackingCode && hasLegacyTrackingCode) {
          const normalizedLegacyTrackingCode =
            typeof data.trackingCode === 'string' ? data.trackingCode.trim() : ''

          data.trackingCode = normalizedLegacyTrackingCode

          if (normalizedLegacyTrackingCode) {
            data.serbianPostTrackingCode = normalizedLegacyTrackingCode
          }
        }

        // Sync orderStatus → plugin status field
        if (data?.orderStatus) {
          switch (data.orderStatus) {
            case 'processing':
            case 'confirmed':
              data.status = 'processing'
              break
            case 'shipped':
            case 'delivered':
              data.status = 'completed'
              break
            case 'cancelled':
              data.status = 'cancelled'
              break
          }
        }
        return data
      },
    ],
    afterChange: [
      ...(defaultCollection.hooks?.afterChange ?? []),
      sendOrderEmails,
      revalidateStorefrontAfterChange,
    ],
    afterDelete: [...(defaultCollection.hooks?.afterDelete ?? []), revalidateStorefrontAfterDelete],
  },
  admin: {
    ...defaultCollection?.admin,
    group: 'Ecommerce',
    defaultColumns: ['id', 'createdAt', 'orderStatus', 'amount', 'currency', 'customer'],
  },
})
