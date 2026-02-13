import type { GlobalConfig } from 'payload'

export const EccSettings: GlobalConfig = {
  slug: 'ecc-settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Ecommerce',
    description: 'ECC (eCommerceConnect) payment gateway configuration for card payments.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Display Title',
      defaultValue: 'Plaćanje karticom',
      admin: {
        description: 'Shown to customers at checkout.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      defaultValue: 'Visa, MasterCard, Dina',
      admin: {
        description: 'Payment method description shown at checkout.',
      },
    },
    {
      name: 'merchantId',
      type: 'text',
      required: true,
      label: 'Merchant ID',
      admin: {
        description: 'Bank-assigned merchant identifier.',
      },
    },
    {
      name: 'terminalId',
      type: 'text',
      required: true,
      label: 'Terminal ID',
      admin: {
        description: 'Bank-assigned terminal identifier.',
      },
    },
    {
      name: 'currency',
      type: 'text',
      required: true,
      defaultValue: '941',
      label: 'Currency Code',
      admin: {
        description: 'ISO 4217 numeric currency code. 941 = RSD.',
      },
    },
    {
      name: 'delay',
      type: 'select',
      defaultValue: '1',
      label: 'Transaction Mode',
      options: [
        { label: 'Pre-authorization (1)', value: '1' },
        { label: 'Direct capture (0)', value: '0' },
      ],
      admin: {
        description: '1 = pre-authorization, 0 = direct capture.',
      },
    },
    {
      name: 'gatewayUrl',
      type: 'text',
      required: true,
      label: 'Gateway URL',
      admin: {
        description: 'Bank payment gateway endpoint URL.',
      },
    },
    {
      name: 'locale',
      type: 'text',
      defaultValue: 'sr',
      label: 'Locale',
      admin: {
        description: 'Language locale for the bank payment page.',
      },
    },
  ],
}
