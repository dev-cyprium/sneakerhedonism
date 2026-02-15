import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { Field } from 'payload'

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
      name: 'trackingCode',
      type: 'text',
      label: 'Tracking Code',
      admin: {
        position: 'sidebar',
        condition: (data) =>
          data?.orderStatus === 'shipped' ||
          data?.orderStatus === 'delivered' ||
          Boolean(data?.trackingCode),
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
          Boolean(data?.trackingCode),
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
      ({ data }) => {
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
    afterChange: [...(defaultCollection.hooks?.afterChange ?? []), sendOrderEmails],
  },
  admin: {
    ...defaultCollection?.admin,
    group: 'Ecommerce',
    defaultColumns: ['id', 'createdAt', 'orderStatus', 'amount', 'currency', 'customer'],
  },
})
